;(function(window, document){
	
	var $$ = function(elem){
		return document.createElement(elem);
	};

	/**
	 * function for adding event handler
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
		this._lines = [];
	};

	ZText.prototype._initSerial = function(){};

	ZText.prototype.init = function(){
		this._base.innerHTML = "<div class='serial'></div>" 
			+ "<div class='win' contenteditable='true'></div>";
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
	console.log(zt);
};