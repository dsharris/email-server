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

	this.loginfo('---------------------');
	this.loginfo(`Mailgun Config Loaded`);
	this.loginfo('---------------------');

	this.Mailgun = mailgun({
		apiKey: this.api_key,
		domain: this.api_domain
	});
}

exports.relay = function(next, connection) {
	this.logdebug('-------------');
	this.logdebug('Mailgun Relay');
	this.logdebug('-------------');

	if (!connection.resend_confirmed) {
		this.logdebug('---------------');
		this.logdebug('Resend Skipped ');
		this.logdebug('---------------');

		connection.system_log.add('Delivery Skipped').save();
		return next(OK);
	}

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
			connection.system_log.add('Delivery Complete')
				.add(`Error: ${JSON.stringify(error)}`)
				.add(`Body: ${JSON.stringify(body)}`)

			if (!!error) {
				connection.system_log.set('mg_err', JSON.stringify(error));
				connection.system_log.set('mg_success', false);
			} else {
				connection.system_log.set('mg_err', false);
				connection.system_log.set('mg_success', JSON.stringify(body));
			}

			connection.system_log.save();

			this.logdebug('------------');
			this.logdebug('Mailgun Sent');
			this.logdebug('------------');
			return next(OK);
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