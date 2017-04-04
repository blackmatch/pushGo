var multer = require('multer');
var upload = multer(); // for parsing multipart/form-data

var API = function(io, app) {
	this.io = io;
	this.app = app;

	//init all apis
	this.userLogin();
	this.user();
	this.msgSend();
}

module.exports = API;

var UserRedisModule = require('./user_redis.js');
var UserRedis = new UserRedisModule();

var MsgRedisModule = require('./msg_redis.js');
var MsgRedis = new MsgRedisModule();

var UserDbModule = require('./user_db.js');
var UserDb = new UserDbModule();

var MsgDbModule = require('./msg_db.js');
var MsgDb = new MsgDbModule();

API.prototype.userLogin = function() {
	var app = this.app;

	app.post('/user/login', upload.array(), function(req, res) {

		var userInfo = {
			username: req.body.username,
			password: req.body.password
		}

		UserDb.checkLogin(userInfo, function(error, data) {
			if (error) {
				var result = {
					status: 'ERROR',
					msg: error.msg
				}
				res.send(result);
				return;
			}

			var result = {
				status: 'OK',
				msg: 'login successfully.',
				data: data.userInfo
			}
			res.send(result);
		});

	});
}

API.prototype.user = function() {
	var app = this.app;
	app.get('/user', function(req, res) {
		UserDb.getUsers(null, function(error, response) {
			if (error) {
				var err = {
					status: 'ERROR',
					msg: error.msg
				}
				res.send(err);
				return;
			}

			var result = {
				status: 'OK',
				data: response.data
			}
			res.send(result);
		});
	});
}

API.prototype.msgSend = function() {
	var app = this.app;
	var io = this.io;

	app.post('/msg', upload.array(), function(req, res) {
		var msg = req.body;

		MsgDb.add(msg, function(error, db_msg) {
			if (error) {
				console.log(error);
				var err = {
					status: 'ERROR',
					msg: 'database error.'
				}
				res.send(err);
				return;
			}

			UserRedis.isOnline(db_msg.receiver, function(error, data) {
				if (error) {
					MsgRedis.add(db_msg, function(error, data) {
						if (error) {
							//TODO

						}
					});
					var err = {
						status: 'OK',
						msg: 'waiting to send.'
					}
					res.send(err);
					return;
				}
				var sid = data.sid;
				db_msg.content = JSON.parse(db_msg.content);
				io.to(sid).emit('newMsg', db_msg);

				var err = {
					status: 'OK',
					msg: 'msg have been sent.'
				}
				res.send(err);
			});
		});
	});
}