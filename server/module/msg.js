var EventProxy = require('eventproxy');

var tool = require('../utils/tool.js');
var myTool = new tool();


var MsgRedisModule = require('./user_redis.js');
var MsgRedis = new MsgRedisModule()


var MsgModule = function(io) {
	this.io = io;
}

module.exports = MsgModule;

MsgModule.prototype.sendMsgBySocket = function(msg, callback) {
	var io = this.io;

	//check user online
	User.isOnline(msg.receiver, function(error, data) {
		if (error) {
			callback(error);
			return;
		}

		var sid = data.sid;
		io.to(sid).emit('newMsg', msg);
		var result = {
			msg: 'msg has been sent.'
		}
		callback(null, result);
	});
}

MsgModule.prototype.msgReceived = function(msg, callback) {
	MsgDb.updateStatus(msg.msgid, 1, function(error, response) {
		if (error) {
			console.log(error);
		}
	});

	MsgRedis.remove(msg.msgid, function(error, response) {
		if (error) {
			console.log(error);
		}
	});
}

MsgModule.prototype.sendMsgsFromRedis = function() {
	var self = this;
	var io = this.io;

	console.log(444);

	MsgRedis.msgList(function(error, msgs) {
		if (error) {
			console.log(error);
			return;
		}

		console.log(msgs);
		for (var i in msgs) {
			var msgid = msgs[i];
			console.log(msgid);
			MsgRedis.msgDetail(msgid, function(error, msg) {
				if (error) {
					console.log(error);

				} else {
					//check user online
					console.log(msg);
					User.isOnline(msg.receiver, function(error, response) {
						if (!error) {
							console.log(666);
							var sid = response.sid;
							msg.content = JSON.parse(msg.content);
							// io.to(sid).emit('newMsg', msg);
						} else {
							console.log(error);
						}
					});
				}
			});
		}
	});
}