var $ = function(query){
	return document.querySelector(query);
}

var tagIn = $('#tag-in');
var favIn = $('#fav-in');
var favBtn = $('#fav-btn');

var tags = $('#tags');
var favs = $('#favs');

function textParse(text){
	var texts = text.split(/[\s, \,, ，, 、]+/);
	return texts;
}

function addItems(queue, inner, className){
	var newChild = document.createElement('div');
	newChild.setAttribute('class', className);
	newChild.innerHTML = inner;
	if(queue.children.length >= 10){
		queue.removeChild(queue.firstChild);
	}
	queue.appendChild(newChild);
}

function favClickHandler(event){
	var texts = textParse(favIn.value.trim());
	for(var i = 0; i < texts.length; i++){
		if(texts[i] !== ''){
			addItems(favs, texts[i], 'fav');
		}
	}
	favIn.value = '';
}

function tagInHandler(event){
	var keyCode = event.keyCode;
	//TODO add chinese input
	if(keyCode === 13 || keyCode === 32 || keyCode === 188){
		var tag = tagIn.value.trim();
		if(tag !== ''){
			addItems(tags, tag, 'tag');
			tagIn.value = '';
		}
		//prevent 13 32 188 from being put into the text box
		event.preventDefault();
	}
}

function hoverIn(target){
	target.setAttribute('class',
		target.getAttribute('class') + ' hover');
	var oldInner = target.innerHTML;
	target.innerHTML = '删除 ' + oldInner;
}
function hoverOut(target){
	var oldClass = target.getAttribute('class');
	var oldInner = target.innerHTML;

	var splitClass = oldClass.split(/\s+/);
	var newClass = '';
	for(var i = 0; i < splitClass.length - 1; i++){
		newClass += splitClass[i];
	}

	var splitInner = oldInner.split(/\s+/);
	var newInner = '';
	for(var i = 1; i < splitClass.length; i++){
		newInner += splitInner[i];
	}


	target.setAttribute('class', newClass);
	target.innerHTML = newInner;
}
function hoverHandler(event){
	var eventType = event.type;
	
	if(event.target !== event.currentTarget){
		switch(eventType){
			case 'mouseout':
				hoverOut(event.target);
				break;
			case 'mouseover':
				hoverIn(event.target);
				break;
			default:
				break;
		}
	}
}

function delHandler(event){
	var target = event.target;
	var currClass = target.getAttribute('class');
	var splitClass = currClass.split(/\s+/);
	if(splitClass[splitClass.length - 1] === 'hover'){
		target.parentNode.removeChild(target);
	}
}

function addLabelHandlers(labels){
	addHandler(labels, 'mouseover', hoverHandler);
	addHandler(labels, 'mouseout', hoverHandler);
	addHandler(labels, 'click', delHandler);
}

/**
 * attach event handlers and other initializations
 */
function init(){
	/* white characters detection */
	addHandler(tagIn, 'keydown', tagInHandler);
	addHandler(favBtn, 'click', favClickHandler);
	addLabelHandlers(favs);
	addLabelHandlers(tags);
}

init();