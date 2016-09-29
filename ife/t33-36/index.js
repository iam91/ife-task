var $ = function(query){
	return document.querySelector(query);
};
var $$ = function(elem){
	return document.createElement(elem);
};

var field = $('#field');
var fieldWidth = 10;
var fieldHeight = 10;

var box = {
	_x: 0,
	_y: 9,
	_deg: 0,
	_curr: null,
	
	_pos: function(x, y){
		return x + fieldWidth * y;
	},

	born: function(){
		var init = field.children[this._pos(this._x, this._y)];
		init.classList.remove('grid');
		init.classList.add('box');
		init.style.transform = 'rotate(' + this._deg + 'deg)';
		this._curr = init;
	},

	go: function(){
		this._curr.classList.remove('box');
		this._curr.classList.add('grid');

		//compute new coordinates
		var tx = this._x + 1 * Math.sin(this._deg * Math.PI / 180.0);
		var ty = this._y - 1 * Math.cos(this._deg * Math.PI / 180.0);

		//move if it's not moving out of the field
		this._x = (tx >= 0 && tx < fieldWidth) ? tx : this._x;
		this._y = (ty >= 0 && ty < fieldHeight) ? ty : this._y;

		var next = field.children[this._pos(this._x, this._y)];

		next.classList.remove('grid');
		next.classList.add('box');

		this._curr = next;
	},

	turnLeft: function(){
		this._curr.style.transform = 'rotate(' + (this._deg -= 90) + 'deg)';
	},
	
	turnRight: function(){
		this._curr.style.transform = 'rotate(' + (this._deg += 90) + 'deg)';
	},
	
	turnBack: function(){
		this._curr.style.transform = 'rotate(' + (this._deg += 180) + 'deg)';
	}
};

function exec(direct){
	if(/^GO/.test(direct)){
		box.go();
	}
	else if(/^TUN/.test(direct)){
		if(/.*LEF$/.test(direct)){
			box.turnLeft();
		}
		else if(/.*RIG/.test(direct)){
			box.turnRight();
		}
		else if(/.*BAC/.test(direct)){
			box.turnBack();
		}
	}
}

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
		var dir = direct.value.trim();
		exec(dir);
	});
}

fieldRender();
box.born();

console.log(Math.sin(-90 * Math.PI / 180));