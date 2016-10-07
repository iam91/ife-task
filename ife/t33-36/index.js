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
	_interval: 500,
	isRunning: false,

	born: function(){
		var init = $$('div');
		init.classList.add('box');
		init.style.transform = 'rotate(' + this._deg + 'deg)';
		
		this._curr = init;
		field.appendChild(this._curr);
		this._fix();
	},

	exec: function(directs){
		var execQ = [];
		var illegFlag = false;
		var illegIns = [];

		for(var i = 0; i < directs.length; i++){
			var direct = directs[i];
			var parts = direct.toLowerCase().split(' ');
			var parse = this._parse(parts);
			var meth = parse.meth;
			var param = parse.param;
			if(this[meth]){
				if(!illegFlag){
					this[meth](execQ, param);
				}
			}
			else{
				illegIns.push(i);
				illegFlag = true;
			}
		}

		if(illegFlag){
			return illegIns;
		}

		var j = 0;
		var t = -1;
		var that = this;
		this.isRunning = true;
		t = setInterval(function(){
			if(j < execQ.length){
				execQ[j++].call(that);
			}
			else{
				clearInterval(t);
				that.isRunning = false;
			}
		}, this._interval);

		return illegIns;
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
			};
		}
		else{
			return {
				meth: '_'
			};
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

	//The following are micor-instructions
	_micro_forward: function(){
		//compute new coordinates
		var tx = this._x + Math.sin(this._deg * Math.PI / 180);
		var ty = this._y - Math.cos(this._deg * Math.PI / 180);
		this._set(tx, ty);
		this._fix();
	},

	_micro_set_lef: function(){
		this._curr.style.transform = 'rotate(' + (this._deg = -90) + 'deg)';
	},

	_micro_set_rig: function(){
		this._curr.style.transform = 'rotate(' + (this._deg = 90) + 'deg)';
	},

	_micro_set_top: function(){
		this._curr.style.transform = 'rotate(' + (this._deg = 0) + 'deg)';
	},

	_micro_set_bot: function(){
		this._curr.style.transform = 'rotate(' + (this._deg = 180) + 'deg)';
	},

	_micro_tur_lef: function(){
		this._curr.style.transform = 'rotate(' + (this._deg -= 90) + 'deg)';
		this._fixAngle();
	},

	_micro_tur_rig: function(){
		this._curr.style.transform = 'rotate(' + (this._deg += 90) + 'deg)';
		this._fixAngle();
	},

	_micro_tur_bac: function(){
		this._curr.style.transform = 'rotate(' + (this._deg += 180) + 'deg)';
		this._fixAngle();
	},

	_micro_tra_lef: function(){
		this._micro_tra(-1, 0);
	},

	_micro_tra_rig: function(){
		this._micro_tra(1, 0);
	},

	_micro_tra_top: function(){
		this._micro_tra(0, -1);
	},

	_micro_tra_bot: function(){
		this._micro_tra(0, 1);
	},

	_micro_tra: function(aimX, aimY){
		var tx = this._x + aimX;
		var ty = this._y + aimY
		this._set(tx, ty);
		this._fix();
	},

	//The following are instruction execution functions.

	_go: function(execQ, dist){
		while((dist--) > 0){
			execQ.push(this._micro_forward);
		}
	},

	_tur_lef: function(execQ){
		execQ.push(this._micro_tur_lef);
	},
	
	_tur_rig: function(execQ){
		execQ.push(this._micro_tur_rig);
	},
	
	_tur_bac: function(execQ){
		execQ.push(this._micro_tur_bac);
	},

	_tra_lef: function(execQ, dist){
		while((dist--) > 0){
			execQ.push(this._micro_tra_lef);
		}
	},

	_tra_rig: function(execQ, dist){
		while((dist--) > 0){
			execQ.push(this._micro_tra_rig);
		}
	},

	_tra_top: function(execQ, dist){
		while((dist--) > 0){
			execQ.push(this._micro_tra_top);
		}
	},

	_tra_bot: function(execQ, dist){
		while((dist--) > 0){
			execQ.push(this._micro_tra_bot);
		}
	},

	_mov_lef: function(execQ, dist){
		execQ.push(this._micro_set_lef);
		while((dist--) > 0){
			execQ.push(this._micro_forward);
		}
	},

	_mov_rig: function(execQ, dist){
		execQ.push(this._micro_set_rig);
		while((dist--) > 0){
			execQ.push(this._micro_forward);
		}
	},

	_mov_top: function(execQ, dist){
		execQ.push(this._micro_set_top);
		while((dist--) > 0){
			execQ.push(this._micro_forward);
		}
	},

	_mov_bot: function(execQ, dist){
		execQ.push(this._micro_set_bot);
		while((dist--) > 0){
			execQ.push(this._micro_forward);
		}
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
	var serial = $('#serial');
	
	return function(e){
		var target = e.target;

		for(var i = 0; i < serial.children.length; i++){
			serial.children[i].classList.remove('warn');
		}

		if(box.isRunning){
			console.warn('Box is running.');
			return;
		}
		var val =  textWin.value;
		var dirs = val.split('\n');
		//TODO instructions validation
		var illegQ = box.exec(dirs, target);
		if(illegQ.length > 0){
			for(var i = 0; i < illegQ.length; i++){
				serial.children[illegQ[i]].classList.add('warn');
			}
		}
	};
})();

var refreshFn = (function(){
	var textWin = $('#win textarea');
	return function(e){
		textWin.value = '';
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

go 3
mov rig 3
tra lef 2
tur bac
tra rig 4
mov top 4
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

	addHandler($('#run'), 'click', runFn);
	addHandler($('#refresh'), 'click', refreshFn);
	addHandler($('#win'), 'keydown', serialFn);
	addHandler($('#win textarea'), 'scroll', scrollFn);
}

fieldRender();
box.born();