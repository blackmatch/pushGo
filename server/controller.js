var mysql = require('./model/mysql.js');

var msg = {
	receiver: 'fkdjgk',
	content: 'hello'
}

var insert = mysql.insertMsg(msg);


setTimeout(function() {
	console.log(insert);
	if (insert) {
		console.log('insert msg ok.');

	} else {
		console.log('insert msg failed.');
	}

}, 2000);