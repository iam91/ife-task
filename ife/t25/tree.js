/**
 * constructor for Node.
 */
function Node(){
	this.data = null;
	this._view = null;
	this.children = [];
	Node.prototype.setView = function(view){
		this._view = view;
		//link back to data node
		this._view.link = this;
	}
	Node.prototype.getView = function(view){
		return this._view;
	}
}

/**
 * constructor for Tree.
 * Tree is used to connect data and Element.
 */
function Tree(){
	this.root;
	Tree.prototype._render = function(initData, parent){
		var newView = document.createElement('div');
		newView.setAttribute('class', 'dir');
		var iconClass = null;
		if(initData.children.length === 0){
			iconClass = 'icon-none';
		}
		else{
			iconClass = 'icon-close';
		}
		newView.innerHTML = "<div><span class='"
			+ iconClass 
			+ "'></span><span class='head'>"
			+ initData.val
			+ "</span></div>";
		parent.appendChild(newView);
		return newView;
	}
	Tree.prototype.build = function(initData, parent){
		var newView = Tree.prototype._render(initData, parent);
		var newNode = new Node();
		newNode.data = initData.val;
		newNode.setView(newView);
		for(var i = 0; i < initData.children.length; i++){
			newNode.children[i] = arguments.callee(initData.children[i], newView);
		}
		return newNode;
	}
}