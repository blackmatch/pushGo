app.controller('LoginController', ['$scope', '$http', '$state', ' $cookies', function ($scope, $http, $state,  $cookies) {

    $scope.data = {
        username: '',
        password: ''
    }

    $scope.login = function () {
        var userInfo = {
            username: $scope.data.username,
            password: CryptoJS.MD5($scope.data.password).toString()
        }

        $http.post('http://localhost:3000/login', userInfo).then(function (resp) {
            if (resp.data.status === 'OK') {
                socket = io.connect('http://localhost:3000');

                socket.on('connect', function () {
                    console.log('first connected!');
                    socket.emit('authentication', {
                        uid: resp.data.data.uid
                    });
                    socket.on('authenticated', function (data) {
                        if (data.status === 'OK') {
                            console.log('connected!');

                        } else {
                            // socket.disconnect(true);
                            console.log('auth failed!');
                        }

                    });


                    socket.on('pushEvent', function (data) {
                        console.log('receive event:' + JSON.stringify(data));
                        socket.emit('eventReceived', {
                            eid: data.eid
                        });
                    });


                });

            }

        }, function (error) {

        });
    }

    $scope.goRegister = function () {
        $state.go('register');
    }

}]);