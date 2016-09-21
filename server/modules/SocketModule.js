var socketio = require('socket.io');
var SocketHandleModule = require('./SocketHandleModule.js');

var SocketController = function(server) {
	this.io = new socketio(server);
}

module.exports = SocketController;

SocketController.prototype.onConnected = function(next) {
	var io = this.io;

	io.on('connection', function(socket){
		// next(socket);
		console.log('client connected:' + socket.id);
		var SocketHandle = new SocketHandleModule();
	});
}

SocketController.prototype.onDisconnected = function(next) {
	var io = this.io;

	io.on('disconnection', function(socket){
		next(socket);
	});
}

SocketController.prototype.onReconnected = function(next) {
	var io = this.io;

	io.on('reconnection', function(socket){
		next(socket);
	});
}