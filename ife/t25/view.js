function DirView(base){
	this.base = base;
	DirView.prototype.renderNewDir = function(data){
		var newDir = document.createElement('div');
		ClassTool.add(newDir, 'dir');
		newDir.innerHTML = "<div class='dir-name'>" 
						 	+ "<span class='dir-icon-none'>" 
							+ "</span>" 
						 	+ "<span class='dir-name-text'>"
						 		+ data
						 	+ "</span>" 
						 + "</div>" 
						 + "<div class='dir-body'></div>";
		return newDir;
	}
	DirView.prototype.appendChild = function(parent, child){
		var dirIcon = parent.children[0].children[0];
		var dirBody = parent.children[1];
		if(ClassTool.contains(dirIcon, 'dir-icon-none')){
			ClassTool.replace(dirIcon, 'dir-icon-open', 'dir-icon-none');
		}
		dirBody.appendChild(child);
	}
	DirView.prototype.show = function(rootView){
		this.base.appendChild(rootView);
	}
	DirView.prototype.collapse = function(elem){
		
	}
}