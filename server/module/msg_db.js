var mysql = require('mysql');
var uuid = require('node-uuid');
var Config = require('../config.js');
var Tool = require('../utils/tool.js');
var dateFormat = require('dateformat');

var configModule = new Config();
var mysqlConfig = configModule.mysql;
var myTool = new Tool();

var connection = mysql.createConnection({
	host: mysqlConfig.host,
	user: mysqlConfig.username,
	password: mysqlConfig.password,
	database: mysqlConfig.database,
	timezone: mysqlConfig.timezone
});
connection.connect();

var MsgDb = function() {

}

module.exports = MsgDb;

MsgDb.prototype.add = function(msg, callback) {
	var required = ['receiver', 'content'];
	var all = ['msgid', 'type', 'sender', 'receiver', 'content', 'createAt', 'senderDevice', 'receiverDevice', 'channel', 'receiverAt', 'readAt', 'status'];

	if (!myTool.isValidParams(msg, required, all)) {
		var err = {
			msg: 'params error.'
		}
		callback(err);
		return;
	}

	var msgid = uuid.v4();
	var keys = ['msgid'];
	var values = [msgid];
	for (var key in msg) {
		keys.push(key);
		if (key === 'content') {
			values.push(JSON.stringify(msg[key]));

		} else {
			values.push(msg[key]);
		}
	}

	var sql = 'insert into msg(';

	for (var i in keys) {
		sql += keys[i] + ',';
	}

	sql = sql.substring(0, sql.length - 1);
	sql += ") values(";

	for (var i in values) {
		sql += '?,';
	}

	sql = sql.substring(0, sql.length - 1);
	sql += ")";

	var query = connection.query(sql, values, function(error, rows) {
		if (error) {
			var err = {
				msg: 'insert to db failed.'
			}
			callback(err);
			return;
		}

		sql = 'select * from msg where msgid=?';
		connection.query(sql, [msgid], function(error, rows) {
			if (error) {
				var err = {
					msg: 'query inserted user failed.'
				}
				callback(err);
				return;
			}

			if (rows.length > 0) {
				var info = rows[0];
				var newInfo = {};

				for (var key in info) {
					var value = info[key];
					if (value) {
						newInfo[key] = value;
					}
				}

				callback(null, newInfo);

			} else {
				var err = {
					msg: 'query inserted user failed.'
				}
				callback(err);
			}

		});
	});
}

MsgDb.prototype.msgDetail = function(msgid, callback) {
	if (myTool.isEmptyString(msgid)) {
		var err = {
			msg: 'lack of msgid'
		}
		callback(err);
		return;
	}

	var sql = 'select * from msg where msgid=?';
	connection.query(sql, [msgid], function(error, rows) {
		if (error) {
			var err = {
				msg: 'database error.'
			}
			callback(err);
			return;
		}

		if (rows.length > 0) {
			var info = rows[0];
			var newInfo = {};
			for (var key in info) {
				var value = info[key];
				if (value) {
					newInfo[key] = value;
				}
			}

			var result = {
				msgInfo: newInfo
			}
			callback(null, result);

		} else {
			var err = {
				msg: 'invalid msgid.'
			}
			callback(err);
		}

	});
}

MsgDb.prototype.updateStatus = function(msgid, status, callback) {
	var self = this;

	var allStatus = [1, 2, 3];
	if (myTool.isEmptyString(msgid) || allStatus.indexOf(status) === -1) {
		var err = {
			msg: 'params error.'
		}
		callback(err);
		return;
	}

	var sql = 'update msg set status=';
	var now = new Date();
	now = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
	var values;
	switch (status) {
		case 1:
			{
				sql += '1,receiveAt=? where msgid=?';
				values = [now, msgid];
				break;
			}
		case 2:
			{
				sql += '2 where msgid=?';
				values = [msgid];
				break;
			}
		case 3:
			{
				sql += '3,readAt=? where msgid=?';
				values = [now, msgid];
				break;
			}
	}

	connection.query(sql, values, function(error, rows) {
		if (error) {
			var err = {
				msg: 'database error.'
			}
			callback(err);
			return;
		}

		self.msgDetail(msgid, function(error, response) {
			if (error) {
				var err = {
					msg: 'query msg detail failed.'
				}
				callback(err);
				return;
			}

			callback(null, response);
		});

	});
}

MsgDb.prototype.getNeedToSendMsgs = function(uid, callback) {
	var sql = 'select * from msg where receiver=? and (status=2 or (status=0 and (timestampadd(day, 1, createAt) < now())))';

	connection.query(sql, [uid], function(error, rows) {
		if (error) {
			var err = {
				msg: 'database error'
			}
			callback(err);
			return;
		}

		if (rows.length > 0) {
			var msgs = [];
			for (var i = 0; i < rows.length; i++) {
				var info = rows[i];
				var newInfo = {};
				for (var key in info) {
					var value = info[key];
					if (value) {
						newInfo[key] = value;
					}
				}
				newInfo.content = JSON.parse(newInfo.content);
				msgs.push(newInfo);
			}
			callback(null, msgs);

		} else {
			var err = {
				msg: 'no msg.'
			}
			callback(err);
		}
	});
}