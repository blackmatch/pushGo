var Tool = function() {

}

module.exports = Tool;

Tool.prototype.isEmptyString = function(str) {
	return (!str || str.length === 0);
}

Tool.prototype.isValidParams = function(params, requireKeys, allKeys) {
	var isValid = true;

	for (var i in requireKeys) {
		var value = params[requireKeys[i]];
		if (!value) {
			isValid = false;
			break;
		}
	}

	for (var key in params) {
		if (allKeys.indexOf(key) === -1) {
			isValid = false;
			break;
		}
	}

	return isValid;
}