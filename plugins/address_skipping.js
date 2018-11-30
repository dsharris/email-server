exports.register = function () {
	this.load_config();
	this.register_hook('rcpt', 'test_block', -100);
	this.register_hook('data_post', 'test_resend', 10);
}

exports.load_config = function () {
	let config = this.config.get('config.json', this.load_config);
	this.skip_addresses = config.skip.map(address => address.toLowerCase());

	this.block = config.block.map(address => address.toLowerCase());
	this.resend = config.resend.map(address => address.toLowerCase());
	this.domains = config.domains.map(address => address.toLowerCase());

	this.loginfo('--------------------------------------');
	this.loginfo(' Address Skipping List Loaded ');
	this.loginfo('--------------------------------------');
	this.loginfo(this.skip_addresses.join(', '));
	this.loginfo('--------------------------------------');
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

	this.loginfo('----------------------------');
	this.loginfo(`Testing Resend: ${ToAddress}`);
	this.loginfo('----------------------------');


	if (this.resend.indexOf(ToAddress) > -1) {
		this.loginfo('----------------------------------------');
		this.loginfo(`Resending Address: ${ToAddress} :: block`);
		this.loginfo('----------------------------------------');
		connection.relaying = true;
		connection.transaction.rcpt_to[0].user = 'georgelaughalot';
		connection.transaction.rcpt_to[0].host = 'gmail.com';
		connection.transaction.rcpt_to[0].original_host = 'gmail.com';

		this.loginfo(`Reset to: ${connection.transaction.rcpt_to}`);
		this.loginfo('----------------------------------------');


	}

	return next(OK);
}