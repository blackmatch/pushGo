var EventProxy = require('eventproxy');
var tool = require('../tool/myTool.js');
var myTool = new tool();

var UserController = require('./userController.js');
var UserManager = new UserController();

var MsgController = function(io) {
	this.io = io;
}

module.exports = MsgController;

MsgController.prototype.sendMsgBySocket = function(msg, next) {
	var io = this.io;
	UserManager.isOnline(msg.receiver, function(error, response){
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
			io.to(sid).emit('newMsg', msg);
			var result = {
				msg: 'msg has been sent.'
			}
			next(null, result);
		}

	});
}