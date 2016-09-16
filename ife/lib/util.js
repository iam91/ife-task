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