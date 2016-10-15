;(function(window, document){

	var $ = function(root, query){
		return root.querySelector(query);
	};
	
	/**
	 * Create DOM element
	 */
	var $$ = function(elem){
		return document.createElement(elem);
	};

	/**
	 * Add event handler
	 */
	function addHandler(elem, type, handler){
		if(elem.attachEvent){
			elem.attachEvent('on' + type, handler);
		}
		else if(elem.addEventListener){
			elem.addEventListener(type, handler, false);
		}
		else{
			elem['on' + type] = handler;
		}
	}

	function ZText(base){
		this._base = base;
		this._serial = null;
		this._win = null;

		this._num = 0;
		this._pre = '';
	};

	ZText.prototype._initSerial = function(){};

	ZText.prototype.init = function(){
		this._base.innerHTML = "<div class='ztext-serial'></div>" 
			+ "<div class='ztext-win' contenteditable='true'></div>";

		this._serial = $(this._base, '.ztext-serial');
		this._win = $(this._base, '.ztext-win');

		this._addLine();

		addHandler(this._base, 'keydown', this._handlerWrapper(this._newLineHandler));
		addHandler(this._base, 'keydown', this._handlerWrapper(this._backspaceHandler));
		addHandler(this._win, 'scroll', this._handlerWrapper(this._scrollHandler));
	};

	ZText.prototype._handlerWrapper = function(handler){
		var _this = this;
		return function(e){
			handler.call(_this, e);
		};
	};

	ZText.prototype._scrollHandler = function(e){
		this._serial.scrollTop = this._win.scrollTop;
	};

	ZText.prototype._newLineHandler = function(e){
		var target = e.target;
		var code = e.keyCode;
		if(code === 13){
			this._addLine();
		}
	};

	ZText.prototype._backspaceHandler = function(e){
		var target = e.target;
		var code = e.keyCode;

		if(code === 8){
			this._pre = target.innerText;
			var cursor = target.selectionStart;
			var incre = this._pre.substring(cursor - 1, cursor);
			console.log(cursor);
			if(incre === '\n'){
				this._num--;
				this._removeLine();
			}
		}
	};

	ZText.prototype._addLine = function(){
		var t = $$('div');
		t.innerHTML = (this._num++) + '.';
		this._serial.appendChild(t);
	};

	ZText.prototype._removeLine = function(){
		this._serial.removeChild(this._serial.lastChild);
	};

	window.ZText = ZText;
})(window, document);


window.onload = function(e){

	var $ = function(query){
		return document.querySelectorAll(query);
	};
	
	var $$ = function(elem){
		return document.createElement(elem);
	};

	var t = $('.ztext');
	var zt = new ZText(t[0]);
	zt.init();
};