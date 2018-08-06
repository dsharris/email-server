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