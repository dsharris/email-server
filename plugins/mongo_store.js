const AttachmentsPath = "/opt/attachments";

var ObjectID = require('mongodb').ObjectID;
var async = require('async');
var uuid = require('uuid');
var fs = require('fs-extra');
var path = require('path');
var MailParser = require("mailparser-mit").MailParser;

exports.register = function () {
	this.load_config();
	this.register_hook('init_master', 'initialize_mongodb');
	this.register_hook('init_child', 'initialize_mongodb');

	this.register_hook('data', 'enable_transaction_body_parse');
	this.register_hook('data_post', 'queue_to_mongodb');
}

exports.load_config = function () {
	let config = this.config.get('mongo_config.json');

	this.mongo_url = config.url;
	this.mongo_db_name = 'dsharris';

	this.loginfo('---------------------');
	this.loginfo(`MongoDB Config Loaded`);
	this.loginfo('---------------------');
}

exports.initialize_mongodb = function (next, server) {
	if ( ! server.notes.mongodb ) {
		require('mongodb').MongoClient.connect(this.mongo_url, { useNewUrlParser: true })
		.then(database => {
			server.notes.mongodb = database.db(this.mongo_db_name);
			this.loginfo('-------------------------------------- ');
			this.loginfo(` Successfully connected to MongoDB:${this.mongo_db_name} `);
			this.loginfo('-------------------------------------- ');
			next();
		}).catch(err => {
			this.logerror('ERROR connecting to MongoDB !!!');
			this.logerror(err);
			throw err;
		})
	} else {
		this.loginfo('There is already a MongoDB connection in the server.notes !!!');
		next();
	}

};

// Hook for data
exports.enable_transaction_body_parse = function (next, connection) {
	connection.transaction.parse_body = true;
	next();
};

// Hook for queue-ing
exports.queue_to_mongodb = function (next, connection) {
	this.logdebug('------------------------');
	this.logdebug(' Storage Engine Started ');
	this.logdebug('------------------------');
	var plugin = this;
	var body = connection.transaction.body;

	ParseMail(plugin, connection, (email_object) => {

		var _email = {
			'from': email_object.from,
			'to': email_object.to,
			'cc': email_object.cc,
			'bcc': email_object.bcc,
			'subject': email_object.subject,
			'message_id': email_object.messageId || new ObjectID() + '@haraka',
			'attachments': email_object.attachments || [],
			'html': email_object.html,
			'text': email_object.text,
			'processed': false,
			'timestamp': new Date(),
			'references' : email_object.references || [],
			'deleted' : false,
			'type': 'inbox'
		};

		if (!!connection.transaction.rcpt_to && connection.transaction.rcpt_to.length > 0) {
			let rcpt = connection.transaction.rcpt_to[0];
			_email.rcpt_to = `${rcpt.user}@${rcpt.host}`;
		}

		if (!!email_object.inReplyTo && email_object.inReplyTo.length > 0)
			_email.in_reply_to = email_object.inReplyTo[0];
		else
			_email.in_reply_to = false;

		server.notes.mongodb.collection('messages').insertOne(_email)
			.then(done => {
				this.logdebug('---------------------------------');
				this.logdebug(' Successfully stored the message ');
				this.logdebug('---------------------------------');
				connection.system_log.add(' Successfully stored the email ');
				next(CONT);
			})
			.catch(err => {
				this.logdebug('------------------------');
				this.logdebug(` ERROR ON INSERT ${err} `);
				this.logdebug('------------------------');
				connection.system_log.add('ERROR ON INSERT : ', err).save();
				next(DENY, "storage error");
			});
	});

};


exports.shutdown = () => server.notes.mongodb.close();

function ParseMail(plugin, connection, cb) {
	var mailparser = new MailParser({
		'streamAttachments': false
	});
	mailparser.on("end", function(mail) {
		if ( mail.attachments ) {
			StoreAttachments(connection, plugin, mail.attachments, mail, function(error, mail_object) {
				return cb(mail_object);
			});
		}
		else {
			return cb(mail);
		}
	});
	connection.transaction.message_stream.pipe(mailparser, {});
}

// Attachment code
function StoreAttachments(connection, plugin, attachments, mail_object, cb) {

	var _attachments = [];

	async.each(attachments, function (attachment, each_callback) {

		plugin.loginfo('Begin storing attachment : ');

		// Path to attachments dir
		var attachments_folder_path = AttachmentsPath;

		// if there's no checksum for the attachment then generate our own uuid
		attachment.checksum = attachment.checksum || uuid.v4();
		var attachment_checksum = attachment.checksum;

		// if generatedFileName is longer than 200
		if (attachment.generatedFileName && attachment.generatedFileName.length > 200) {
			let _filename_new = attachment.generatedFileName.split('.');
			let _fileExt = _filename_new.pop();
			let _filename_pop = _filename_new.pop();
			let _filename_200 = S(_filename_pop).left(200).s;
			let _final = _filename_200 + '.' + _fileExt;

			attachment = {
				contentType : attachment.contentType || '',
				fileName : _final,
				generatedFileName : _final,
				transferEncoding : attachment.transferEncoding || '',
				contentId : attachment.contentId || '',
				contentDisposition : attachment.contentDisposition || '',
				checksum : attachment_checksum,
				length : attachment.length || '',
				content : attachment.content || ''
			};
		}

		var attachment_directory = path.join(attachments_folder_path, attachment_checksum);

		fs.mkdirp(attachment_directory, function (error, result) {
			// if we have an error, and it's not a directory already exists error then record it
			if (error && error.errno != -17) {
				plugin.logerror('Could not create a directory for storing the attachment !!!');
				return each_callback;
			}

			// Complete local path with the filename
			var attachment_full_path = path.join(attachment_directory, attachment.generatedFileName);

			// Log
			plugin.loginfo(`Storing ${attachment.generatedFileName} locally at ${attachment_full_path}`);

			// Write attachment to disk
			fs.writeFile(attachment_full_path, attachment.content, function (error) {
				// Log
				if (error) plugin.logerror(`Error saving attachment locally to path ${attachment_full_path}, error :`, error);

				plugin.loginfo(`Attachment ${attachment.generatedFileName} successfully stored locally (${attachment.length} bytes)`);

				if (attachment.generatedFileName.toLowerCase() === 'winmail.dat') {
					plugin.loginfo('found winmail.dat ... not sure what to do here');
				} else {
					delete attachment.content;
					_attachments.push(attachment);
					return each_callback(null);
				}

			});
		});
	},
	function (error) {
		// Add attachment back to mail object
		mail_object.attachments = _attachments;
		// Log
		plugin.loginfo( `finished uploading all ${_attachments.length} attachments` );
		// Callback
		return cb(null, mail_object);
	});

}
