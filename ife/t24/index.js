var $ = function(query){
	return document.querySelector(query);
}

var field = $('#field');
var btnList = $('#btn-list');
var input = $('#input');
var change = $('#change');
var addInput = $('#add-input');

function textExtractor(node){
	var text = '';
	var extract = /^\s*([\s, \w]+)\s*$/
	for(var i = 0; i < node.childNodes.length; i++){
		//text += extract.exec(node.childNodes[i])[1];
		if(node.childNodes[i].nodeType === 3){
			text += node.childNodes[i].nodeValue.trim();
		}
	}
	return text;
}

function dfs(array, node){
	if(node){
		for(var i = 0; i < node.children.length; i++){
			arguments.callee(array, node.children[i]);
		}
		array.push(node);
	}
}
function bfs(array, root){
	if(root){
		var q = new Array();
		q.push(root);
		while(q.length > 0){
			var curr = q.shift();
			for(var i = 0; i < curr.children.length; i++){
				q.push(curr.children[i]);
			}
			array.push(curr);
		}
	}
}

function tranverse(method, searchText){
	var array = new Array();
	var found = false;

	switch(method){
		case 'bfs':
			bfs(array, field.firstElementChild);
			break;
		case 'dfs':
			dfs(array, field.firstElementChild);
			break;
		case 'search':
			dfs(array, field.firstElementChild);
		default:
			break;
	}

	var t = null;
	(function(){
		if(t && t.style.backgroundColor === 'blue'){
			t.style.backgroundColor = 'white';
		}
		t = array.shift();
		if(t){
			t.style.backgroundColor = 'blue';
			console.log(textExtractor(t));
			
			if(method === 'search' && textExtractor(t) === searchText){
				t.style.backgroundColor = 'red';
				found = true;
			}
			setTimeout(arguments.callee, 300);
		}
		else{
			if(method === 'search' && !found){
				alert("Can't find!");
			}
		}
	})();
}

function btnHandler(e){
	var method = e.target.name;
	var searchText = input.value.trim();
	tranverse(method, searchText);
}

function del(){
	chosen.parentNode.removeChild(chosen);
}
function add(){
	var val = addInput.value.trim();
	var newElem = document.createElement('div');
	newElem.setAttribute('class', 'node');
	newElem.innerHTML = val;
	chosen.appendChild(newElem);
}
function changeHandler(e){
	var method = e.target.name;

	switch(method){
		case 'add':
			add()
			break;
		case 'del':
			del();
			break;
		default:
			break;
	}
}

var chosen = null;

function chooseHandler(e){
	var target = e.target;
	if(chosen){
		chosen.style.backgroundColor = 'white';
	}
	chosen = target;
	chosen.style.backgroundColor = 'green';
}

function init(){
	addHandler(btnList, 'click', btnHandler);
	addHandler(change, 'click', changeHandler);
	addHandler(field, 'click', chooseHandler);
}

init();