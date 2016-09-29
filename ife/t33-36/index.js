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
		var meth = '_' + parts.join('_');
		console.log(meth);
		this[meth]();
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

	_go: function(){
		//compute new coordinates
		var tx = this._x + 1 * Math.sin(this._deg * Math.PI / 180);
		var ty = this._y - 1 * Math.cos(this._deg * Math.PI / 180);

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

	_tra_lef: function(){
		var tx = this._x - 1;
		this._set(tx, this._y);
		this._fix();
	},

	_tra_rig: function(){
		var tx = this._x + 1;
		this._set(tx, this._y);
		this._fix();
	},

	_tra_top: function(){
		var ty = this._y - 1;
		this._set(this._x, ty);
		this._fix();
	},

	_tra_bot: function(){
		var ty = this._y + 1;
		this._set(this._x, ty);
		this._fix();
	},

	_mov_lef: function(){
		this._curr.style.transform = 'rotate(' + (this._deg = -90) + 'deg)';
		this._go();
	},

	_mov_rig: function(){
		this._curr.style.transform = 'rotate(' + (this._deg = 90) + 'deg)';
		this._go();
	},

	_mov_top: function(){
		this._curr.style.transform = 'rotate(' + (this._deg = 0) + 'deg)';
		this._go();
	},

	_mov_bot: function(){
		this._curr.style.transform = 'rotate(' + (this._deg = 180) + 'deg)';
		this._go();
	}
};

var serialFn = (function(){
	var serial = $('#serial');
	var num = 0;

	function add(){
		var t = $$('div');
		t.innerHTML = (num++) + '.';
		serial.appendChild(t);
	}

	function validate(){
		//TODO
	};

	add();

	return function(e){
		var target = e.target;
		var code = e.keyCode;
		if(code === 13){
			add();
			serial.scrollTop = target.scrollTop;
			validate();
		}
		else if(code === 8){
			
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

function fieldRender(){
	var fieldArea = fieldWidth * fieldHeight;
	var gridTemplate = "<div class='grid'></div>";
	var fieldHTML = '';

	for(var i = 0; i < fieldArea; i++){
		fieldHTML += gridTemplate;
	}
	field.innerHTML = fieldHTML;

	var direct = $('#direct input[type="text"]');
	var button = $('#direct input[type="button"]');

	addHandler(button, 'click', function(e){
		var dirs = direct.value.trim();
		box.exec(dirs);
	});

	addHandler($('#win'), 'keyup', serialFn);
	addHandler($('#win textarea'), 'scroll', scrollFn);
}

fieldRender();
box.born();