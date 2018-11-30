exports.register = function () {
	this.loginfo('-----------------------');
	this.loginfo(`SystemLog Plugin Loaded`);
	this.loginfo('-----------------------');
	this.register_hook('mail', 'init_log', -100);
}

const SystemLog = function (db, log) {
	let Data = {
		to: false,
		logs: [],
		info: {},
		from: false,
		start: new Date(),
		block: false,
		resent: false
	};

	this.add = (msg) => {
		Data.logs.push(msg);
		return this;
	}

	this.set = (key, val) => {
		// reserved items
		if (key == 'end') return this;
		if (key == 'logs') return this;
		if (key == 'info') return this;
		if (key == 'start') return this;

		if (typeof Data[key] != 'undefined')
			Data[key] = val;
		else
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
	var FromAddress = `${params[0].user}@${params[0].original_host}`.toLowerCase();

	connection.system_log = connection.system_log || new SystemLog(server.notes.mongodb, this.loginfo);
	connection.system_log.add(`FROM: ${params[0]}`).set('from', FromAddress);

	this.loginfo('------------------');
	this.loginfo('Systemlog Attached');
	this.loginfo('------------------');

	return next(OK);
}