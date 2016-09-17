/**
 * store the data
 */
var array = new Array();

/**
 * basic elements
 */
var input = document.getElementById('input');
var btnLIn = document.getElementById('btn-lin');
var btnRIn = document.getElementById('btn-rin');
var btnLOut = document.getElementById('btn-lout');
var btnROut = document.getElementById('btn-rout');

var bubbleSort = document.getElementById('bubble-sort');

var field = document.getElementById('field');

/**
 * displacement computation
 */
function displace(indexInArray){
	//TODO do not hard code it
	var width = 24;
	return indexInArray * width;
}

/**
 * create list elements
 */
function createElem(val){
	var newChild = document.createElement('div');
	newChild.setAttribute('class', 'elem');
	newChild.style.height = val + 'px';
	return newChild;
}

/**
 * input validation
 */
function validate(val){
	if(array.length < 60){
		var ret = val.replace(/\s+/g, '');
		var vali = /^\d+$/;
		if(vali.test(ret)){
			var inputVal = parseInt(ret);
			if(inputVal <= 100 && inputVal >= 10){
				return ret;
			}
			else{
				alert('Input should be in the range of 10-100');
				return null;
			}
		}
		else{
			alert('Input should be an integer');
			return null;
		}
	}
	else{
		alert('There should be no more than 60 items');
		return null;
	}
}


/**
 * left in handler
 */
function leftInHandler(){
	var val = validate(input.value);
	if(val !== null){
		var t = createElem(val);
		array.unshift([val, t]);
		t.style.left = displace(0) + 'px';
		field.insertBefore(t, field.firstChild);
		var id = 1;
		while(t.nextSibling){
			t.nextSibling.style.left = displace(id++) + 'px';
			t = t.nextSibling;
		}
	}
	console.log(array);
}

/**
 * right in handler
 */
function rightInHandler(){
	var val = validate(input.value);
	if(val !== null){
		var t = createElem(val);
		array.push([val, t]);
		t.style.left = displace(array.length - 1) + 'px';
		field.appendChild(t);
	}
	console.log(array);
}

/**
 * left out handler
 */
function leftOutHandler(){
	var d = array.shift();
	alert(d[0]);
	//array.shift();
	var t = d[1];
	t.style.visibility = 'hidden';
	var id = 0;
	while(t.nextSibling){
		t.nextSibling.style.left = displace(id++) + 'px';
		t = t.nextSibling;
	}
	field.removeChild(d[1]);
	console.log(array);
}

/**
 * right out handler
 */
function rightOutHandler(){
	var d = array.pop();
	alert(d[0]);
	//array.pop();
	field.removeChild(d[1]);
	console.log(array);
}

/**
 * click to remove
 */
function clickToRemove(event){
	var target = event.target;
	field.removeChild(target);
}

/**
 * sort handler
 */
function bubbleSortHandler(event){
	btnLIn.disabled = true;
	btnRIn.disabled = true;
	btnLOut.disabled = true;
	btnROut.disabled = true;
	event.target.disabled = true;
	bubble(array, event.target)();
}

function swap(array, i, j){
	var t = array[i];
	array[i] = array[j];
	array[j] = t;
}

/**
 * sort function
 */
function bubble(arr, btn){
	var array = arr, n = arr.length, i = n - 1, j = 0;
	var interval = 50;
	return function(){
		if(i > -1){
			if(j < i){
				if(array[j][0] > array[j + 1][0]){
					array[j][1].style.left = displace(j + 1) + 'px';
					array[j + 1][1].style.left = displace(j) + 'px';
					swap(array, j, j + 1);
				}
				j++
			}
			else{
				i--;
				j = 0;
			}
			setTimeout(arguments.callee, interval);
		}
		else{
			btnLIn.disabled = false;
			btnRIn.disabled = false;
			btnLOut.disabled = false;
			btnROut.disabled = false;
			btn.disabled = false;
		}
	}
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
	addHandler(bubbleSort, 'click', bubbleSortHandler);
}

init();

/**
 * 生成模拟数据进行演示
 */
(function(){
	for(var i = 10; i < 50; i++){
		input.value = i;
		leftInHandler();
	}
})();