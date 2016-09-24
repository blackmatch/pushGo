var SocketIO = require('socket.io');
var EventProxy = require('eventproxy');

//customs
// var UserModule = require('./user.js');
// var MsgModule = require('msg.js');
var SocketHandlerModule = require('./socket_handler.js');
var ListenerModule = require('./listener.js');

var UserRedisModule = require('./user_redis.js');
var UserRedis = new UserRedisModule();

var SocketModule = function (server) {
  	this.io = new SocketIO(server);
  	this.onConnected();

  	//init other modules
  	// var User = new UserModule(this.io);
  	// var Msg = new MsgModule(this.io);
  	var Listener = new ListenerModule(this.io);
}
module.exports = SocketModule;

SocketModule.prototype.onConnected = function() {
	var io = this.io;

	var ep = new EventProxy();
	ep.after('remove', 1, function(data) {
		io.on('connection', function(socket) {
			var SocketHandler = new SocketHandlerModule(socket);
		});
	});

	UserRedis.removeAll(function(error, response) {
		if (error) {
			ep.emit('remove', {
				msg: 'error'
			});
			return;
		}

		ep.emit('remove', {
			msg: 'ok'
		});
	});
}

SocketModule.prototype.onDisconnected = function(callback) {
	var io = this.io;

	io.on('disconnection', function(socket) {
		callback(socket);
	});
}

SocketModule.prototype.onReconnected = function(callback) {
	var io = this.io;

	io.on('reconnection', function(socket) {
		callback(socket);
	});
}