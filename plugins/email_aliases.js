exports.hook_rcpt = function (next, connection, params) {
	var rcpt = params[0];
	rcpt.user = 'georgelaughalot';
	rcpt.host = 'gmail.com';
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	this.loginfo("Host Resolved: " + rcpt);
	this.loginfo("Host Replaced: georgelaughalot@gmail.com");
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	next();
}
exports.hook_get_mx = function (next, mail) {
    next(OK, "127.0.0.1:2525");
}