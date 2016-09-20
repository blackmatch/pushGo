var redis = require('redis');
var redisClient = redis.createClient();
redisClient.on('error', function(err) {
	console.log('connect to redis failed:' + err);
});

var MsgRedis = function() {

};
module.exports = MsgRedis;


MsgRedis.prototype.sendMsg = function(msg, next) {

}