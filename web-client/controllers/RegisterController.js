app.controller('RegisterController', ['$scope', '$http', function ($scope, $http) {

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
                    console.log('register success!');

                } else {
                    console.log('register failed!');
                    alert('sorry,register failed!');
                }

            }, function (error) {

            });
        }
    }

}])