function DirControl(view, model){
	this._view = view;
	this._model = model;

	DirControl.prototype.del = function(targetDir, targetModelNode){
		this._view.del(targetDir);
		this._control.del(targetModelNode);
	};

	DirControl.prototype.append = function(targetDir, targetModelNode, data){
		this._view.append(targetDir,
			this._model.append(targetModelNode, data));
	}

	//register to view
	DirControl.prototype.init = function(){
		this._view.register('del', this, DirControl.prototype.del);
		this._view.register('add', this, DirControl.prototype.append);
	};
}