function DirControl(view, model){
	this._view = view;
	this._model = model;

	var _ = DirControl.prototype;

	_.del = function(targetDir, targetModelNode){
		this._view.del(targetDir);
		this._control.del(targetModelNode);
	};

	_.append = function(targetDir, targetModelNode, data){
		this._view.append(targetDir,
			this._model.append(targetModelNode, data));
	}

	//register to view
	this._view.register('del', this, _.del);
	this._view.register('add', this, _.append);
}