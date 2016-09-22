var tool = require('../tool/myTool.js');
var myTool = new tool();

var UserModule = require('./UserModule.js');
var User = new UserModule();

var UserRedisModule = require('../model/userRedis.js');
var UserRedis = new UserRedisModule();

var MsgModule = require('./MsgModule.js');

var SocketHandleController = function(socket) {
	this.socket = socket;

	//listen socket events
	this.onAuthentication();
	this.onNewMsg();
	this.onDisconnect();
}

module.exports = SocketHandleController;

SocketHandleController.prototype.onAuthentication = function(next) {
	var socket = this.socket;
	var self = this;

	socket.on('authentication', function(data){
		User.auth(data, function(error, response){
			if (error) {
				self.emitAuthFailed();
				return;
			}

			if (!myTool.isEmptyString(response.userInfo.uid) && !myTool.isEmptyString(socket.id)) {
				UserRedis.add(response.userInfo.uid, socket.id, function(error, response){
					if (error) {
						self.emitAuthFailed();
						return;
					}

					self.emitAuthenticated();
				});
			}
		});
	});
}

SocketHandleController.prototype.emitAuthenticated = function(next) {
	var socket = this.socket;

	var result = {
		msg: 'auth ok.'
	}
	socket.emit('authenticated', result);
}

SocketHandleController.prototype.emitAuthFailed = function(next) {
	var socket = this.socket;

	var result = {
		msg: 'auth failed.'
	}
	socket.emit('auth-failed', result);
}

SocketHandleController.prototype.emitNewMsg = function(msg, next) {
	var socket = this.socket;

	socket.emit('new-msg', msg);
}

SocketHandleController.prototype.onNewMsg = function(next) {
	var socket = this.socket;
	var Msg = new MsgModule(socket);

	socket.on('newMsg', function(msg){
		console.log(JSON.stringify(msg));
		Msg.sendMsgBySocket(msg.msg, function(error){
			if (error) {
				console.log(error.msg);
			}
		});
	});
}

SocketHandleController.prototype.onDisconnect = function(next) {
	var socket = this.socket;

	socket.on('disconnect', function(){
		UserRedis.remove(socket.id, function(error, response){
			if (error) {
				// console.log(error.msg);
				return;
			}

			// console.log(response.msg);
		});
	});
}