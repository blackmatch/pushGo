var mysql = require('mysql');
var uuid = require('node-uuid');
var Config = require('../config.js');
var Tool = require('../utils/tool.js');
var dateFormat = require('dateformat');

var configModule = new Config();
var mysqlConfig = configModule.mysql;
var myTool = new Tool();

var EncryptorModule = require('../utils/encryptor.js');
var Encryptor = new EncryptorModule();

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

UserDb.prototype.checkLogin = function (data, callback) {
	if (myTool.isEmptyString(data.username) || myTool.isEmptyString(data.password)) {
		var err = {
			msg: 'lack of params.'
		}
		callback(err);
		return;
	}

	var sql = 'select * from user where username=? and password=?';
	connection.query(sql, [data.username, data.password], function(error, rows) {
		if (error) {
			var err = {
				msg: 'database error.'
			}
			callback(err);
			return;
		}

		if (rows.length > 0) {
			var info = rows[0];
			delete info['password'];

			var result = {
				userInfo: info
			}

			//generate a token on every login
			var now = (new Date()).getTime();
			var token = Encryptor.rsaEncrypt(info.uid + '+' + now);
			connection.query('update user set token=? where uid=?', [token,info.uid], function(error, rows){

			});
			callback(null, result);

		} else {
			var err = {
				msg: 'wrong username or password.'
			}
			callback(err);
		}

	});
}

UserDb.prototype.getDetail = function(uid, callback) {
	if (myTool.isEmptyString(uid)) {
		var err = {
			msg: 'lack of uid'
		}
		callback(err);
		return;
	}

	var sql = 'select * from user where uid=?';
	connection.query(sql, [uid], function(error, rows) {
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
			delete newInfo['password'];
			var result = {
				userInfo: newInfo
			}
			callback(null, result);

		} else {
			var err = {
				msg: 'invalid uid.'
			}
			callback(err);
		}

	});
}

UserDb.prototype.add = function(user, callback) {
	var required = ['username', 'password'];
	var all = ['uid', 'username', 'nickname', 'password', 'createAt', 'token'];

	if (!myTool.isValidParams(user, required, all)) {
		var err = {
			msg: 'params error.'
		}
		callback(err);
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
			callback(err);
			return;
		}

		sql = 'select * from user where uid=?';
		connection.query(sql, [uid], function(error, rows) {
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
					msg: 'create user ok.',
					userInfo: newInfo
				}
				callback(null, result);

			} else {
				var err = {
					msg: 'database error.'
				}
				callback(err);

			}
		});
	});
}

UserDb.prototype.getUsers = function(params, callback) {
	var sql = 'select * from user';
	connection.query(sql, function(error, rows){
		if (error) {
			var err = {
				msg: 'database error.'
			}
			callback(err);
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
			callback(null, result);

		} else {
			var result = {
				msg: 'no users.',
				data: []
			}
			callback(null, result);
		}
	});
}