function DirControl(view){
	this._view = view;

	DirControl.prototype.init = function(){
		addHandler(this._view.base, 'click', DirControl.prototype.eventDispatch);
	}

	DirControl.prototype.eventDispatch = function(event){
		var target = event.target;
		var base = event.currentTarget;
		var thisView = base.view;
		if(ClassTool.contains(target, 'dir-del')){
			var currDir = thisView.findTargetDir(target,'dir-del');
			thisView.model.del(currDir.modelNode);
			thisView.del(currDir);
		}
		else if(ClassTool.contains(target, 'dir-add')){
			//thisView._ctrl.add();
		}
		else{
			thisView.collapse(target);
		}
	}
}