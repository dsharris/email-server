exports.hook_rcpt = function (next, connection, params) {
	var rcpt = params[0];
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	this.loginfo(JSON.stringify(rcpt));
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	rcpt.user = 'georgelaughalot';
	rcpt.host = 'gmail.com';
	rcpt.original_host = 'gmail.com';
	this.loginfo(JSON.stringify(rcpt));
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	this.loginfo('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
	next();
}