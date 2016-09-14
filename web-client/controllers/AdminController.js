app.controller('AdminController', ['$scope', '$http', function($scope, $http) {

	$scope.push = function() {
		var event = {
			sender: 'admin',
			receiver: '20927a2c-1250-402f-9b25-2b5752b7aebe',
			content: 'hello',
			uid: '20927a2c-1250-402f-9b25-2b5752b7aebe'
		}

		$http.post('http://localhost:3000/pushEvent', event).then(function(resp) {
			console.log(resp.data);

		}, function(error) {
			console.log(error);
		});
	}

}])