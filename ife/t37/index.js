window.onload = function(e){
	var $ = function(query){
		return document.querySelector(query);
	};

	var m1 = zm($('#m1'));
	var m2 = zm('#m2');

	var s1 = $('#s1');
	var s2 = $('#s2');

	console.log(m1);
	console.log(m2);

	addHandler(s1, 'click', function(e){
		m1.show();
	});

	addHandler(s2, 'click', function(e){
		m2.show();
	});
};