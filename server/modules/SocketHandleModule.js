var SocketHandleController = function(socket) {
	this.socket = socket;
}

module.exports = SocketHandleController;

SocketHandleController.prototype.onAuthentication = function(next) {
	var socket = this.socket;

	socket.on('authentication', function(data){

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

	socket.on('new-msg', function(msg){

	});
}