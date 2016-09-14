var app = angular.module('push',['ui.router', 'ngCookies', 'btford.socket-io']);

app.factory('socket', function (socketFactory) {
  return socketFactory({
    // prefix: 'foo~',
    ioSocket: io.connect('http://localhost:3000')
  });
});