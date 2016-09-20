var $ = function(query){
	return document.querySelector(query);
};

var field = $('#field');
/*
function collapseHandler(event){
	var target = event.target;
	var t = target.parentNode.nextSibling;
	if(ClassTool.contains(target, 'icon-close')){
		ClassTool.replace(target, 'icon-open', 'icon-close');
		ClassTool.replace(t, 'dir-body', 'dir-body-collapse');
	}
	else if(ClassTool.contains(target, 'icon-open')){
		ClassTool.replace(target, 'icon-close', 'icon-open');
		ClassTool.replace(t, 'dir-body-collapse', 'dir-body');
	}
}
*/

var view = null;
var model = null;

function init(){
	view = new DirView(field);
	model = new DirModel(mock, view);

	model.init();
}

init();