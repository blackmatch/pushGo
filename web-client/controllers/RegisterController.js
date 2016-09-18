app.controller('RegisterController', ['$scope', '$http', '$state', function ($scope, $http, $state) {

    $scope.data = {
        username:'',
        password:''
    }
    
    $scope.register = function () {
        if ($scope.data.username.length > 0 && $scope.data.password.length > 0) {
            var userInfo = {
                username:$scope.data.username,
                password:CryptoJS.MD5($scope.data.password).toString()
            }

            $http.post('http://localhost:3000/register',userInfo).then(function (resp) {
                if (resp.data.status === 'OK') {
                    alert('register succeed!')
                    $state.go('login');

                } else {
                    alert('sorry,register failed!');
                }

            }, function (error) {

            });
        }
    }

}])