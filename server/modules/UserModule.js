var redis = require('redis');
var redisClient = redis.createClient();
redisClient.on('error', function(err) {
	console.log('connect to redis failed:' + err);
});

var EventProxy = require('eventproxy');
var tool = require('../tool/myTool.js');
var myTool = new tool();

var mysql = require('mysql');
var Config = require('../config.js');
var configModule = new Config();
var mysqlConfig = configModule.mysql;
var connection = mysql.createConnection({
	host: mysqlConfig.host,
	user: mysqlConfig.username,
	password: mysqlConfig.password,
	database: mysqlConfig.database,
	timezone: mysqlConfig.timezone
});
connection.connect();

var UserController = function() {

}

module.exports = UserController;

UserController.prototype.isOnline = function(uid, next) {
	var ep = new EventProxy();
	ep.all('checkUid', 'checkSid', function(checkUid, checkSid) {
		console.log(checkUid);
		if (checkUid.error || checkSid.error) {
			var err = {
				msg: 'redis error or user if offline.'
			}
			next(err);

		} else {
			var result = {
				msg: 'user is online.',
				sid: checkUid.sid
			}

			next(null, result);
		}
	});

	redisClient.hget('UidToSid', uid, function(error, sid) {
		if (error) {
			var result = {
				error: 'redis error.'
			}
			ep.emit('checkUid', result);
			ep.emit('checkSid', result);
			return;
		}

		if (myTool.isEmptyString(sid)) {
			var result = {
				error: 'uid is empty.'
			}
			ep.emit('checkUid', result);
			ep.emit('checkSid', result);

		} else {
			var result = {
				sid: sid,
				msg: 'user is online.'
			}
			ep.emit('checkUid', result);

			redisClient.hget('SidToUid', sid, function(error, uid) {
				if (error) {
					var result = {
						error: 'redis error.'
					}
					ep.emit('checkSid', result);
					return;
				}

				if (myTool.isEmptyString(uid)) {
					var result = {
						error: 'sid is empty.'
					}
					ep.emit('checkSid', result);

				} else {
					var result = {
						uid: uid,
						msg: 'user is online.'
					}
					ep.emit('checkSid', result);
				}
			});
		}

	});
}

UserController.prototype.login = function(data, next) {
	if (myTool.isEmptyString(data.username) || myTool.isEmptyString(data.password)) {
		var err = {
			msg: 'lack of params.'
		}
		next(err);
		return;
	}

	var sql = 'select * from user where username=? and password=?';
	connection.query(sql, [data.username, data.password], function(error, rows){
		if (error) {
			var err = {
				msg: 'database error.'
			}
			next(err);
			return;
		}

		if (rows.length > 0) {
			var info = rows[0];
			delete info['password'];

			var result = {
				userInfo: info
			}
			next(null, result);

		} else {
			var err = {
				msg: 'wrong username or password.'
			}
			next(err);
		}

	});
}
















