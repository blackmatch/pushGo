var EventProxy = require('eventproxy');
var tool = require('../tool/myTool.js');
var myTool = new tool();

var UserModule = require('./UserModule.js');
var User = new UserModule();

// var MsgModule = function(io) {
// 	this.io = io;
// }

var MsgModule = function(socket) {
	this.socket = socket;
}

module.exports = MsgModule;

MsgModule.prototype.sendMsgBySocket = function(msg, next) {
	// var io = this.io;
	var socket = this.socket;

	User.isOnline(msg.receiver, function(error, response){
		if (error) {
			var err = {
				msg: 'check user online failed.'
			}
			next(err);
			return;
		}

		//send msg
		var sid = response.sid;
		if (myTool.isEmptyString(sid)) {
			var err = {
				msg: 'sid is empty.'
			}
			next(err);

		} else {
			// io.to(sid).emit('newMsg', msg);
			socket.to(sid).emit('newMsg', msg);
			var result = {
				msg: 'msg has been sent.'
			}
			next(null, result);
		}

	});
}