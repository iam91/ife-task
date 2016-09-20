/**
 * ModelNode constructor
 */
function ModelNode(data, parent){
	this.data = data;
	this.parent = parent;
	this.children = [];
}

/**
 * DirModel constructor
 */
function DirModel(rawData){
	this._rawData = rawData;
	this.root = null;

	DirModel.prototype.init = function(){
		this.root = DirModel.prototype._build.call(this, this._rawData, null);
	};

	DirModel.prototype._build = function(data, parent){
		var modelNode = new ModelNode(data.val, parent);
		for(var i = 0; i < data.children.length; i++){
			var childModelNode = arguments.callee.call(this, data.children[i], modelNode);
			modelNode.children.push(childModelNode);
		}
		return modelNode;
	};

	DirModel.prototype._delNode = function(modelNode){
		for(var i = 0; i < modelNode.children.length; i++){
			arguments.callee(modelNode.children[i]);
		}
		var pchildren = modelNode.parent.children;
		
		var i = 0;
		while(pchildren[i] !== modelNode){
			i++;
		}
		while(i < pchildren.length - 1){
			pchildren[i] = pchildren[i + 1];
			i++;
		}
		pchildren.pop();
	}

	DirModel.prototype.del = function(modelNode){
		if(modelNode){
			DirModel.prototype._delNode(modelNode);
		}
		console.log(this.root);
	}

	DirModel.prototype.add = function(modelNode){

	}
}