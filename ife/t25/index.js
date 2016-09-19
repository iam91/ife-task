var $ = function(query){
	return document.querySelector(query);
};

var field = $('#field');

function collapseHandler(event){
	var target = event.target;
	var currStatus = target.getAttribute('class');
	if(currStatus === 'icon-close'){
		for(var i = 0; i < target.children.length; i++){
			children[i].setAttribute
		}
	}
	else if(currStatus === 'icon-open'){

	}
}

function init(){
	var tree = new Tree();
	tree.build(mock, field);

	addHandler(field, 'click', collapseHandler);
}

init();