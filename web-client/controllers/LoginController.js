app.controller('LoginController', ['$scope', '$http', '$state', '$cookies', function($scope, $http, $state, $cookies) {

    $scope.data = {
        username: '',
        password: ''
    }

    $scope.login = function() {
        var userInfo = {
            username: $scope.data.username,
            password: CryptoJS.MD5($scope.data.password).toString()
        }

        $http.post('http://localhost:3000/login', userInfo).then(function(resp) {

            if (resp.data.status === 'OK') {
                var now = new Date();
                $cookies.put('apple', resp.data.data.uid, {
                    expire: now.setDate(now.getDate() + 1)
                });
                $state.go('home');

            } else {
                alert(resp.data.msg);
            }

        }, function(error) {
            alert('login failed!')
        });
    }

    $scope.checkAuth = function() {
        var uid = $cookies.get('apple');

        if (uid && uid.length === 36) {
            $state.go('home');
        }
    }
    $scope.checkAuth();

    $scope.goRegister = function() {
        $state.go('register');
    }

}]);