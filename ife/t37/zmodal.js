;(function(window, document){
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

	var showClass = 'z-modal-show';
	
	function ZModal(base){
		this._base = base;
		this._init();
	}

	ZModal.prototype._init = function(){
		addHandler(this._base, 'click', this._handlerWrapper(this._randomClick));
	};

	ZModal.prototype._randomClick = function(e){
		if(e.target === e.currentTarget){
			this.hide();
		}
	};

	ZModal.prototype._handlerWrapper = function(handler){
		var _this = this;
		return function(e){
			handler.call(_this, e);
		};
	};

	ZModal.prototype.show = function(){
		this._base.classList.add(showClass);
	};

	ZModal.prototype.hide = function(){
		this._base.classList.remove(showClass);
	};

	function zm(q){
		var m = null;
		if(typeof q === 'string'){
			m = document.querySelector(q);
		}
		else if(q instanceof Element){
			m = q;
		}
		else{
			return null;
		}
		return new ZModal(m);
	}

	window.zm = zm;
})(window, document);