app.controller('AdminController', ['$scope', '$http', function($scope, $http) {

	$scope.push = function() {
		var event = {
			sender: 'admin',
			receiver: 'e0435406-348d-4f1f-a9c2-836deb7a150a',
			content: 'hello',
			uid: 'e0435406-348d-4f1f-a9c2-836deb7a150a'
		}

		$http.post('http://localhost:3000/pushEvent', event).then(function(resp) {
			console.log(resp.data);

		}, function(error) {
			console.log(error);
		});
	}

}])