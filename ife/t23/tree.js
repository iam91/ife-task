function Node(){
	this.text = null;
	this.view = null;
	this.children = [];
}

function build(data){
	var view = document.createElement('div');
	view.innerHTML = data.val;
	view.setAttribute('class', 'node');

	var newNode = new Node();
	newNode.text = data.val;
	newNode.view = view;
	newNode.children = new Array();

	for(var i = 0; i < data.children.length; i++){
		var child = build(data.children[i]);
		newNode.children.push(child);

		view.appendChild(child.view);
	}
	return newNode;
}
function buildTree(data, field){
	this.root = build(data);
	field.appendChild(this.root.view);
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
	var search = new Array();

	switch(method){
		case 'bfs':
			bfs(array, this.root);
			break;
		case 'dfs':
			dfs(array, this.root);
			break;
		case 'search':
			dfs(array, this.root);
		default:
			break;
	}

	var t = null;
	(function(){
		if(t && t.view.style.backgroundColor === 'blue'){
			t.view.style.backgroundColor = 'white';
		}
		t = array.shift();
		if(t){
			t.view.style.backgroundColor = 'blue';
			if(method === 'search' && t.text === searchText){
				t.view.style.backgroundColor = 'red';
				search.push(t.view);
			}
			setTimeout(arguments.callee, 300);
		}
		else{
			if(method === 'search' && search.length === 0){
				alert("Can't find!");
			}
		}
	})();
}

function Tree(){
	this.root = null;
	this.buildTree = buildTree;
	this.tranverse = tranverse;
}