exports.register = function () {
	this.load_config();
	this.register_hook('hook_rcpt', 'test_address');
}

exports.load_config = function () {
	let config = this.config.get('config.json', this.load_config);
	this.skip_addresses = config.skip.map(address => address.toLowerCase());
	this.lognotice(this.skip_addresses);
}

exports.test_address = function (next, connection, params) {
	var rcpt = params[0];
	var ToAddress = `${rcpt.user}@${rcpt.original_host}`;
	this.loginfo(`Got recipient: ${ToAddress}`);

	if (this.skip_addresses.indexOf(ToAddress.toLowerCase()) > -1) {
		this.loginfo(`Skipped Address: ${ToAddress}`);
		return next(DENY, "Skipped Address");
	}

	return next();
}