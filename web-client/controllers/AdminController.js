app.controller('AdminController', ['$scope', '$http', function($scope, $http) {

	$scope.push = function() {
		var event = {
			sender: 'admin',
			receiver: '490d21ea-3989-4a3f-b15d-21d8ef1e9bb6',
			content: 'hello',
			uid: '490d21ea-3989-4a3f-b15d-21d8ef1e9bb6'
		}

		$http.post('http://localhost:3000/pushEvent', event).then(function(resp) {
			console.log(resp.data);

		}, function(error) {
			console.log(error);
		});
	}

}])