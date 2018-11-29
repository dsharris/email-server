var skip = [
	"tacobell@dsharris.org",
	"godaddy@dsharris.org",
	"sales@dsharris.org"
];

var acceptable = [
	"dsharris.org",
	"dsharris.io"
]

exports.hook_rcpt = function (next, connection, params) {
	var rcpt = params[0];
	this.loginfo("Got recipient: " + rcpt);

	if (acceptable.indexOf(rcpt.original_host) == -1) {
		this.loginfo("Skipped Address: " + "@" + rcpt.original_host);
		return next(DENY, "Skipped Address");
	}

	if (skip.indexOf(rcpt.user + "@" + rcpt.original_host) > -1) {
		this.loginfo("Skipped Address: " + rcpt.user + "@" + rcpt.original_host);
		return next(DENY, "Skipped Address");
	}

	rcpt.user = 'georgelaughalot';
	rcpt.host = 'gmail.com';
	rcpt.original_host = 'gmail.com';

	return next();
}