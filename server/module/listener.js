var CronJob = require('cron').CronJob;
var dateFormat = require('dateformat');

var ListenerModule = function(io) {
	this.io = io;
	this.listenRedisMsg();
}

module.exports = ListenerModule;

ListenerModule.prototype.listenRedisMsg = function() {
	var io = this.io;

	var job = new CronJob({
		cronTime: '*/10 * * * * *',
		onTick: function() {
			var now = new Date();
			now = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
			console.log('listening redis msg.    ' + now);
			handleRedisMsgs(io);
		},
		start: false,
		timeZone: 'Asia/Shanghai'
	});
	job.start();
}

var UserRedisModule = require('./user_redis.js');
var UserRedis = new UserRedisModule();

var MsgRedisModule = require('./msg_redis.js');
var MsgRedis = new MsgRedisModule();

var MsgDbModule = require('./msg_db.js');
var MsgDb = new MsgDbModule();

var handleRedisMsgs = function(io) {
	MsgRedis.getIds(function(error, Ids) {
		if (error) {
			console.log(error);
			return;
		}

		if (Ids.length > 0) {
			for (var i = 0; i < Ids.length; i++) {
				var msgid = Ids[i];
				MsgRedis.getDetail(msgid, function(error, msg) {
					if (error) {
						// continue;

					} else {
						trySendMsg(msg, io);
					}
				});
			}
		}
	});
}

var trySendMsg = function(msg, io) {
	var createAt = new Date(msg.createAt);
	var create_ts = createAt.getTime();
	var now = new Date();
	var now_ts = now.getTime();
	var dis = now_ts - create_ts;
	dis = dis / 1000;

	//one day
	if (dis > 86400 * 1) {
		MsgRedis.remove(msg.msgid, function(error, data) {
			if (error) {
				// TODO
				return;
			}

			MsgDb.updateStatus(msg.msgid, 2, function(error, data) {
				if (error) {
					// TODO
					return;
				}
			});
		});

	} else {
		UserRedis.isOnline(msg.receiver, function(error, data) {
			if (error) {
				// TODO
				return;
			}

			var sid = data.sid;
			msg.content = JSON.parse(msg.content);
			io.to(sid).emit('newMsg', msg);
		});
	}
}