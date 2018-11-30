exports.register = function () {
	this.register_hook('mail', 'init_log', -100);
}

const SystemLog = function (db, log) {
	let Data = {
		logs: [],
		info: {},
		start: new Date()
	};

	this.add = (msg) => {
		Data.logs.push(msg);
		return this;
	}

	this.set = (key, val) => {
		if (key == 'to') {
			Data.to = val;
			return this;
		}
		if (key == 'from') {
			Data.from = val;
			return this;
		}

		Data.info[key] = val;
		return this;
	}

	this.save = () => {
		Data.end = new Date();
		return db.collection('logs').insertOne(Data).then(done => {
			log(Log);
		});
	}

	return this;
}

exports.init_log = function (next, connection, params) {
	connection.system_log = connection.system_log || new SystemLog(server.notes.mongodb, this.loginfo);
	connection.system_log.add(`FROM: ${params[0]}`).set('from', params[0]);
	this.loginfo('------------------');
	this.loginfo('Systemlog Attached');
	this.loginfo('------------------');

	return next(OK);
}