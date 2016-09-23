var EventProxy = require('eventproxy');
var tool = require('../tool/myTool.js');
var myTool = new tool();

var UserModule = require('./UserModule.js');
var User = new UserModule();

var MsgDbModule = require('../model/msgDb.js');
var MsgDb = new MsgDbModule();

var MsgRedisModule = require('../model/msgRedis.js');
var MsgRedis = new MsgRedisModule()

var EventProxy = require('eventproxy');

var MsgModule = function(socket) {
	this.socket = socket;
}

module.exports = MsgModule;

MsgModule.prototype.sendMsgBySocket = function(msg, next) {
	var socket = this.socket;

	var ep = new EventProxy();

	MsgDb.add(msg, function(error, addedMsg) {
		if (error) {
			next(error);
			return;
		}

		//check user online
		User.isOnline(msg.receiver, function(error, response) {
			if (error) {
				next(error);
				//user is offline
				MsgRedis.add(addedMsg, function(error, response) {
					if (error) {
						console.log(error);
						return;
					}
				});
				return;
			}

			console.log(666);
			var sid = response.sid;
			addedMsg.content = JSON.parse(addedMsg.content);
			socket.to(sid).emit('newMsg', addedMsg);
			var result = {
				msg: 'msg has been sent.'
			}
			next(null, result);
		});
	});
}

MsgModule.prototype.msgReceived = function(msg, next) {
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