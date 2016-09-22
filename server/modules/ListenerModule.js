var CronJob = require('cron').CronJob;

var ListenerModule = function(){
	this.listenRedisMsg();
}

module.exports = ListenerModule;

ListenerModule.prototype.listenRedisMsg = function() {
	var job = new CronJob({
		cronTime: '*/10 * * * * *',
		onTick: function() {
			console.log('listening redis msg.    ' + new Date());
		},
		start: false,
		timeZone: 'Asia/Shanghai'
	});
	job.start();
}