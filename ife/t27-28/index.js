var $$ = function(element){
	//convert newly created dom object to jquery object
	return $(document.createElement(element));
};

var sysTimeInterval = 50;
var timeGra = 1000 / sysTimeInterval;