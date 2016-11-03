function Node(left, right, val){
	this.val = val;
	this.left = left;
	this.right = right;
}

function buildTree(treeArray, field){
	this.root = build(treeArray);
	field.appendChild(this.root.val);
}
function build(treeArray){
	if(treeArray === null){
		return null;
	}
	var newNode = document.createElement('div');
	newNode.setAttribute('class', 'node');

	var node = new Node(
		arguments.callee(treeArray[0]), 
		arguments.callee(treeArray[1]),
		newNode);

	//render
	if(node.left){
		newNode.appendChild(node.left.val);
	}
	if(node.right){
		newNode.appendChild(node.right.val);
	}

	return node;
}

function preorder(node, array){
	if(node === null){
		return;
	}
	array.push(node.val);
	arguments.callee(node.left, array);
	arguments.callee(node.right, array);
}

function inorder(node, array){
	if(node === null){
		return;
	}
	arguments.callee(node.left, array);
	array.push(node.val);
	arguments.callee(node.right, array);
}

function postorder(node, array){
	if(node === null){
		return;
	}
	arguments.callee(node.left, array);
	arguments.callee(node.right, array);
	array.push(node.val);
}

function tranverse(order){
	var tran = new Array();

	switch(order){
		case 'inorder':
			inorder(this.root, tran);
			break;
		case 'postorder':
			postorder(this.root, tran);
			break;
		case 'preorder':
			preorder(this.root, tran);
			break;
		default:
			break;
	}

	var t = null;
	(function(){
		if(t){
			t.style.backgroundColor = 'white';
		}
		t = tran.shift();
		if(t){
			t.style.backgroundColor = 'red';
			setTimeout(arguments.callee, 500);
		}
	})();
}

function BinaryTree(){
	this.root = null;
	this.buildTree = buildTree;
	this.tranverse = tranverse;
}