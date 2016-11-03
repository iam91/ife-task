var $ = function(query){
	return document.querySelector(query);
};

var field = $('#field');
var searchText = $('#search-text');
var searchBtn = $('#search-btn');

function searchHandler(event){
	var searchValue = searchText.value.trim();
	if(searchValue && searchValue !== ''){
		view.search(searchValue);
	}
}

var view = null;
var model = null;

function init(){
	model = new DirModel(mock);
	view = new DirView(field, model);
	ctrl = new DirControl(view, model);

	addHandler(searchBtn, 'click', searchHandler);
}

init();

