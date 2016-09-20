function DirControl(){
	
	DirControl.prototype.init = function(){
		addHandler(this._view.base, 'click', DirControl.prototype.eventDispatch);
	}

	DirControl.prototype.eventDispatch = function(event){
		var target = event.target;
		if(ClassTool.contains(target, 'dir-del')){

		}
		else if(ClassTool.contains(target, 'dir-add')){

		}
		else{

		}
	}

	DirControl.prototype.delHandler = function(){

	}
}