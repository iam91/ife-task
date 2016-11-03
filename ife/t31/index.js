var $ = function(query){
	return document.querySelector(query);
};

var $$ = function(elem){
	return document.createElement(elem);
};

var radios = $('.switch');
var citySelect = $('.switch-content .city');
var schoolSelect = $('.switch-content .school');

var city = ['beijing', 'chengdu'];
var school = {
	'beijing': ['qinghua', 'beida'],
	'chengdu': ['chuanda', 'uestc']
};

function renderSchool(schooldata){
	for(var j = 0; j < schooldata.length; j++){
		var schoolName = schooldata[j];
		var newOption = $$('option');
		newOption.setAttribute('value', schoolName);
		newOption.innerHTML = schoolName;
		schoolSelect.appendChild(newOption);
	}
}

function selectInit(){
	var initCity = city[0];
	for(var i = 0; i < city.length; i++){
		var cityName = city[i];
		var newOption = $$('option');
		newOption.setAttribute('value', cityName);
		newOption.innerHTML = cityName;
		citySelect.appendChild(newOption);
	}
	renderSchool(school[initCity]);
}

function cityChangeHandler(e){
	var index = citySelect.selectedIndex;
	var cityName = citySelect.options[index].value;
	schoolSelect.innerHTML = '';
	renderSchool(school[cityName]);
}

function switchHandler(e){
	var target = e.target;
	if(target.checked){
		var checkedValue = target.value;
		var checkedDiv = $('.switch-content .' + checkedValue);
		checkedDiv.setAttribute('class', 
			checkedDiv.getAttribute('class').replace('hide', 'show'));
		if(checkedValue === 'student'){
			var uncheckedDiv = $('.switch-content .' + 'nonstudent');
		}
		else if(checkedValue === 'nonstudent'){
			var uncheckedDiv = $('.switch-content .' + 'student');
		}
		uncheckedDiv.setAttribute('class', 
			uncheckedDiv.getAttribute('class').replace('show', 'hide'));
	}
}

addHandler(radios, 'click', switchHandler);
addHandler(citySelect, 'change', cityChangeHandler);
selectInit();