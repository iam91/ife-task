/**
 * tree data
 */
var mock = [[[[null, null], [[null, null], [null, null]]], null], [[null, [null, null]], [null, null]]];

var $ = function(query){
	return document.querySelector(query);
}

var btnList = $('#btn-list');
var field = $('#field');
var tree = null;

function btnHandler(event){
	var order = event.target.name;
	tree.tranverse(order);
}

function init(){
	addHandler(btnList, 'click', btnHandler);
	tree = new BinaryTree();
	tree.buildTree(mock, field);
}

init();