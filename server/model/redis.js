var redis = require('redis');
var redisClient = redis.createClient();

redisClient.on('error', function(err) {
	console.log('connect to redis failed:' + err);
});

// module.exports = exports = RedisOperation;

// function RedisOperation() {

// }

exports.saveLogin = function(uid) {
	redisClient.hset('login:' + uid, 'loginAt', new Date().getTime(), function(err, replies) {
		if (err) {
			console.log('record login user failed:' + err);

		} else {
			redisClient.expire('login:' + uid, 50);
		}
	});
}

exports.checkLogin = function(uid, callback) {
	redisClient.hget('login:' + uid, 'loginAt', function(err, obj) {
		if (err) {
			console.log('get login failed:' + err);
			callback({status:'ERROR',error:err});

		} else {
			if (obj != null) {
				console.log('get login success:' + obj);
				callback({status:'OK'});

			} else {
				callback({status:'ERROR'});
			}
			
		}

	});
}

exports.addOnlineUser = function(sid, uid) {
	redisClient.hset('online:' + sid, 'uid', uid);
	redisClient.hset('user:' + uid, 'sid', sid);
}

exports.removeOnlineUser = function(sid) {
	redisClient.hget('online:' + sid, 'uid', function(err,uid){
		if (err) {
			console.log(err);
			return;
		}

		if (uid) {
			redisClient.del('user:' + uid);
			redisClient.del('online:' + sid);
		}

	});
}

exports.getSocketIDByUid = function(uid, callback) {
	redisClient.hget('user:' + uid, 'sid', function(err,obj){
		if (err) {
			var resp = {
				status: 'ERROR',
				msg: 'redis error.'
			}
			callback(resp);
			return;
		}

		if (obj === null) {
			var resp = {
				status: 'NULL',
				msg: 'user not exists.'
			}
			callback(resp);

		} else {
			var resp = {
				status: 'OK',
				sid: obj
			}
			callback(resp);
		}

	});
}

exports.addEvent = function(data) {
	var eid = data.eid;
	var key = 'event:' + eid;

	redisClient.hset(key, 'receiver', data.receiver);
	redisClient.hset(key, 'content', data.content);
	redisClient.hset(key, 'createAt', new Date().getTime());
	redisClient.hset(key, 'tries', '1');

	redisClient.sadd('eventset', eid);

}

exports.removeEvent = function(eid) {
	redisClient.del('event:' + eid);
	redisClient.srem('eventset', eid);
}






