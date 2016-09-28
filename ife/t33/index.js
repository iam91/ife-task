var $ = function(query){
	return document.querySelector(query);
};
var $$ = function(elem){
	return document.createElement(elem);
};

var fieldWidth = 10;
var fieldHeight = 10;
var fieldArea = fieldWidth * fieldHeight;
var gridTemplate = "<div class='grid'></div>";
var fieldHTML = '';

var field = $('#field');

var x = 0;
var y = 1;
var dir = 0;

function go(){
	var pos = x + fieldWidth * y;
	var curr = field.children[pos];
	curr.classList.remove('grid');
	curr.classList.add('box');
}

function init(){
	for(var i = 0; i < fieldArea; i++){
		fieldHTML += gridTemplate;
	}
	field.innerHTML = fieldHTML;
	go();
}

init();

