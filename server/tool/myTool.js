var MyTool = function() {

}

module.exports = MyTool;

MyTool.prototype.isEmptyString = function(str) {
	return (!str || str.length === 0);
}