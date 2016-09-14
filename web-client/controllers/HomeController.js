app.controller('HomeController', ['$scope', '$http', 'socket', '$cookies', function ($scope, $http, socket, $cookies) {
	
	$scope.data = {
		events:[]
	}

	var uid = $cookies.get('apple');
	socket.on('connect', function(){
		console.log('connected!');
		var info = {
			uid: uid
		}
		socket.emit('authentication', info);
	});

	socket.on('disconnect', function(){
		console.log('disconnected!');
	});

	socket.on('reconnect', function(){
		console.log('reconnected!');
	});

	socket.on('authenticated', function(data){
		console.log('auth ok.');
	});

	socket.on('auth_failed', function(data){
		console.log('auth failed!');
	});

	socket.on('eventMsg', function(data){
		$scope.data.events.push(data);
		socket.emit('eventReceived', data);
	});

}])