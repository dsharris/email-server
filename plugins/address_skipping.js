exports.register = function () {
	this.load_config();
	this.register_hook('rcpt', 'test_block', -100);
	this.register_hook('data_post', 'test_resend', 10);
}

exports.load_config = function () {
	let config = this.config.get('address_config.json', () => {
		this.loginfo('---------------------------');
		this.loginfo('address_config.json changed');
		this.loginfo('---------------------------');
		this.load_config.apply(this);
	});

	this.block = config.block.map(address => address.toLowerCase());
	this.resend = config.resend.map(address => address.toLowerCase());
	this.domains = config.domains.map(address => address.toLowerCase());

	this.resend_address = {
		user: config.resend_address.user,
		host: config.resend_address.host
	};

	this.loginfo('------------------------------');
	this.loginfo(`Address Skipping Config Loaded`);
	this.loginfo('------------------------------');
}

exports.test_block = function (next, connection, params) {
	var ToDomain = params[0].original_host.toLowerCase();
	var ToAddress = `${params[0].user}@${params[0].original_host}`.toLowerCase();

	connection.system_log.add(`To: ${params[0]}`).set('to', ToAddress);

	if (this.block.indexOf(ToAddress) > -1) {
		this.loginfo('--------------------------------------');
		this.loginfo(`Skipping Address ${ToAddress} :: block`);
		this.loginfo('--------------------------------------');
		connection.system_log.add(`Skipped Address: ${ToAddress} :: block`).set('block', true).save();
		return next(DENY, "Skipped Address");
	}

	if (this.domains.indexOf(ToDomain) == -1) {
		this.loginfo('---------------------------------------');
		this.loginfo(`Skipping Address ${ToAddress} :: domain`);
		this.loginfo('---------------------------------------');
		connection.system_log.add(`Skipped Address: ${ToAddress} :: domain`).set('block', true).save();
		return next(DENY, "Skipped Address");
	}

	this.loginfo('----------------------------');
	this.loginfo(`Passing Address ${ToAddress}`);
	this.loginfo('----------------------------');
	connection.system_log.add(`Passed Address: ${ToAddress}`).set('block', false);

	return next(OK);
}

exports.test_resend = function(next, connection) {
	var ToAddress = `${connection.transaction.rcpt_to[0].user}@${connection.transaction.rcpt_to[0].original_host}`.toLowerCase();

	if (this.resend.indexOf(ToAddress) > -1) {
		connection.relaying = true;
		connection.transaction.rcpt_to[0].user = this.resend_address.user;
		connection.transaction.rcpt_to[0].host = this.resend_address.host;
		connection.transaction.rcpt_to[0].original_host = this.resend_address.host;

		connection.system_log.add(`Resending Address: ${ToAddress} => ${connection.transaction.rcpt_to}`).set('resend', true);

		this.loginfo('--------------------------------------------------------------------');
		this.loginfo(`Resending Address: ${ToAddress} => ${connection.transaction.rcpt_to}`);
		this.loginfo('--------------------------------------------------------------------');
	} else {
		// this sill skip delivery later in the process
		connection.system_log.set('resend', false);
		connection.relaying = false;

		this.loginfo('-----------------------');
		this.loginfo(`Setting Resend to FALSE`);
		this.loginfo('-----------------------');
	}

	return next(CONT);
}