//TODO: handle deletion of root node
//TODO: decouple view and template
//TODO: class parser
function DirView(base, model){

	var _ = DirView.prototype;

	_.renderNewDir = function(data){
		var newDir = document.createElement('div');
		ClassTool.add(newDir, 'dir');
		newDir.innerHTML = "<div class='dir-name '>" 
						 	+ "<span class='dir-icon dir-icon-none '>" 
							+ "</span>" 
						 	+ "<span class='dir-name-text '>"
						 		+ data
						 	+ "</span>" 
						 	+ "<span class='dir-add '>+</span>"
						 	+ "<span class='dir-del '>-</span>"
						 + "</div>" 
						 + "<div class='dir-body '></div>";
		return newDir;
	};

	_.appendChild = function(parent, child){
		var dirIcon = parent.children[0].children[0];
		var dirBody = parent.children[1];
		if(ClassTool.contains(dirIcon, 'dir-icon-none')){
			ClassTool.replace(dirIcon, 'dir-icon-open', 'dir-icon-none');
		}
		dirBody.appendChild(child);
	};

	_.collapse = function(target){
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

	_._build = function(modelNode){
		var newViewNode = _.renderNewDir(modelNode.data);
		newViewNode.modelNode = modelNode;
		for(var i = 0; i < modelNode.children.length; i++){
			_.appendChild(newViewNode, 
				arguments.callee.call(this, modelNode.children[i]));
		}
		return newViewNode;
	};
	
	_._delView = function(currParent){
		if(currParent){
			for(var i = 0; i < currParent.children.length; i++){
				arguments.callee(currParent.children[i]);
			}
			currParent.parentNode.removeChild(currParent);
		}
	};

	_.del = function(currDir){
		currDir.modelNode = null;
		_._delView(currDir);
	};

	_.append = function(currDir, newModel){
		var newViewNode = _.renderNewDir(newModel.data);
		newViewNode.modelNode = newModel;
		_.appendChild(currDir, newViewNode);
	};

	_._search = function(currDir, data){
		var currDirName = currDir.children[0].children[1];
		ClassTool.remove(currDirName, 'found');
		var currData = currDirName.innerHTML;
		if(currData === data){
			ClassTool.add(currDirName, 'found');
			return true;
		}
		else{
			var r = false;
			var currChildren = currDir.children[1];
			for(var i = 0; i < currChildren.children.length; i++){
				var child = currChildren.children[i];
				var result = arguments.callee(child, data);
				if(result){
					/*** open if found***/
					var target = currDir.children[0].children[0];
					var t = currDir.children[1];
					if(ClassTool.contains(target, 'dir-icon-collapse')){
						ClassTool.replace(target, 'dir-icon-open', 'dir-icon-collapse');
						ClassTool.replace(t, 'dir-body', 'dir-body-collapse');
					}
					/********************/
					r = true;
				}
			}
			return r;
		}
	}

	_.search = function(data){
		var result = _._search(this.base.children[0], data);
		if(result){
			alert('Found!');
		}
		else{
			alert('Not found!');
		}
	}



	_.register = function(ev, obs, obsFn){
		this._obs[ev] = [obs, obsFn];
	};

	_.eventDispatch = (function(){

		//__this points to the DirView object
		var __this = this;

		return function(event){
			var target = event.target;
			var base = event.currentTarget;
			if(ClassTool.contains(target, 'dir-del')){
				var targetDir = target.parentNode.parentNode;
				var ob = __this._obs['del'];
				ob[1].call(ob[0], targetDir, targetDir.modelNode);
			}
			else if(ClassTool.contains(target, 'dir-add')){
				var currDir = target.parentNode.parentNode;
				var newDirName = prompt('Please input name of new directory: ').trim();
				if(newDirName){
					if(newDirName === ''){
						alert("Name can't be empty!");
					}
					else{
						var targetDir = target.parentNode.parentNode;
						var ob = __this._obs['add'];
						ob[1].call(ob[0], targetDir, targetDir.modelNode, newDirName);
					}
				}
			}
			else{
				__this.collapse(target);
			}
		}
	}).call(this);

	this.base = base;
	this.model = model;
	this._obs = {};
	this.base.appendChild(_._build(this.model.root));
	addHandler(this.base, 'click', _.eventDispatch);
}