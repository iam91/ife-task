;(function(window, document){
	/**
	 * function for adding event handler
	 */
	var $$ = function(elem){
		return document.createElement(elem);
	};

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
	};

	ZText.prototype._initSerial = function(){};

	ZText.prototype.init = function(){};

})(window, document);


window.onload = function(e){

	var $ = function(query){
		return document.querySelectorAll(query);
	};
	
	var $$ = function(elem){
		return document.createElement(elem);
	};

	var t = $('.ztext');
	console.log(t);
};