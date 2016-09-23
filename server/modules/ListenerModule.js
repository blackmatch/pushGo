var CronJob = require('cron').CronJob;
var socketio = require('socket.io');

var MsgModule = require('./MsgModule.js');

var ListenerModule = function(){
	// this.io = new socketio(server);
	this.listenRedisMsg();
}

module.exports = ListenerModule;

ListenerModule.prototype.listenRedisMsg = function() {
	var io = this.io;
	var Msg = new MsgModule(io);

	var job = new CronJob({
		cronTime: '*/10 * * * * *',
		onTick: function() {
			console.log('listening redis msg.    ' + new Date());
			Msg.sendMsgsFromRedis();
		},
		start: false,
		timeZone: 'Asia/Shanghai'
	});
	job.start();
}