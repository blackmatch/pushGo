var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

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
var SocketModule = require('./module/socket.js');
var Socket = new SocketModule(server, app);
/* ===================== custom modules end ===================== */

/* ===================== express api begin ===================== */


// app.post('/user/register', upload.array(), function(req, res) {
// 	var userInfo = {
// 		username: req.body.username,
// 		password: req.body.password
// 	}

// 	UserDb.add(userInfo, function(error, response){
// 		if (error) {
// 			var result = {
// 				status: 'ERROR',
// 				msg: error.msg
// 			}
// 			res.send(result);
// 			return;
// 		}

// 		var result = {
// 			status: 'OK',
// 			msg: 'register successfully.',
// 			data: response.userInfo
// 		}
// 		res.send(result);

// 	});
// });





/* ===================== express api end ===================== */