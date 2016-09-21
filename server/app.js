var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); // for parsing multipart/form-data

var app = express();
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
var server = http.createServer(app);
server.listen(3000, function(req, res) {
	console.log('app is running on port 3000.');
});

/* ===================== custom modules begin ===================== */
// var SocketHandleModule = require('./modules/SocketHandleModule.js');
// var SocketHandle = new SocketHandleModule();

var SocketModule = require('./modules/SocketModule.js');
var Socket = new SocketModule();

var UserModule = require('./modules/UserModule.js');
var User = new UserModule();

/* ===================== custom modules end ===================== */

/* ===================== express api begin ===================== */
app.post('/user/register', upload.array(), function(req, res) {
	var userInfo = req.body;
});

app.post('/user/login', upload.array(), function(req, res) {

	var userInfo = {
		username: req.body.username,
		password: req.body.password
	}

	User.login(userInfo, function(error, response) {
		if (error) {
			var result = {
				status: 'ERROR',
				msg: error.msg
			}
			res.send(result);
			return;
		}

		var result = {
			status: 'OK',
			msg: 'login successfully.',
			data: response.userInfo
		}
		res.send(result);
	});

});

app.post('/msg/send', upload.array(), function(req, res) {

});

/* ===================== express api end ===================== */