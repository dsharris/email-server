exports.register = function () {
	this.load_config();
	this.register_hook('rcpt', 'test_address');
}

exports.load_config = function () {
	let config = this.config.get('config.json', this.load_config);
	this.skip_addresses = config.skip.map(address => address.toLowerCase());
	this.loginfo('--------------------------------------');
	this.loginfo(' Address Skipping List Loaded ');
	this.loginfo('--------------------------------------');
	this.loginfo(this.skip_addresses.join(', '));
	this.loginfo('--------------------------------------');
}

exports.test_address = function (next, connection, params) {
	var ToAddress = `${params[0].user}@${params[0].original_host}`;

	if (this.skip_addresses.indexOf(ToAddress.toLowerCase()) > -1) {
		this.loginfo('--------------------------------------');
		this.loginfo(`Skipped Address: ${ToAddress}`);
		this.loginfo('--------------------------------------');
		return next(DENY, "Skipped Address");
	}

	this.loginfo('--------------------------------------');
	this.loginfo(`Passed Address: ${ToAddress}`);
	this.loginfo('--------------------------------------');
	return next(OK);
}