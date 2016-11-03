/**
 * function for adding event handler
 */
function addHandler(elem, type, handler){
	if(elem.attachEvent){
		elem.attachEvent('on' + type, handler);
	}
	else if(elem.addEventListener){
		elem.addEventListener(type, handler, false);
	}
	else{
		elem['on' + type] = handler;
	}
}

/**
 * function for remove event handler
 */
function removeHandler(element, type, handler){
	if(element.removeEventListener){
		element.removeEventListener(type, handler, false);
	} 
	else if(element.detachEvent){
		element.detachEvent('on' + type, handler);
	} 
	else{
		element['on' + type] = null;
	}
}

/**
 * function for retrieving current style
 */
function getStyle(elem, attr){
	if(elem.currentStyle){
		return elem.currentStyle[attr];
	}
	else if(getComputedStyle){
		return getComputedStyle(elem, null)[attr];
	}
	else{
		return elem.style[attr];
	}
}

/**
 * add or remove class from a string made of class names
 */
var ClassTool = {
	add: function(elem, newClass){
		var old = elem.getAttribute('class');
		old = old === null ? '' : old;
		elem.setAttribute('class', old + newClass + ' ');
	},
	remove: function(elem, className){
		var old = elem.getAttribute('class');
		if(old === null){
			return;
		}
		var start = old.indexOf(className);
		if(start !== -1){
			var newStr = old.substring(0, start) 
				+ old.substring(start + className.length + 1);
			elem.setAttribute('class', newStr);
		}
	},
	contains: function(elem, className){
		var classString = elem.getAttribute('class');
		if(className === null){
			return false;
		}
		return classString.indexOf(className) !== -1;
	},
	replace: function(elem, newClass, oldClass){
		var classString = elem.getAttribute('class');
		if(classString === null){
			this.add(elem, newClass);
		}
		var start = classString.indexOf(oldClass);
		if(start === -1){
			this.add(elem, newClass);
		}
		else{
			var newStr = classString.substring(0, start) 
				+ newClass + ' '
				+ classString.substring(start + oldClass.length + 1);
			elem.setAttribute('class', newStr);
		}
	}
}