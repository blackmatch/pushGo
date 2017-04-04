var redis = require('redis');
var redisClient = redis.createClient();
redisClient.on('error', function(err) {
	console.log('connect to redis failed:' + err);
});

var tool = require('../utils/tool.js');
var myTool = new tool();

var EventProxy = require('eventproxy');

var MsgRedis = function() {

};
module.exports = MsgRedis;


MsgRedis.prototype.add = function(msg, callback) {
	var mKey = 'msg:' + msg.msgid;
	msg.tries = 1;

	var ep1 = new EventProxy();
	var ep2 = new EventProxy();

	ep2.all('addAllHash', 'addSet', function(hash, set) {
		if (hash.status === 'OK' && set.status === 'OK') {
			var resp = {
				status: 'OK',
				msg: 'add msg to redis ok.'
			}
			callback(resp);

		} else {
			var resp = {
				status: 'ERROR',
				msg: 'add msg to redis failed.'
			}
			callback(resp);
			//TODO: do something
		}
	});

	ep1.after('addHash', Object.keys(msg).length, function(statusList) {
		for (var i in statusList) {
			var s = statusList[i];
			if (s.status !== 'OK') {
				var resp = {
					status: 'ERROR',
					msg: 'add hash error.'
				}
				ep2.emit('addAllHash', resp);
				return;
			}
		}

		var resp = {
			status: 'OK',
			msg: 'add hash ok.'
		}
		ep2.emit('addAllHash', resp);
	});

	for (var k in msg) {
		if (!myTool.isEmptyString(msg[k])) {
			redisClient.hset(mKey, k, msg[k], function(error, response) {
				if (error) {
					var resp = {
						status: 'ERROR',
						msg: 'add hash error.'
					}
					ep1.emit('addHash', resp);
					return;
				}

				var resp = {
					status: 'OK',
					msg: 'add hash ok.'
				}
				ep1.emit('addHash', resp);
			});
		}
	}

	redisClient.sadd('msgset', msg.msgid, function(error, response) {
		if (error) {
			var resp = {
				status: 'ERROR',
				msg: 'add set error.'
			}
			ep2.emit('addSet', resp);
			return;
		}

		var resp = {
			status: 'OK',
			msg: 'add set ok.'
		}
		ep1.emit('addSet', resp);
	});
}

MsgRedis.prototype.remove = function(msgid, callback) {
	if (myTool.isEmptyString(msgid)) {
		var resp = {
			status: 'ERROR',
			msg: 'lack of msgid.'
		}
		callback(resp);
		return;
	}

	var ep = EventProxy();

	ep.all('removeDetail', 'removeId', function(detailResp, idResp) {
		if (detailResp.status === 'OK' && idResp.status === 'OK') {
			var resp = {
				status: 'OK',
				msg: 'remove msg from redis ok.'
			}
			callback(resp);

		} else {
			var resp = {
				status: 'ERROR',
				msg: 'remove msg from redis failed.'
			}
			callback(resp);
		}
	});

	redisClient.del('msg:' + msgid, function(error, response) {
		if (error) {
			var resp = {
				status: 'ERROR',
				msg: 'remove msg detail failed.'
			}
			ep.emit('removeDetail', resp);
			return;
		}

		var resp = {
			status: 'OK',
			msg: 'remove msg detail ok.'
		}
		ep.emit('removeDetail', resp);
	});

	redisClient.srem('msgset', msgid, function(error, response) {
		if (error) {
			var resp = {
				status: 'ERROR',
				msg: 'remove msg id from set failed.'
			}
			ep.emit('removeId', resp);
			return;
		}

		var resp = {
			status: 'OK',
			msg: 'remove msg id from set ok.'
		}
		ep.emit('removeId', resp);
	});
}

MsgRedis.prototype.getIds = function(callback) {
	redisClient.smembers('msgset', function(error, Ids) {
		if (error) {
			var err = {
				msg: 'get Ids failed.'
			}
			callback(Ids);
			return;
		}

		callback(null, Ids);
	});
}

MsgRedis.prototype.getDetail = function(msgid, callback) {
	redisClient.hgetall('msg:' + msgid, function(error, msg) {
		if (error) {
			var err = {
				msg: 'get msg failed.'
			}
			callback(err);
			return;
		}

		callback(null, msg);
	});
}