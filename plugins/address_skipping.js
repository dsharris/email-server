exports.register = function () {
	this.load_config();
	this.register_hook('rcpt', 'test_block', -100);
	this.register_hook('data_post', 'test_resend', 10);
}

exports.load_config = function () {
	let plugin = this;
	let config = this.config.get('config.json', function () {
		this.loginfo('-------------------');
		this.loginfo('config.json changed');
		this.loginfo('-------------------');
		console.log(123);
		plugin.load_config();
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

	if (this.block.indexOf(ToAddress) > -1) {
		this.loginfo('--------------------------------------');
		this.loginfo(`Skipped Address: ${ToAddress} :: block`);
		this.loginfo('--------------------------------------');
		return next(DENY, "Skipped Address");
	}

	if (this.domains.indexOf(ToDomain) == -1) {
		this.loginfo('---------------------------------------');
		this.loginfo(`Skipped Address: ${ToAddress} :: domain`);
		this.loginfo('---------------------------------------');
		return next(DENY, "Skipped Address");
	}

	this.loginfo('--------------------------------------');
	this.loginfo(`Passed Address: ${ToAddress}`);
	this.loginfo('--------------------------------------');
	return next(OK);
}

exports.test_resend = function(next, connection) {
	var ToAddress = `${connection.transaction.rcpt_to[0].user}@${connection.transaction.rcpt_to[0].original_host}`.toLowerCase();

	if (this.resend.indexOf(ToAddress) > -1) {
		connection.relaying = true;
		connection.transaction.rcpt_to[0].user = this.resend_address.user;
		connection.transaction.rcpt_to[0].host = this.resend_address.host;
		connection.transaction.rcpt_to[0].original_host = this.resend_address.host;

		this.loginfo('----------------------------------------');
		this.loginfo(`Resending Address: ${ToAddress} => ${connection.transaction.rcpt_to}`);
		this.loginfo('----------------------------------------');
	} else {
		connection.relaying = false;
		this.loginfo('----------------------------');
		this.loginfo(`Mail Delivery Skipped`);
		this.loginfo('----------------------------');
	}

	return next(OK);
}