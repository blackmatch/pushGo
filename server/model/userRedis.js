var redis = require('redis');
var redisClient = redis.createClient();
redisClient.on('error', function(err) {
	console.log('connect to redis failed:' + err);
});

var tool = require('../tool/myTool.js');
var myTool = new tool();

var EventProxy = require('eventproxy');

var UserRedis = function() {

}

module.exports = UserRedis;

UserRedis.prototype.add = function(uid, sid, next) {
	if (myTool.isEmptyString(uid) || myTool.isEmptyString(sid)) {
		var err = {
			msg: 'lack of params.'
		}
		next(err);
		return;
	}

	var ep = new EventProxy();
	ep.all('uidAdded', 'sidAdded', function(uidResp, sidResp) {
		if (uidResp.status === 'OK' && sidResp.status === 'OK') {
			var result = {
				msg: 'add user to redis ok.'
			}
			next(null, result);

		} else {
			var err = {
				msg: 'add user to redis failed.'
			}
			next(err);
			//TODO: remove hash fields from redis(if set)
		}

	});

	redisClient.hset('UidToSid', uid, sid, function(error, response) {
		if (error) {
			var resp = {
				status: 'ERROR',
				msg: 'add uid to redis failed.'
			}
			ep.emit('uidAdded', resp);

			return;
		}

		var resp = {
			status: 'OK',
			msg: 'add uid to redis ok.'
		}
		ep.emit('uidAdded', resp);
	});

	redisClient.hset('SidToUid', sid, uid, function(error, response) {
		if (error) {
			var resp = {
				status: 'ERROR',
				msg: 'add sid to redis failed.'
			}
			ep.emit('sidAdded', resp);
			return;
		}

		var resp = {
			status: 'OK',
			msg: 'add sid to redis ok.'
		}
		ep.emit('sidAdded', resp);
	});
}

UserRedis.prototype.remove = function(sid, next) {
	if (myTool.isEmptyString(sid)) {
		var err = {
			msg: 'lack of params.'
		}
		next(err);
		return;
	}

	var ep = new EventProxy();
	ep.all('removeUid', 'removeSid', function(uidResp, sidResp) {
		if (uidResp.status === 'OK' && sidResp.status === 'OK') {
			var result = {
				msg: 'remove user from redis ok.'
			}
			next(null, result);

		} else {
			var err = {
				msg: 'remove user from redis failed.'
			}
			next(err);
			//TODO: do something
		}

	});

	redisClient.hget('SidToUid', sid, function(error, uid) {
		if (error) {
			var response = {
				status: 'ERROR',
				msg: 'get uid by sid from redis failed.'
			}
			ep.emit('removeUid', response);
			return;
		}

		if (myTool.isEmptyString(uid)) {
			var response = {
				status: 'ERROR',
				msg: 'get uid by sid from redis failed.'
			}
			ep.emit('removeUid', response);

		} else {
			redisClient.hdel('UidToSid', uid, function(error, resp) {
				if (error) {
					var response = {
						status: 'ERROR',
						msg: 'remove uid from redis failed.'
					}
					ep.emit('removeUid', response);
					return;
				}

				var response = {
					status: 'OK',
					msg: 'remove uid from redis ok.'
				}
				ep.emit('removeUid', response);
			});
		}
	});

	redisClient.hdel('SidToUid', sid, function(error, resp) {
		if (error) {
			var response = {
				status: 'ERROR',
				msg: 'remove sid from redis failed.'
			}
			ep.emit('removeSid', response);
			return;
		}

		var response = {
			status: 'OK',
			msg: 'remove sid from redis ok.'
		}
		ep.emit('removeSid', response);
	});
}