var SocketIO = require('socket.io');
var EventProxy = require('eventproxy');

//customs
var SocketHandlerModule = require('./socket_handler.js');
var ListenerModule = require('./listener.js');

var UserRedisModule = require('./user_redis.js');
var UserRedis = new UserRedisModule();

var APIModule = require('./api.js');

var SocketModule = function(server, app) {
	var self = this;

	var ep = new EventProxy();
	ep.after('remove', 1, function(data) {
		self.io = new SocketIO(server);
		self.onConnected();

		//init other modules
		var Listener = new ListenerModule(self.io);
		var API = new APIModule(self.io, app);
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

module.exports = SocketModule;

SocketModule.prototype.onConnected = function() {
	var io = this.io;

	io.on('connection', function(socket) {
		var SocketHandler = new SocketHandlerModule(socket);
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