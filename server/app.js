var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var mysql = require('./model/mysql.js');
var redis = require('./model/redis.js');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); // for parsing multipart/form-data
var dateformat = require('dateformat');
var NodeRSA = require('node-rsa');
var encryptor = require('./tool/encryptor.js');

var app = express();
var server = http.createServer(app);
var io = new socketio(server);


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

server.listen(3000, function(req, res) {
	console.log('app is running on port 3000.');
});

// process.env.TZ = 'Europe/Amsterdam';

io.on('connection', function(socket) {
	console.log('client connected:' + socket.id);

	//waiting client send auth msg
	socket.on('authentication', function(data) {
		var uid = data.uid;
		var encrypted = data.tt;
		// console.log('encrypted: ' + encrypted);
		// var key = new NodeRSA();
		// key.setOptions({encryptionScheme: 'pkcs1'});
		// var key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n' +
		// 	'MIICXQIBAAKBgQC+qTxcyz4WYmIGnF/ro0xlJ1373xT1mJgCP9QhY3UVRP8z4IYV\n' +
		// 	'09R7dSKNCtCgKHacRp23epTR/FcLNXr4CsIw5tEBL6I88A8yZeZNfgyLgMWA7y5o\n' +
		// 	'afFY8K9G+IYTuynmlUfQIf4+Q68lMc+N7wn7c7HPHhLNb1irL0cJFNms7wIDAQAB\n' +
		// 	'AoGATexbCE3kvT9Ocwc8SNE/6uOxDLz7EvlfvyOZLmA4vQ2rA+fSxV8DK8YO7fgq\n' +
		// 	'lhqTh4Fw+kk2Q7BPXvxnmrLC9IZUMUTNCaoc/xdWSY4E4jhgvd0787Vk3WEdby3r\n' +
		// 	'GyuptkcoSZpPoCiZ5v5L+5TGD71cj5nIwSxkcmPfJ9F4rkkCQQDwfF7BPgjXZyzh\n' +
		// 	'Id1dbfytZVf4SyutGYrcDy2Pd2RRfIM+kx5SjxXhkSdBDu6ZV0xC+fFwFRG9sD/P\n' +
		// 	'k48iAjUDAkEAyvYCN6ln0g7DgEziFtQFUXM8EfwzxPOvyIBAJNeVuWX0h33uj+mM\n' +
		// 	'ODw3iFYEqqinTR7ZbFiixDGVG9i3N1/WpQJBALLuNqpdd8Kdd90Cj2xGu6xgLTYG\n' +
		// 	'6DZhPNpDSMjoMnIWzKgwWm1fHQ66K5TSgWECfTGQOr4ETzDuBGx0BBlvvvUCQC3r\n' +
		// 	's1y8q4zPYlRpEM5xcjKXjAPVuDDboe4PdnPfgzTLaKQvTgappNwkY7wpGi0ys4ez\n' +
		// 	'byYgd9NEFKSUR//zYzECQQDg57CFNILBZtItGoDUBXWkHDfw7al7fgPjMtQU6PwZ\n' +
		// 	'o6lLEvwCgIv0ltLaxgbzBPan+0PS54Fonrq7szNgD4ic\n' +
		// 	'-----END RSA PRIVATE KEY-----');
		// keyData = '-----BEGIN RSA PRIVATE KEY-----\n' +
		// 	'MIICXQIBAAKBgQC+qTxcyz4WYmIGnF/ro0xlJ1373xT1mJgCP9QhY3UVRP8z4IYV\n' +
		// 	'09R7dSKNCtCgKHacRp23epTR/FcLNXr4CsIw5tEBL6I88A8yZeZNfgyLgMWA7y5o\n' +
		// 	'afFY8K9G+IYTuynmlUfQIf4+Q68lMc+N7wn7c7HPHhLNb1irL0cJFNms7wIDAQAB\n' +
		// 	'AoGATexbCE3kvT9Ocwc8SNE/6uOxDLz7EvlfvyOZLmA4vQ2rA+fSxV8DK8YO7fgq\n' +
		// 	'lhqTh4Fw+kk2Q7BPXvxnmrLC9IZUMUTNCaoc/xdWSY4E4jhgvd0787Vk3WEdby3r\n' +
		// 	'GyuptkcoSZpPoCiZ5v5L+5TGD71cj5nIwSxkcmPfJ9F4rkkCQQDwfF7BPgjXZyzh\n' +
		// 	'Id1dbfytZVf4SyutGYrcDy2Pd2RRfIM+kx5SjxXhkSdBDu6ZV0xC+fFwFRG9sD/P\n' +
		// 	'k48iAjUDAkEAyvYCN6ln0g7DgEziFtQFUXM8EfwzxPOvyIBAJNeVuWX0h33uj+mM\n' +
		// 	'ODw3iFYEqqinTR7ZbFiixDGVG9i3N1/WpQJBALLuNqpdd8Kdd90Cj2xGu6xgLTYG\n' +
		// 	'6DZhPNpDSMjoMnIWzKgwWm1fHQ66K5TSgWECfTGQOr4ETzDuBGx0BBlvvvUCQC3r\n' +
		// 	's1y8q4zPYlRpEM5xcjKXjAPVuDDboe4PdnPfgzTLaKQvTgappNwkY7wpGi0ys4ez\n' +
		// 	'byYgd9NEFKSUR//zYzECQQDg57CFNILBZtItGoDUBXWkHDfw7al7fgPjMtQU6PwZ\n' +
		// 	'o6lLEvwCgIv0ltLaxgbzBPan+0PS54Fonrq7szNgD4ic\n' +
		// 	'-----END RSA PRIVATE KEY-----'
		// key.importKey(keyData, 'pkcs1');
		// var decrypted = key.decrypt(encrypted, 'utf8');
		// console.log('decrypted: ' + decrypted);
		if (uid) {
			var info = {
				uid: uid,
				token: data.tt
			}

			mysql.validateUserToken(info, function(response){
				console.log(response);
			});

			// mysql.checkUser(info, function(data) {
			// 	if (data.status === 'OK') {
			// 		redis.addOnlineUser(socket.id, uid);
			// 		socket.emit('authenticated', data.data);
			// 		eventReceivedListener(socket);
			// 		handleFailedEvents(uid);

			// 	} else {
			// 		socket.emit('auth-failed', data);
			// 	}
			// });
		}
	});

	//when one user disconnect
	socket.on('disconnect', function() {
		console.log('client disconnected:' + socket.id);
		redis.removeOnlineUser(socket.id);
	});

});

