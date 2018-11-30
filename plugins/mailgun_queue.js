const mailgun = require('mailgun-js');
var MailParser = require("mailparser-mit").MailParser;

exports.register = function () {
	this.load_config();
	this.register_hook('queue', 'relay');
}

exports.load_config = function () {
	let config = this.config.get('mailgun_config.json', () => {
		this.loginfo('---------------------------');
		this.loginfo('mailgun_config.json changed');
		this.loginfo('---------------------------');
		this.load_config.apply(this);
	});

	this.api_key = config.key;
	this.api_domain = config.domain;

	this.Mailgun = mailgun({
		apiKey: this.api_key,
		domain: this.api_domain
	});
}

exports.relay = function(next, connection) {
	ParseMail(this, connection, (email_object) => {
		var data = {
			from: `${email_object.from[0].name} <${email_object.from[0].address}>`,
			to: email_object.to.map(to => `${to.name} <${to.address}>`).join(', '),
			subject: email_object.subject,
			text: email_object.text,
			html: email_object.html,
		};

		if (email_object.cc)
			data.cc = email_object.cc.map(cc => `${cc.name} <${cc.address}>`).join(', ');

		if(email_object.bcc)
			data.bcc = email_object.bcc.map(bcc => `${bcc.name} <${bcc.address}>`).join(', ');

		this.Mailgun.messages().send(data, (error, body) => {
			this.loginfo('-------------------');
			this.loginfo('-------------------');
			this.loginfo(`${error} :: ${body}`);
			this.loginfo('-------------------');
			this.loginfo('-------------------');
		});
	})
}

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