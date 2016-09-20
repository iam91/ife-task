var $ = function(query){
	return document.querySelector(query);
};

var field = $('#field');

var view = null;
var model = null;

function init(){
	model = new DirModel(mock);
	view = new DirView(field, model);
	ctrl = new DirControl(view, model);
	model.init();
	view.init();
	ctrl.init();
}

init();

function T(t){
	var _t = t;
	T.prototype.get = function(){
		return _t;
	}
}