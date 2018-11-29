exports.register = function () {
	this.load_config();
	this.register_hook('rcpt', 'test_address');
}

exports.load_config = function () {
	let config = this.config.get('config.json', this.load_config);
	this.skip_addresses = config.skip.map(address => address.toLowerCase());
	this.loginfo('--------------------------------------');
	this.loginfo(' Successfully loaded skip list !!! ');
	this.loginfo('--------------------------------------');
	this.loginfo(this.skip_addresses.join(', '));
	this.loginfo('--------------------------------------');
}

exports.test_address = function (next, connection, params) {
	var rcpt = params[0];
	var ToAddress = `${rcpt.user}@${rcpt.original_host}`;
	this.loginfo('--------------------------------------');
	this.loginfo(`Got recipient: ${ToAddress}`);
	this.loginfo('--------------------------------------');

	if (this.skip_addresses.indexOf(ToAddress.toLowerCase()) > -1) {
		this.loginfo(`Skipped Address: ${ToAddress}`);
		this.loginfo('--------------------------------------');
		return next(DENY, "Skipped Address");
	}

	this.loginfo(`Passed Address: ${ToAddress}`);
	this.loginfo('--------------------------------------');

	return next();
}