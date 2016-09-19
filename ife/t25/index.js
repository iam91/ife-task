var div = document.createElement('div');

function Node(t){
	this.age = t;
}

var node = new Node(23);
div.Node = node;

console.log(div.Node);