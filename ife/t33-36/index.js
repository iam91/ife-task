var $ = function(query){
	return document.querySelector(query);
};
var $$ = function(elem){
	return document.createElement(elem);
};

var field = $('#field');
var fieldWidth = 10;
var fieldHeight = 10;
var boxSize = 52;

var box = {
	_x: 0,
	_y: 9,
	_deg: 0,
	_curr: null,

	born: function(){
		var init = $$('div');
		init.classList.add('box');
		init.style.transform = 'rotate(' + this._deg + 'deg)';
		
		this._curr = init;
		field.appendChild(this._curr);
		this._fix();
	},

	exec: function(direct){
		var parts = direct.toLowerCase().split(' ');

		var parse = this._parse(parts);

		var meth = parse.meth;
		var param = parse.param;

		console.log(meth);
		this[meth](param);
	},

	_parse: function(parts){
		var ins = parts[0];
		if(/^(go|tra|mov)/.test(ins)){
			return {
				meth: '_' + parts.slice(0, parts.length - 1).join('_'), 
				param: parseInt(parts[parts.length - 1])
			};
		}
		else if(/^tur/.test(ins)){
			return {
				meth: '_' + parts.join('_')
			}
		}
	},
	
	_fix: function(){
		this._curr.style.left = this._x * boxSize + 'px';
		this._curr.style.top = this._y * boxSize + 'px';
	},

	_fixAngle: function(){
		this._deg = this._deg < -180 ? this._deg + 360 : this._deg;
		this._deg = this._deg > 180 ? this._deg - 360 : this._deg;
	},

	_set: function(tx, ty){
		//move if it's not moving out of the field
		this._x = (tx >= 0 && tx < fieldWidth) ? tx : this._x;
		this._y = (ty >= 0 && ty < fieldHeight) ? ty : this._y;
	},

	//The following are instruction execution functions.

	_go: function(dist){
		//compute new coordinates
		var tx = this._x + dist * Math.sin(this._deg * Math.PI / 180);
		var ty = this._y - dist * Math.cos(this._deg * Math.PI / 180);

		this._set(tx, ty);
		this._fix();
	},

	_tur_lef: function(){
		this._curr.style.transform = 'rotate(' + (this._deg -= 90) + 'deg)';
		this._fixAngle();
	},
	
	_tur_rig: function(){
		this._curr.style.transform = 'rotate(' + (this._deg += 90) + 'deg)';
		this._fixAngle();
	},
	
	_tur_bac: function(){
		this._curr.style.transform = 'rotate(' + (this._deg += 180) + 'deg)';
		this._fixAngle();
	},

	_tra_lef: function(dist){
		var tx = this._x - dist;
		this._set(tx, this._y);
		this._fix();
	},

	_tra_rig: function(dist){
		var tx = this._x + dist;
		this._set(tx, this._y);
		this._fix();
	},

	_tra_top: function(dist){
		var ty = this._y - dist;
		this._set(this._x, ty);
		this._fix();
	},

	_tra_bot: function(dist){
		var ty = this._y + dist;
		this._set(this._x, ty);
		this._fix();
	},

	_mov_lef: function(dist){
		this._curr.style.transform = 'rotate(' + (this._deg = -90) + 'deg)';
		this._go(dist);
	},

	_mov_rig: function(dist){
		this._curr.style.transform = 'rotate(' + (this._deg = 90) + 'deg)';
		this._go(dist);
	},

	_mov_top: function(dist){
		this._curr.style.transform = 'rotate(' + (this._deg = 0) + 'deg)';
		this._go(dist);
	},

	_mov_bot: function(dist){
		this._curr.style.transform = 'rotate(' + (this._deg = 180) + 'deg)';
		this._go(dist);
	}
};

var serialFn = (function(){
	var serial = $('#serial');
	var num = 0;

	var pre = '';
	var incre = 0;

	function add(){
		var t = $$('div');
		t.innerHTML = (num++) + '.';
		serial.appendChild(t);
	}

	function del(){
		serial.removeChild(serial.lastChild);
	}

	add();

	return function(e){
		var target = e.target;
		var code = e.keyCode;

		var val = target.value;
		pre = val;

		if(code === 13){
			add();
			serial.scrollTop = target.scrollTop;
		}
		else if(code === 8){
			var cursor = target.selectionStart;
			var incre = pre.substring(cursor - 1, cursor);
			if(incre === '\n'){
				num--;
				del();
			}
		}
	};

})();

var scrollFn = (function(){
	var serial = $('#serial');
	var textWin = $('#win textarea');

	return function(e){
		var scrollTop = textWin.scrollTop;
		serial.scrollTop = scrollTop;
	};
})();

var runFn = (function(){
	var textWin = $('#win textarea');
	
	return function(e){
		e.target.disabled = 'disabled';
		var val =  textWin.value;
		var dirs = val.split('\n');

		//TODO instructions validation

		var i = 0;
		var t = -1;

		function run(){
			if(i >= dirs.length){
				e.target.disabled = ''
				clearInterval(t);
				return;
			}
			var curr = dirs[i++];
			box.exec(curr);
		}

		setInterval(run, 600);
		/*
		for(var i = 0; i < dirs.length; i++){
			var currDir = dirs[i].trim();
			
		}*/
	};
})();

/*
GO
GO
GO
GO
TUR RIG
GO
GO
GO
TUR RIG
MOV LEF
MOV LEF
TUR RIG
GO
GO
TUR BAC
MOV RIG
MOV RIG
*/

function fieldRender(){
	var fieldArea = fieldWidth * fieldHeight;
	var gridTemplate = "<div class='grid'></div>";
	var fieldHTML = '';

	for(var i = 0; i < fieldArea; i++){
		fieldHTML += gridTemplate;
	}
	field.innerHTML = fieldHTML;

	var runBtn = $('#run');
	var refreshBtn = $('#refresh');

	addHandler(runBtn, 'click', runFn);
	addHandler($('#win'), 'keydown', serialFn);
	addHandler($('#win textarea'), 'scroll', scrollFn);
}

fieldRender();
box.born();

console.log('123'.substring(3));