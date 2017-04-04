app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider
        .otherwise('/login');

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: "templates/login.html",
            controller: "LoginController",
        })
        .state('admin', {
            url: '/admin',
            templateUrl: "templates/admin.html",
            controller: "AdminController",
        })
        .state('register', {
            url: '/register',
            templateUrl: "templates/register.html",
            controller: "RegisterController",
        })
        .state('home', {
            url: '/home',
            templateUrl: "templates/home.html",
            controller: "HomeController",
        })
        

}]);
