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
		var response = {
			status: 'ERROR',
			msg: 'lack of params.'
		}
		next(response);
		return;
	}

	var ep = new EventProxy();
	ep.all('uidAdded', 'sidAdded', function(uidResp, sidResp) {
		if (uidResp.status === 'OK' && sidResp.status === 'OK') {
			var response = {
				status: 'OK',
				msg: 'add user to redis ok.'
			}
			next(response);

		} else {
			var response = {
				status: 'ERROR',
				msg: 'add user to redis failed.'
			}
			next(response);
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
		var response = {
			status: 'ERROR',
			msg: 'lack of params.'
		}
		next(response);
		return;
	}

	var ep = new EventProxy();
	ep.all('removeUid', 'removeSid', function(uidResp, sidResp) {
		if (uidResp.status === 'OK' && sidResp.status === 'OK') {
			var response = {
				status: 'OK',
				msg: 'remove user from redis ok.'
			}
			next(response);

		} else {
			var response = {
				status: 'ERROR',
				msg: 'remove user from redis failed.'
			}
			next(response);
			//TODO: remove hash fields from redis(if set)
		}

	});

	redisClient.hget('SidToUid', sid, function(error, uid){
		if (error) {
			return;
		}

		if (myTool.isEmptyString(uid)) {

		} else {
			
		}
	});
}