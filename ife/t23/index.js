var $ = function(query){
	return document.querySelector(query);
}

var field = $('#field');
var btnList = $('#btn-list');
var input = $('#input');

var tree = new Tree();

function btnHandler(e){
	var method = e.target.name;
	var searchText = input.value.trim();
	tree.tranverse(method, searchText);
}

function init(){
	addHandler(btnList, 'click', btnHandler);
	tree.buildTree(mock, field);
}

init();