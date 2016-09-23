var socketio = require('socket.io');
var SocketHandleModule = require('./SocketHandleModule.js');
var EventProxy = require('eventproxy');

var UserRedisModule = require('../model/userRedis.js');
var UserRedis = new UserRedisModule();

var SocketModule = function(server) {
	this.io = new socketio(server);
	this.onConnected();
}

module.exports = SocketModule;

SocketModule.prototype.onConnected = function() {
	var io = this.io;

	var ep = new EventProxy();
	ep.after('remove', 1, function(data) {
		io.on('connection', function(socket) {
			var SocketHandle = new SocketHandleModule(socket);
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
	})
}

SocketModule.prototype.onDisconnected = function(next) {
	var io = this.io;

	io.on('disconnection', function(socket) {
		next(socket);
	});
}

SocketModule.prototype.onReconnected = function(next) {
	var io = this.io;

	io.on('reconnection', function(socket) {
		next(socket);
	});
}