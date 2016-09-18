var NodeRSA = require('node-rsa');

var rsa = new NodeRSA();
rsa.setOptions({encryptionScheme: 'pkcs1'});

//import RSA private key
privateKey = '-----BEGIN RSA PRIVATE KEY-----\n' +
			'MIICXQIBAAKBgQC+qTxcyz4WYmIGnF/ro0xlJ1373xT1mJgCP9QhY3UVRP8z4IYV\n' +
			'09R7dSKNCtCgKHacRp23epTR/FcLNXr4CsIw5tEBL6I88A8yZeZNfgyLgMWA7y5o\n' +
			'afFY8K9G+IYTuynmlUfQIf4+Q68lMc+N7wn7c7HPHhLNb1irL0cJFNms7wIDAQAB\n' +
			'AoGATexbCE3kvT9Ocwc8SNE/6uOxDLz7EvlfvyOZLmA4vQ2rA+fSxV8DK8YO7fgq\n' +
			'lhqTh4Fw+kk2Q7BPXvxnmrLC9IZUMUTNCaoc/xdWSY4E4jhgvd0787Vk3WEdby3r\n' +
			'GyuptkcoSZpPoCiZ5v5L+5TGD71cj5nIwSxkcmPfJ9F4rkkCQQDwfF7BPgjXZyzh\n' +
			'Id1dbfytZVf4SyutGYrcDy2Pd2RRfIM+kx5SjxXhkSdBDu6ZV0xC+fFwFRG9sD/P\n' +
			'k48iAjUDAkEAyvYCN6ln0g7DgEziFtQFUXM8EfwzxPOvyIBAJNeVuWX0h33uj+mM\n' +
			'ODw3iFYEqqinTR7ZbFiixDGVG9i3N1/WpQJBALLuNqpdd8Kdd90Cj2xGu6xgLTYG\n' +
			'6DZhPNpDSMjoMnIWzKgwWm1fHQ66K5TSgWECfTGQOr4ETzDuBGx0BBlvvvUCQC3r\n' +
			's1y8q4zPYlRpEM5xcjKXjAPVuDDboe4PdnPfgzTLaKQvTgappNwkY7wpGi0ys4ez\n' +
			'byYgd9NEFKSUR//zYzECQQDg57CFNILBZtItGoDUBXWkHDfw7al7fgPjMtQU6PwZ\n' +
			'o6lLEvwCgIv0ltLaxgbzBPan+0PS54Fonrq7szNgD4ic\n' +
			'-----END RSA PRIVATE KEY-----'

rsa.importKey(privateKey, 'pkcs1');

var publicKey = '-----BEGIN PUBLIC KEY-----\n' +
			'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+qTxcyz4WYmIGnF/ro0xlJ137\n' +
			'3xT1mJgCP9QhY3UVRP8z4IYV09R7dSKNCtCgKHacRp23epTR/FcLNXr4CsIw5tEB\n' +
			'L6I88A8yZeZNfgyLgMWA7y5oafFY8K9G+IYTuynmlUfQIf4+Q68lMc+N7wn7c7HP\n' +
			'HhLNb1irL0cJFNms7wIDAQAB\n' +
			'-----END PUBLIC KEY-----';
rsa.importKey(publicKey, 'public');

exports.encrypt = function(origin) {
	return rsa.encrypt(origin, 'base64');
}

exports.decrypt = function(encrypted) {
	return rsa.decrypt(encrypted, 'utf8');
}