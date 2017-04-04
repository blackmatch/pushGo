var redis = require('redis');
var redisClient = redis.createClient();
redisClient.on('error', function(error) {
	console.log('connect to redis failed:' + error);
});

var EventProxy = require('eventproxy');

var tool = require('../utils/tool.js');
var myTool = new tool();

var UserRedis = function() {

}

module.exports = UserRedis;

UserRedis.prototype.isOnline = function(uid, callback) {
	var ep = new EventProxy();
	ep.all('checkUid', 'checkSid', function(checkUid, checkSid) {
		if (checkUid.error || checkSid.error) {
			var err = {
				msg: 'redis error or user is offline.'
			}
			callback(err);

		} else {
			var result = {
				msg: 'user is online.',
				sid: checkUid.sid
			}

			callback(null, result);
		}
	});

	redisClient.hget('UidToSid', uid, function(error, sid) {
		if (error) {
			var result = {
				error: 'redis error.'
			}
			ep.emit('checkUid', result);
			ep.emit('checkSid', result);
			return;
		}

		if (myTool.isEmptyString(sid)) {
			var result = {
				error: 'uid is empty.'
			}
			ep.emit('checkUid', result);
			ep.emit('checkSid', result);

		} else {
			var result = {
				sid: sid,
				msg: 'user is online.'
			}
			ep.emit('checkUid', result);

			redisClient.hget('SidToUid', sid, function(error, uid) {
				if (error) {
					var result = {
						error: 'redis error.'
					}
					ep.emit('checkSid', result);
					return;
				}

				if (myTool.isEmptyString(uid)) {
					var result = {
						error: 'sid is empty.'
					}
					ep.emit('checkSid', result);

				} else {
					var result = {
						uid: uid,
						msg: 'user is online.'
					}
					ep.emit('checkSid', result);
				}
			});
		}

	});
}

UserRedis.prototype.add = function(uid, sid, callback) {
	if (myTool.isEmptyString(uid) || myTool.isEmptyString(sid)) {
		var err = {
			msg: 'lack of params.'
		}
		callback(err);
		return;
	}

	var ep = new EventProxy();
	ep.all('uidAdded', 'sidAdded', function(uidAdded, sidAdded) {
		if (uidAdded.status === 'OK' && sidAdded.status === 'OK') {
			var result = {
				msg: 'add user to redis ok.'
			}
			callback(null, result);

		} else {
			var err = {
				msg: 'add user to redis failed.'
			}
			callback(err);
			//TODO: remove hash fields from redis(if set)
		}

	});

	redisClient.hset('UidToSid', uid, sid, function(error, response) {
		if (error) {
			console.log(error);
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
			console.log(error);
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

UserRedis.prototype.remove = function(sid, callback) {
	if (myTool.isEmptyString(sid)) {
		var err = {
			msg: 'lack of params.'
		}
		callback(err);
		return;
	}

	var ep = new EventProxy();
	ep.all('removeUid', 'removeSid', function(uidResp, sidResp) {
		if (uidResp.status === 'OK' && sidResp.status === 'OK') {
			var result = {
				msg: 'remove user from redis ok.'
			}
			callback(null, result);

		} else {
			var err = {
				msg: 'remove user from redis failed.'
			}
			callback(err);
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

UserRedis.prototype.removeAll = function(callback) {
	var ep = new EventProxy();
	ep.all('removeUid', 'removeSid', function(removeUid, removeSid) {
		if (removeUid.status === 'OK' && removeSid.status === 'OK') {
			var result = {
				msg: 'remove all user from redis ok.'
			}
			callback(null, result);
			return;
		}

		var err = {
			msg: 'remove all users from redis failed.'
		}
		callback(err);

	});

	redisClient.del('UidToSid', function(error) {
		if (error) {
			var err = {
				status: 'ERROR'
			}
			ep.emit('removeUid', err);
			return;
		}

		var result = {
			status: 'OK'
		}
		ep.emit('removeUid', result);

	});

	redisClient.del('SidToUid', function(error) {
		if (error) {
			var err = {
				status: 'ERROR'
			}
			ep.emit('removeSid', err);
			return;
		}

		var result = {
			status: 'OK'
		}
		ep.emit('removeSid', result);
	});
}