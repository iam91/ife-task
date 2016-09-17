/**
 * basic elements
 */
var input = document.getElementById('input');
var btnLIn = document.getElementById('btn-lin');
var btnRIn = document.getElementById('btn-rin');
var btnLOut = document.getElementById('btn-lout');
var btnROut = document.getElementById('btn-rout');
var field = document.getElementById('field');

/**
 * create list elements
 */
function createElem(val){
	var newChild = document.createElement('div');
	newChild.setAttribute('class', 'elem');
	newChild.innerHTML = val;
	return newChild;
}

/**
 * input validation
 */
function validate(val){
	var ret = val.replace(/\s+/g, '');
	var vali = /^\d+$/;
	if(vali.test(ret)){
		return ret;
	}
	else{
		alert('Input should be an integer');
		return null;
	}
}


/**
 * left in handler
 */
function leftInHandler(){
	var val = validate(input.value);
	if(val !== null){
		field.insertBefore(createElem(val), field.firstChild);
	}
}

/**
 * right in handler
 */
function rightInHandler(){
	var val = validate(input.value);
	if(val !== null){
		field.appendChild(createElem(val));
	}
}

/**
 * left out handler
 */
function leftOutHandler(){
	alert(field.firstChild.innerHTML);
	field.removeChild(field.firstChild);
}

/**
 * right out handler
 */
function rightOutHandler(){
	alert(field.firstChild.innerHTML);
	field.removeChild(field.lastChild);
}

/**
 * click to remove
 */
function clickToRemove(event){
	var target = event.target;
	field.removeChild(target);
}

/**
 * initialize event handler
 */
function init(){
	addHandler(btnLIn, 'click', leftInHandler);
	addHandler(btnRIn, 'click', rightInHandler);
	addHandler(btnLOut, 'click', leftOutHandler);
	addHandler(btnROut, 'click', rightOutHandler);
	addHandler(field, 'click', clickToRemove);
}

init();