var mysql = require('mysql');
var uuid = require('node-uuid');
var config = require('../config.js')().mysql;
var dateFormat = require('dateformat');
var redis = require('./redis.js');
var encryptor = require('../tool/encryptor.js');

var connection = mysql.createConnection({
	host: config.host,
	user: config.username,
	password: config.password,
	database: config.database,
	timezone: config.timezone
});

connection.connect();

// module.exports = DataBaseOperation;

// function DataBaseOperation(){

// }

exports.addEvent = function(data, callback) {

	var response = {};
	if (!data.receiver || !data.content) {
		response = {
			status: 'ERROR',
			message: 'lack of params.'
		}

		callback(response);
		return;
	}

	var eventid = uuid.v4();
	var keys = ['eventid'];
	var values = [eventid];
	for (var key in data) {
		keys.push(key);
		values.push(data[key]);
	}

	var sql = 'insert into event(';

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

	var query = connection.query(sql, values, function(err, rows) {
		if (err) {
			console.log(err);
			response = {
				status: 'ERROR',
				message: 'database error.'
			}

			callback(response);
			// connection.end();

		} else {

			sql = 'select * from event where eventid=?';
			connection.query(sql, [eventid], function(error, rows) {
				if (error) {
					console.log(error);
					return;
				}

				if (rows.length > 0) {
					var info = rows[0];
					console.log('mysql:' + JSON.stringify(info));
					response = {
						status: 'OK',
						data: info
					}
					callback(response);
				}

			});
		}

	});
}

exports.eventReceived = function(eventid, callback) {

	var sql = 'update event set receiveAt=?,status=1 where eventid=?';
	var query = connection.query(sql, [new Date(), eventid], function(err, rows) {
		if (err) {
			console.log(err);
			response = {
				status: 'ERROR',
				message: 'database error.'
			}

			callback(response);

		} else {
			response = {
				status: 'OK',
				eventid: eventid
			}

			callback(response);
		}

	});
}

exports.updateEvent = function(eventid, data, callback) {

	var sql = "update event set ";

	for (var key in data) {
		sql += key + '=' + data[key] + ',';
	}

	sql = sql.substring(0, sql.length - 1);

	sql += "where eventid='" + eventid + "'";

	var query = connection.query(sql, function(err, rows) {
		if (err) {
			console.log(err);
			response = {
				status: 'ERROR',
				message: 'database error.'
			}

			callback(response);

		} else {
			response = {
				status: 'OK',
				eventid: eventid
			}

			callback(response);
		}

	});
}

exports.addUser = function(data, callback) {
	var uid = uuid.v4();
	var sql = 'insert into user(uid,username,password) values(?,?,?)';

	var values = [uid, data.username, data.password];

	connection.query(sql, values, function(error, rows) {

		var errorResp = {
			status: 'ERROR',
			msg: 'database error.'
		}

		if (error) {
			callback(errorResp);
			return;
		}

		sql = "select * from user where uid='" + uid + "'";
		connection.query(sql, function(error, rows) {
			if (error) {
				callback(errorResp);
				return;
			}

			var info = rows[0];
			var succeedResp = {
				status: 'OK',
				data: info
			}

			callback(succeedResp);

		});

	});
}

exports.userLogin = function(data, callback) {
	if (!data.username || !data.password) {
		var errorRes = {
			status: 'ERROR',
			msg: 'lack of params.'
		}
		callback(errorRes);
		return;
	}

	var sql = "select * from user where username=? and password=?";
	var query = connection.query(sql, [data.username, data.password], function(error, rows) {
		if (error) {
			var errorRes = {
				status: 'ERROR',
				msg: 'data base error.'
			}
			callback(errorRes);
			return;
		}

		if (rows.length === 0) {
			var errorRes = {
				status: 'ERROR',
				msg: 'user name or password error.'
			}
			callback(errorRes);

		} else {
			var succeedRes = {
				status: 'OK',
				data: rows[0]
			}
			callback(succeedRes);
		}
	});
}

exports.checkUser = function(data, callback) {
	if (!data.uid) {
		var errorRes = {
			status: 'ERROR',
			msg: 'lack of params.'
		}
		callback(errorRes);
		return;
	}

	var sql = "select * from user where uid=?";
	var query = connection.query(sql, [data.uid], function(error, rows) {
		if (error) {
			var errorRes = {
				status: 'ERROR',
				msg: 'data base error.'
			}
			callback(errorRes);
			return;
		}

		if (rows.length === 0) {
			var errorRes = {
				status: 'ERROR',
				msg: 'user not exists.'
			}
			callback(errorRes);

		} else {
			var succeedRes = {
				status: 'OK',
				data: rows[0]
			}
			callback(succeedRes);
		}
	});
}

exports.getFailedEvents = function(receiver, callback) {
	if (receiver) {
		var sql = 'select * from event where receiver=? and status=2';
		connection.query(sql, [receiver], function(err, rows) {
			if (err) {
				callback();
				return;
			}

			callback(rows);

		});

	} else {
		callback();
	}
}

exports.updateEventStatus = function(eventid, status, callback) {

	var sql = 'update event set status=';
	var now = new Date();
	now = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
	switch (status) {
		case 1:
			{
				sql += '1,receiveAt=? where eventid=?';
				var q = connection.query(sql, [now, eventid], function(err, rows) {
					if (err) {
						console.log(err);
						return;
					}
				});
				break;
			}
		case 2:
			{
				sql += '2 where eventid=?';
				connection.query(sql, [eventid], function(err, rows) {
					if (err) {
						console.log(err);
						return;
					}
				});
				break;
			}
		case 3:
			{
				sql += '3,readAt=? where eventid=?';
				connection.query(sql, [now, eventid], function(err, rows) {
					if (err) {
						console.log(err);
						return;
					}
				});
				break;
			}
	}
}

exports.addUserToken = function(data, callback) {
	var errorResponse = {
		status: 'ERROR',
		msg: 'add token failed.'
	}

	var successResponse = {
		status: 'OK',
		msg: 'add token ok.'
	}

	if (!data || !data.token || !data.uid) {
		callback(errorResponse);
		return;
	}

	var sql = 'update user set token=? where uid=?';
	connection.query(sql, [data.token, data.uid], function(err, rows) {
		if (err) {
			callback(errorResponse);
			return;
		}

		callback(successResponse);
	});
}

exports.validateUserToken = function(data, callback) {
	var errorResponse = {
		status: 'ERROR',
		msg: 'check token failed.'
	}

	var successResponse = {
		status: 'OK',
		msg: 'check token ok.'
	}

	if (!data || !data.token || !data.uid) {
		callback(errorResponse);
		return;
	}

	var sql = 'select token from user where uid=?';
	connection.query(sql, [data.uid], function(err, rows) {
		if (err) {
			console.log(err);
			callback(errorResponse);
			return;
		}

		var token = rows[0].token;
		var dec = encryptor.decrypt(token);
		var uid = dec.split('+')[0];

		if (uid === data.uid) {
			callback(successResponse);

		} else {
			callback(errorResponse);
		}
		
	});
}

exports.getAllUsers = function(uid, callback) {
	var sql = 'select uid,username from user';

	connection.query(sql, function(err, rows){
		if (err) {
			console.log(err);
			var response = {
				status: 'ERROR',
				msg: 'database error.'
			}
			callback(response);
			return;
		}

		var response = {
			status: 'OK',
			data: rows
		}

		callback(response);
	});
}