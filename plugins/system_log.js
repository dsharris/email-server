exports.register = function () {
	this.register_hook('mail', 'init_log', -100);
}

const SystemLog = function (db, log) {
	let Log = [];

	this.add = (msg) => {
		Log.push(msg);
		return this;
	}

	this.save = () => {
		return db.collection('logs').insertOne({
			logs: Log,
			'timestamp': new Date(),
		}).then(done => {
			log(Log);
		})
	}

	return this;
}

exports.init_log = function (next, connection, params) {
	connection.system_log = connection.system_log || new SystemLog(server.notes.mongodb, this.loginfo);
	this.loginfo('------------------');
	this.loginfo('Systemlog Attached');
	this.loginfo('------------------');

	return next(OK);
}