// io.on('disconnect', function(socket){
// 	console.log('client disconnected:' + socket.id);
// });

var handleFailedEvents = function(uid) {
	mysql.getFailedEvents(uid, function(data) {
		if (data && data.length > 0) {
			for (var i in data) {
				var event = data[i];
				sendEvent(uid, event);
			}
		}
	});
}

var sendEvent = function(receiver, event) {
	redis.getSocketIDByUid(receiver, function(data) {
		if (data.status === 'OK' && data.sid) {
			io.to(data.sid).emit('eventMsg', event);
		}
	});
}

var pushEventListener = function(socket) {
	socket.on('pushEvent', function(data) {
		mysql.addEvent(data, function(result) {
			if (result.status === 'OK') {
				redis.getSocketIDByUid(data.receiver, function(result) {
					if (resutl.status === 'OK') {
						io.to(result.sid).emit('pushEvent', data);
					}
				});
			}
		});
	});
}

var eventReceivedListener = function(socket) {
	socket.on('eventReceived', function(data) {
		var eventid = data.eventid;
		if (eventid) {
			// mysql.eventReceived(eventid, function(result) {

			// });
			mysql.updateEventStatus(eventid, 1);
			redis.removeEvent(eventid);
		}
	});
}

app.post('/login', upload.array(), function(req, res) {

	var userInfo = {
		username: req.body.username,
		password: req.body.password
	}

	mysql.userLogin(userInfo, function(result) {
		res.send(result);
		
		var now = new Date();
		now = now.getTime().toString();
		var origin = result.data.uid + '+' + now;
		var encrypted = encryptor.encrypt(origin);
		console.log('end: ' + encrypted);
		var info = {
			uid: result.data.uid,
			token: encrypted
		}

		mysql.addUserToken(info, function(response){
			console.log(response);
		});
	});

});

app.post('/pushEvent', upload.array(), function(req, res) {

	var receiver = req.body.receiver;
	var content = req.body.content;
	var uid = req.body.uid;

	if (!receiver && !content && !uid) {
		var response = {
			status: 'ERROR',
			message: 'lack of params.'
		}

		res.send(response);
		return;
	}

	var event = {
		receiver: receiver,
		content: content,
		sender: uid
	}

	mysql.addEvent(event, function(result) {
		if (result.status === 'OK') {
			// event.eventid = result.data.eventid;
			console.log('redis:' + JSON.stringify(result.data));
			redis.addEvent(result.data);
			redis.getSocketIDByUid(event.receiver, function(rresult) {
				if (rresult.status === 'OK') {

					io.to(rresult.sid).emit('eventMsg', result.data);
					var response = {
						status: 'OK',
						message: 'push has pushed.'
					}

					res.send(response);
				} else {

					var response = {
						status: 'OK',
						message: 'waiting to  pushed.'
					}

					res.send(response);
				}

			});

		} else {

			var response = {
				status: 'ERROR',
				message: 'database error.'
			}

			res.send(response);
		}
	});

});

app.post('/register', upload.array(), function(req, res) {
	var userInfo = req.body;
	if (userInfo.username && userInfo.password) {
		mysql.addUser(userInfo, function(dbresult) {
			res.send(dbresult);
		});
	}
});

var handleEventWithId = function(eventid) {
	redis.getEventDetail(eventid, function(data) {
		if (data && data.receiver) {
			console.log('000:' + JSON.stringify(data));
			var now = new Date();
			var nowSecs = now.getTime();
			var addSecs = (new Date(data.createAt)).getTime();
			var temp = (nowSecs - addSecs) / 1000; //milliseconds -> seconds

			var tries = data.tries;

			if (temp > 10 && tries < 5) {
				redis.getSocketIDByUid(data.receiver, function(resp) {
					if (resp.status === 'OK') {
						var triesInt = parseInt(tries);
						triesInt++;
						redis.tryPushEvent(eventid, triesInt);
						var sid = resp.sid;
						console.log('send event:' + data);
						io.to(sid).emit('eventMsg', data);
					}
				});
			}

			if (tries >= 5) {
				redis.removeEvent(eventid);
				mysql.updateEventStatus(eventid, 2);
			}

		}
	});
}

var handleEvent = function() {
	redis.getEventList(function(data) {
		if (data) {
			console.log('to:' + data);
			for (var i in data) {
				var eventid = data[i];
				handleEventWithId(eventid);
			}
		}

	});
}

var timeTask = function() {
	var CronJob = require('cron').CronJob;
	var job = new CronJob({
		cronTime: '*/10 * * * * *',
		onTick: function() {
			console.log(new Date());
			handleEvent();
		},
		start: false,
		timeZone: 'Asia/Shanghai'
	});
	job.start();
}
timeTask();