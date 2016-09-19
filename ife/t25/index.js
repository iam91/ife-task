var $ = function(query){
	return document.querySelector(query);
};

var field = $('#field');

function collapseHandler(event){
	var target = event.target;
	var currStatus = target.getAttribute('class');
	if(currStatus === 'icon-close'){
		target.setAttribute('class', 'icon-open');
		/*
		for(var i = 0; i < target.children.length; i++){
			children[i].setAttribute('class', 'icon-open');
		}*/
	}
	else if(currStatus === 'icon-open'){
		target.setAttribute('class', 'icon-close');
	}
}

function init(){
	var tree = new Tree();
	tree.buildTree(mock, field);

	addHandler(field, 'click', collapseHandler);
}

init();