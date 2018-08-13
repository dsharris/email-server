var skip;
this.config.get('skipped.emails', function (skipped) {
	skip = skipped;
	console.log(skipped);
});

exports.hook_rcpt = function (next, connection, params) {
	var rcpt = params[0];
	if (skip.indexOf(rcpt.user + "@" + rcpt.original_host) > -1) {
		return next(DENY, "Skipped Expired Address");
	}

	rcpt.user = 'georgelaughalot';
	rcpt.host = 'gmail.com';
	rcpt.original_host = 'gmail.com';

	return next();
}