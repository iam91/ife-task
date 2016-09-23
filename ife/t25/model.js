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

	var _ = DirModel.prototype;

	_._build = function(data, parent){
		var modelNode = new ModelNode(data.val, parent);
		for(var i = 0; i < data.children.length; i++){
			var childModelNode = arguments.callee.call(this, data.children[i], modelNode);
			modelNode.children.push(childModelNode);
		}
		return modelNode;
	};

	_._delNode = function(modelNode){
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
	};

	_.del = function(modelNode){
		if(modelNode){
			_._delNode(modelNode);
		}
	};

	_.append = function(currModelNode, data){
		var modelNode = new ModelNode(data, currModelNode);
		currModelNode.children.push(modelNode);
		return modelNode;
	};

	this.root = _._build.call(this, rawData, null);
}