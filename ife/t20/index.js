var input = document.getElementById('input');
var inputList = document.getElementById('input-list');
var query = document.getElementById('query');
var btnQuery = document.getElementById('btn-query');

function textParse(text){
	var elems = text.split(/[\s, \,, ，, 、]+/);
	console.log(elems);
}

function inputHandler(event){
	var text = input.value;
	var inputMethod = event.target.name;
	console.log(inputMethod);
	textParse(text);
}

function queryHandler(){

}

function init(){
	addHandler(inputList, 'click', inputHandler);
	addHandler(btnQuery, 'click', queryHandler);
}

init();