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
                var uid = resp.data.data.uid;
                var now = new Date();
                $cookies.put('apple', uid, {
                    expire: now.setDate(now.getDate() + 1)
                });

                socket = io.connect('http://localhost:3000');

                socket.on('connect', function() {
                    socket.emit('authentication', {
                        uid: resp.data.data.uid
                    });
                    socket.on('authenticated', function(data) {
                        if (data.status === 'OK') {
                            console.log('connected!');

                        } else {
                            console.log('auth failed!');
                        }

                    });


                    socket.on('pushEvent', function(data) {
                        console.log('receive event:' + JSON.stringify(data));
                        socket.emit('eventReceived', {
                            eid: data.eid
                        });
                    });


                });

            } else {
                alert(resp.data.msg);
            }

        }, function(error) {

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