var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var mysql = require('./model/mysql.js');
var redis = require('./model/redis.js');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); // for parsing multipart/form-data

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

io.on('connection', function(socket) {
	console.log('user connected:' + socket.id);

	//waiting client send auth msg
	socket.on('authentication', function(data) {
		var uid = data.uid;
		if (uid) {
			// redis.checkLogin(uid, function(data) {
			// 	if (data.status === 'OK') {
			// 		socket.emit("authenticated", {
			// 			status: 'OK'
			// 		});
			// 		pushEventListener(socket);
			// 		eventReceivedListener(socket);
			// 		redis.addOnlineUser(socket.id, uid);

			// 	} else {
			// 		socket.emit("authenticated", {
			// 			status: 'FAILED'
			// 		});
			// 	}
			// });
			var info = {
				uid: uid
			}
			mysql.checkUser(info, function(data) {
				if (data.status === 'OK') {
					redis.addOnlineUser(socket.id, uid);
					socket.emit('authenticated', data.data);
					eventReceivedListener(socket);

				} else {
					socket.emit('auth-failed', data);
				}
			});
		}
	});

	//when one user disconnect
	socket.on('disconnect', function() {
		console.log('user disconnected:' + socket.id);
		redis.removeOnlineUser(socket.id);
	});

});

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
		var eid = data.eid;
		console.log(data);
		if (eid) {
			mysql.eventReceived(eid, function(result) {

			});
			redis.removeEvent(eid);
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
			event.eid = result.data.eid;
			redis.addEvent(event);
			redis.getSocketIDByUid(event.receiver, function(rresult) {
				if (rresult.status === 'OK') {

					io.to(rresult.sid).emit('eventMsg', result.data);
					var response = {
						status: 'OK',
						message: 'push has pushed.'
					}

					res.send(response);
				}
			});
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

var handleEventWithId = function(eid) {
	redis.getEventDetail(eid,function(data){
		if (data && data.receiver) {
			// console.log(data);
			var now = new Date();
			var nowSecs = now.getTime();
			var addSecs = data.createAt;
			var temp = nowSecs - addSecs;
			data.eid = eid;

			if (temp > 10) {
				// var tries = data.tries;
				// tries = (parseInt(tries))++;
				//update tries

				redis.getSocketIDByUid(data.receiver, function(resp){
					if (resp.status === 'OK') {
						var sid = resp.sid;
						io.to(sid).emit('eventMsg',data);
					}
				});
			}
		}
	});
}

var handleEvent = function() {
	redis.getEventList(function(data){
		if (data) {
			for (var i in data) {
				var eid = data[i];
				handleEventWithId(eid);
			}
		}

	});
}

var timeTask = function() {
	var CronJob = require('cron').CronJob;
	var job = new CronJob({
		cronTime: '*/10 * * * * *',
		onTick: function() {
			/*
			 * Runs every weekday (Monday through Friday)
			 * at 11:30:00 AM. It does not run on Saturday
			 * or Sunday.
			 */
			console.log(new Date());
			handleEvent();
		},
		start: false,
		timeZone: 'America/Los_Angeles'
	});
	job.start();
}
timeTask();