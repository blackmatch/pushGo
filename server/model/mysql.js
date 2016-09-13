var mysql = require('mysql');
var uuid = require('node-uuid');
var config = require('../config.js')().mysql;

console.log(config);

var connection = mysql.createConnection({
	host: config.host,
	user: config.username,
	password: config.password,
	database: config.database
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

	var eid = uuid.v4();
	var keys = ['eid'];
	var values = [eid];
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
			response = {
				status: 'OK',
				eid: eid
			}

			callback(response);
			// connection.end();
		}

	});
}

exports.eventReceived = function(eid, callback) {

	var sql = "update event set received=1 ";
	sql += "where eid='" + eid + "'";

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
				eid: eid
			}

			callback(response);
		}

	});
}

exports.updateEvent = function(eid, data, callback) {

	var sql = "update event set ";

	for (var key in data) {
		sql += key + '=' + data[key] + ',';
	}

	sql = sql.substring(0, sql.length - 1);

	sql += "where eid='" + eid + "'";

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
				eid: eid
			}

			callback(response);
		}

	});
}

exports.addUser = function(data, next) {
	var uid = uuid.v4();
	var sql = 'insert into user(uid,username,password) values(?,?,?)';

	var values = [uid,data.username,data.password];

	connection.query(sql, values, function (error, rows) {

		var errorResp = {
			status:'ERROR',
			msg:'database error.'
		}

		if (error) {
			next(errorResp);
			return;
		}

		sql = "select * from user where uid='" + uid + "'";
		connection.query(sql,function(error, rows) {
			if (error) {
				next(errorResp);
				return;
			}

			var info = rows[0];
			var succeedResp = {
				status:'OK',
				data:info
			}

			next(succeedResp);

		});

	});
}

exports.userLogin = function (data, next) {
    if (!data.username || !data.password) {
        var errorRes = {
            status:'ERROR',
            msg:'lack of params.'
        }
        next(errorRes);
        return;
    }

    var sql = "select * from user where username=? and password=?";
    var query = connection.query(sql,[data.username,data.password], function (error, rows) {
        if (error) {
            var errorRes = {
                status:'ERROR',
                msg:'data base error.'
            }
            next(errorRes);
            return;
        }

		console.log(rows);

        if (rows.length === 0) {
            var errorRes = {
                status:'ERROR',
                msg:'user name or password error.'
            }
            next(errorRes);

        } else {
            var succeedRes = {
                status:'OK',
                data:rows[0]
            }
            next(succeedRes);
        }
    });

    console.log(query.sql);
}













