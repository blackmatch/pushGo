app.controller('HomeController', ['$scope', '$http', 'socket', '$cookies', function($scope, $http, socket, $cookies) {

	// $scope.data = {
	// 	msgs: [],
	// 	users: []
	// }

	var uid = $cookies.get('apple');

	// var uid = '7047d4ad-9303-499e-ae1b-1de41edd177a';
	if (uid && uid.length === 36) {
		
		var pubKey = '-----BEGIN PUBLIC KEY-----\n' +
			'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+qTxcyz4WYmIGnF/ro0xlJ137\n' +
			'3xT1mJgCP9QhY3UVRP8z4IYV09R7dSKNCtCgKHacRp23epTR/FcLNXr4CsIw5tEB\n' +
			'L6I88A8yZeZNfgyLgMWA7y5oafFY8K9G+IYTuynmlUfQIf4+Q68lMc+N7wn7c7HP\n' +
			'HhLNb1irL0cJFNms7wIDAQAB\n' +
			'-----END PUBLIC KEY-----';
		
		var encrypt = new JSEncrypt();
		encrypt.setPublicKey(pubKey);
		var now = new Date();
		now = now.getTime().toString();
		var originStr = uid + '+' + now;
		console.log('origin:' + originStr);
		var encrypted = encrypt.encrypt(originStr);

		console.log('encrypted:' + encrypted);

		socket.on('connect', function() {
			console.log('connected!');
			var info = {
				uid: uid,
				token: encrypted
			}
			socket.emit('authentication', info);
		});
	}



	// socket.on('disconnect', function() {
	// 	console.log('disconnected!');
	// });

	// socket.on('reconnect', function() {
	// 	console.log('reconnected!');
	// });

	// socket.on('authenticated', function(data) {
	// 	console.log('auth ok.');
	// });

	// socket.on('auth_failed', function(data) {
	// 	console.log('auth failed!');
	// });

	// socket.on('eventMsg', function(data) {
	// 	$scope.data.events.push(data);
	// 	socket.emit('eventReceived', data);
	// });

	socket.on('newMsg', function(msg) {
		console.log(msg);
		// $scope.data.msgs.push(msg);
		socket.emit('msgReceived', msg);
	});

	// var getAllUsers = function(){
	// 	$http.get('http://localhost:3000/user').then(function(response){
	// 		if (response.data.status === 'OK') {
	// 			$scope.data.users = response.data.data;
	// 		}

	// 	}, function(error){

	// 	});
	// }

	// getAllUsers();

	// $scope.sendToSomeone = function(user){
	// 	var msg = {
	// 		sender: uid,
	// 		receiver: user.uid,
	// 		content: {text: 'hello,' + user.username}
	// 	}

	// 	socket.emit('newMsg', msg);
	// }

	$scope.sendNewMsg = function() {
		var msg = {
			sender: '7047d4ad-9303-499e-ae1b-1de41edd177a',
			receiver: '513de81a-9c05-45e4-9dee-b5328377743e',
			content: {text: 'hi, yi'}
		}
		socket.emit('newMsg', msg);
	}
}])