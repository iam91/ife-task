/**
 * constructor for Node.
 */
function Node(){
	this.data = null;
	this._view = null;
	this._children = [];
	Node.prototype.setView = function(view){
		this._view = view;
		//link back to data node
		this._view.Node = this;
	}
	Node.prototype.getView = function(view){
		return this._view;
	}
	Node.prototype.pushChildren = function(child){
		this._children.push(child);
		this._view.children[1].appendChild(child._view);
	}
}

/**
 * constructor for Tree.
 * Tree is used to connect data and Element.
 */
function Tree(){
	this.root;
	Tree.prototype._render = function(initData){
		var newView = document.createElement('div');
		newView.setAttribute('class', 'dir');
		var iconClass = null;
		if(initData.children.length === 0){
			iconClass = 'icon-none';
		}
		else{
			iconClass = 'icon-close';
		}
		newView.innerHTML = "<div class='dir-name'><span class='"
			+ iconClass 
			+ "'></span><span class='head'>"
			+ initData.val
			+ "</span></div><div class='dir-body-collapse'></div>";
		return newView;
	}
	Tree.prototype._build = function(initData){
		var newView = Tree.prototype._render(initData);
		var newNode = new Node();
		newNode.data = initData.val;
		newNode.setView(newView);
		for(var i = 0; i < initData.children.length; i++){
			newNode.pushChildren(arguments.callee(initData.children[i], newView));
		}
		return newNode;
	}
	Tree.prototype.buildTree = function(initData, field){
		field.appendChild(Tree.prototype._build(initData).getView());
	}
}