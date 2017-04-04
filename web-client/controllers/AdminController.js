app.controller('AdminController', ['$scope', '$http', function($scope, $http) {

	$scope.data = {
		users: []
	}

	$scope.getUsers = function () {
		$http.get('http://localhost:3000/user').then(function (response) {
			$scope.data.users = response.data.data;

		}, function (error) {

		});
	}
	$scope.getUsers();

	$scope.sendMsgTo = function (user) {
		var msg = {
			receiver: user.uid,
			content: {text: 'hi, ' + user.username}
		}

		$http.post('http://localhost:3000/msg', msg).then(function (response) {
			if (response.data.status === 'OK') {
				console.log('msg have been send.');

			} else {
				console.log('send msg failed.');
			}

		}, function (error) {
			console.log(error);
		});
	}

}])