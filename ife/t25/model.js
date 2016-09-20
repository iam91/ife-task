/**
 * ModelNode constructor
 */
function ModelNode(data){
	this.data = data;
	this._viewNode = null;
	this.children = [];
	ModelNode.prototype.setViewNode = function(viewNode){
		this._viewNode = viewNode;
		//connect DOM(view) and with model
		this._viewNode.modelNode = this;
	}
	ModelNode.prototype.getViewNode = function(){
		return this._viewNode;
	}
}

/**
 * DirModel constructor
 */
function DirModel(rawData, view){
	this._view = view;
	this._rawData = rawData;
	this._root = null;
	DirModel.prototype.init = function(){
		var rootView = DirModel.prototype._build(this._rawData, this._view);
		this._view.show(rootView.getViewNode());
	}
	DirModel.prototype._build = function(data, view){
		var modelNode = new ModelNode(data);
		var newViewNode = view.renderNewDir(data.val);
		modelNode.setViewNode(newViewNode);
		for(var i = 0; i < data.children.length; i++){
			var childModelNode = arguments.callee(data.children[i], view);
			modelNode.children.push(childModelNode);
			view.appendChild(newViewNode, childModelNode.getViewNode());
		}
		return modelNode;
	}
}