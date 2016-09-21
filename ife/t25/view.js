function DirView(base, model){
	this.base = base;
	this.model = model;

	DirView.prototype.renderNewDir = function(data){
		var newDir = document.createElement('div');
		ClassTool.add(newDir, 'dir');
		newDir.innerHTML = "<div class='dir-name'>" 
						 	+ "<span class='dir-icon-none'>" 
							+ "</span>" 
						 	+ "<span class='dir-name-text'>"
						 		+ data
						 	+ "</span>" 
						 	+ "<span class='dir-add'>+</span>"
						 	+ "<span class='dir-del'>-</span>"
						 + "</div>" 
						 + "<div class='dir-body'></div>";
		return newDir;
	};

	DirView.prototype.appendChild = function(parent, child){
		var dirIcon = parent.children[0].children[0];
		var dirBody = parent.children[1];
		if(ClassTool.contains(dirIcon, 'dir-icon-none')){
			ClassTool.replace(dirIcon, 'dir-icon-open', 'dir-icon-none');
		}
		dirBody.appendChild(child);
	};

	DirView.prototype.collapse = function(target){
		var t = target.parentNode.nextSibling;
		if(ClassTool.contains(target, 'dir-icon-open')){
			ClassTool.replace(target, 'dir-icon-collapse', 'dir-icon-open');
			ClassTool.replace(t, 'dir-body-collapse', 'dir-body');
		}
		else if(ClassTool.contains(target, 'dir-icon-collapse')){
			ClassTool.replace(target, 'dir-icon-open', 'dir-icon-collapse');
			ClassTool.replace(t, 'dir-body', 'dir-body-collapse');
		}
	};

	DirView.prototype.init = function(){
		this.base.appendChild(DirView.prototype._build(this.model.root));
		//couple html with view
		this.base.view = this;
	}

	DirView.prototype._build = function(modelNode){
		var newViewNode = DirView.prototype.renderNewDir(modelNode.data);
		newViewNode.modelNode = modelNode;
		for(var i = 0; i < modelNode.children.length; i++){
			DirView.prototype.appendChild(newViewNode, 
				arguments.callee.call(this, modelNode.children[i]));
		}
		return newViewNode;
	}
	
	DirView.prototype._delView = function(currParent){
		if(currParent){
			for(var i = 0; i < currParent.children.length; i++){
				arguments.callee(currParent.children[i]);
			}
			currParent.parentNode.removeChild(currParent);
		}
	}

	DirView.prototype.del = function(currDir){
		currDir.modelNode = null;
		DirView.prototype._delView(currDir);
	}

	DirView.prototype.append = function(currDir){
	}

	DirView.prototype.findTargetDir = function(target, className){
		if(className === 'dir-del' || className === 'dir-add'){
			return target.parentNode.parentNode;
		}
		return null;
	}
}