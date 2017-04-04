
var tool = require('../utils/tool.js');
var myTool = new tool();
var EncryptorModule = require('../utils/encryptor.js');
var Encryptor = new EncryptorModule();

var UserRedisModule = require('./user_redis.js');
var UserRedis = new UserRedisModule();

var MsgRedisModule = require('./msg_redis.js');
var MsgRedis = new MsgRedisModule();

var UserDbModule = require('./user_db.js');
var UserDb = new UserDbModule();

var MsgDbModule = require('./msg_db.js');
var MsgDb = new MsgDbModule();

var SocketHandleController = function(socket) {
	console.log('client connected:' + socket.id);
	this.socket = socket;

	//listen socket events
	this.onAuthentication();
	this.onMsgReceived();
	this.onDisconnect();
}

module.exports = SocketHandleController;

SocketHandleController.prototype.onAuthentication = function(callback) {
	var socket = this.socket;
	var self = this;

	socket.on('authentication', function(data){
		var token = data.token;
		var decrypted = Encryptor.rsaDecrypt(token);
		var uid = decrypted.split('+')[0];
		console.log('uid:' + uid);
		UserDb.getDetail(uid, function(error, data){
			if (error) {
				console.log(error);
				return;
			}

			console.log('auth ok.');
			UserRedis.add(uid, socket.id, function(error, data){
				if (error) {
					console.log(error);
					return;
				}

				console.log('add user to redis ok.');
				self.onNewMsg();
			});

			MsgDb.getNeedToSendMsgs(uid, function(error, msgs){
				if (error) {
					console.log(error);
					return;
				}

				for (var i = 0; i < msgs.length; i++) {
					var msg = msgs[i];
					socket.emit('newMsg', msg);
				}
			});

		});
	});
}

SocketHandleController.prototype.emitAuthenticated = function(callback) {
	var socket = this.socket;

	var result = {
		msg: 'auth ok.'
	}
	socket.emit('authenticated', result);
}

SocketHandleController.prototype.emitAuthFailed = function(callback) {
	var socket = this.socket;

	var result = {
		msg: 'auth failed.'
	}
	socket.emit('auth-failed', result);
}

SocketHandleController.prototype.emitNewMsg = function(msg, callback) {
	var socket = this.socket;

	socket.emit('newMsg', msg);
}

SocketHandleController.prototype.onNewMsg = function() {
	var socket = this.socket;

	socket.on('newMsg', function(msg){
		MsgDb.add(msg, function(error, db_msg){
			if (error) {
				console.log(error);
				return;
			}

			UserRedis.isOnline(db_msg.receiver, function(error, data){
				if (error) {
					MsgRedis.add(db_msg, function(error, data){
						if (error) {
							//TODO
						}
					});
					return;
				}
				var sid = data.sid;
				db_msg.content = JSON.parse(db_msg.content);
				socket.to(sid).emit('newMsg', db_msg);
			});
		});
	});
}

SocketHandleController.prototype.onMsgReceived = function() {
	var socket = this.socket;

	socket.on('msgReceived', function (msg) {
		MsgDb.updateStatus(msg.msgid, 1, function (error, data) {
			if (error) {
				console.log(error);
				return;
			}

			MsgRedis.remove(msg.msgid, function (error, data) {
				if (error) {
					console.log(error);
					return;
				}
			});
		});
	});
}

SocketHandleController.prototype.onDisconnect = function(callback) {
	var socket = this.socket;

	socket.on('disconnect', function(){
		console.log('client disconnected:' + socket.id);
		UserRedis.remove(socket.id, function(error, response){
			if (error) {
				console.log(error.msg);
				return;
			}

			// console.log(response.msg);
		});
	});
}