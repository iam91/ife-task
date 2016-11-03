var $ = function(query){
	return document.querySelector(query);
}

var input = $('#input');
var inputList = $('#input-list');
var query = $('#query');
var btnQuery = $('#btn-query');
var field = $('#field');

function textParse(text){
	var texts = text.split(/[\s, \,, ，, 、]+/);
	return texts;
}

function createElem(text){
	var newNode = document.createElement('div');
	newNode.setAttribute('class', 'elem');
	newNode.innerHTML = text;
	return newNode;
}
function lin(textQueue){
	for(var i = 0; i < textQueue.length; i++){
		field.insertBefore(createElem(textQueue[i]), field.firstChild);
	}
}
function rin(textQueue){
	for(var i = 0; i < textQueue.length; i++){
		field.appendChild(createElem(textQueue[i]));
	}
}
function lout(){
	field.removeChild(field.firstChild);
}
function rout(){
	field.removeChild(field.lastChild);
}
function inputHandler(event){
	var text = input.value.trim();
	var inputMethod = event.target.name;
	var textQueue = textParse(text);
	switch(inputMethod){
		case 'lin':
			lin(textQueue);
			break;
		case 'rin':
			rin(textQueue);
			break;
		case 'lout':
			lout();
			break;
		case 'rout':
			rout();
			break;
		default:
			break;
	}
}

function queryHandler(){
	var qString = query.value.trim();
	for(var i = 0; i < field.children.length; i++){
		field.children[i].setAttribute('class', 'elem');
		if(qString === field.children[i].innerHTML){
			field.children[i].setAttribute('class', 'elem found');
		}
	}
}

function init(){
	addHandler(inputList, 'click', inputHandler);
	addHandler(btnQuery, 'click', queryHandler);
}

init();