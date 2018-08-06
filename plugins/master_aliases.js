exports.hook_rcpt = function (next, connection, params) {
	rcpt.user = 'georgelaughalot';
	rcpt.host = 'gmail.com';
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	this.loginfo("Host Resolved: " + rcpt);
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	next();
}