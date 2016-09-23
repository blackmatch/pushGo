var mysql = require('mysql');
var uuid = require('node-uuid');
var Config = require('../config.js');
var Tool = require('../tool/myTool.js');
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

var UserDb = function() {

}

module.exports = UserDb;

UserDb.prototype.userDetail = function(uid, next) {
	if (myTool.isEmptyString(uid)) {
		var err = {
			msg: 'lack of uid'
		}
		next(err);
		return;
	}

	var sql = 'select * from user where uid=?';
	connection.query(sql, [uid], function(error, rows) {
		if (error) {
			var err = {
				msg: 'database error.'
			}
			next(err);
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
			delete newInfo['password'];
			var result = {
				userInfo: newInfo
			}
			next(null, result);

		} else {
			var err = {
				msg: 'invalid msgid.'
			}
			next(err);
		}

	});
}

UserDb.prototype.add = function(user, next) {
	var required = ['username', 'password'];
	var all = ['uid', 'username', 'nickname', 'password', 'createAt', 'token'];

	if (!myTool.isValidParams(user, required, all)) {
		var err = {
			msg: 'params error.'
		}
		next(err);
		return;
	}

	var uid = uuid.v4();
	var keys = ['uid'];
	var values = [uid];
	for (var key in user) {
		keys.push(key);
		values.push(user[key]);
	}

	var sql = 'insert into user(';

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

	connection.query(sql, values, function(error, rows) {
		if (error) {
			var err = {
				msg: 'database error.'
			}
			next(err);
			return;
		}

		sql = 'select * from user where uid=?';
		connection.query(sql, [uid], function(error, rows) {
			if (error) {
				var err = {
					msg: 'database error.'
				}
				next(err);
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
					msg: 'create user ok.',
					userInfo: newInfo
				}
				next(null, result);

			} else {
				var err = {
					msg: 'database error.'
				}
				next(err);

			}
		});
	});
}

UserDb.prototype.getUsers = function(params, next) {
	var sql = 'select * from user';
	connection.query(sql, function(error, rows){
		if (error) {
			var err = {
				msg: 'database error.'
			}
			next(err);
			return;
		}
		// console.log(rows.length);
		if (rows.length > 0) {
			for (var i in rows) {
				delete rows[i]['password'];
			}

			var result = {
				msg: 'get all users ok.',
				data: rows
			}
			next(null, result);

		} else {
			var result = {
				msg: 'no users.',
				data: []
			}
			next(null, result);
		}
	});
}