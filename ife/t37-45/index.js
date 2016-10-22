window.onload = function(e){
	var _ = function(query){
		return document.querySelector(query);
	};

	var m1 = zm(_('#m1'));
	var m2 = zm('#m2');

	var s1 = _('#s1');
	var s2 = _('#s2');

	//console.log(m1);
	//console.log(m2);

	addHandler(s1, 'click', function(e){
		m1.show();
	});

	addHandler(s2, 'click', function(e){
		m2.show();
	});

	var tableParams = {
		cols: [
			{index: 'name', title: '姓名'},
			{index: 'chi', title:'语文', sortable: null},
			{index: 'math', title: '数学', sortable: function(a, b){return b - a;}},
			{index: 'eng', title: '英语', sortable: null},
			{index: 'tot', title: '总分', sortable: null}
		],
		data: [
			{name: '小明', chi: 80, math: 90, eng: 70, tot: 240},
			{name: '小红', chi: 90, math: 70, eng: 100, tot: 260},
			{name: '小亮', chi: 60, math: 80, eng: 80, tot: 220},
			{name: '小明', chi: 80, math: 90, eng: 70, tot: 240},
			{name: '小红', chi: 90, math: 70, eng: 100, tot: 260},
			{name: '小亮', chi: 60, math: 80, eng: 80, tot: 220},
			{name: '小明', chi: 80, math: 90, eng: 70, tot: 240},
			{name: '小红', chi: 90, math: 70, eng: 100, tot: 260},
			{name: '小亮', chi: 60, math: 80, eng: 80, tot: 220},
			{name: '小明', chi: 80, math: 90, eng: 70, tot: 240},
			{name: '小红', chi: 90, math: 70, eng: 100, tot: 260},
			{name: '小亮', chi: 60, math: 80, eng: 80, tot: 220},
			{name: '小明', chi: 80, math: 90, eng: 70, tot: 240},
			{name: '小红', chi: 90, math: 70, eng: 100, tot: 260},
			{name: '小亮', chi: 60, math: 80, eng: 80, tot: 220},
			{name: '小明', chi: 80, math: 90, eng: 70, tot: 240},
			{name: '小红', chi: 90, math: 70, eng: 100, tot: 260},
			{name: '小亮', chi: 60, math: 80, eng: 80, tot: 220}
		]
	}

	var ts = document.querySelectorAll('.z-table');
	for(var i = 0; i < ts.length; i++){
		var t = zt(ts[i], tableParams);
		//console.log(t);
	}

	var s3 = _('#s3');
	var s4 = _('#s4');
	
	var d = zd(document.querySelectorAll('.z-date')[0]);
	//console.log(d);

	addHandler(s3, 'click', function(e){
		d.prevMonth();
	});

	addHandler(s4, 'click', function(e){
		d.nextMonth();
	});
};