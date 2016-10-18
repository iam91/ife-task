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
	/**
	 * function for remove event handler
	 */
	function removeHandler(element, type, handler){
		if(element.removeEventListener){
			element.removeEventListener(type, handler, false);
		} 
		else if(element.detachEvent){
			element.detachEvent('on' + type, handler);
		} 
		else{
			element['on' + type] = null;
		}
	}

	var showClass = 'z-modal-show';
	
	function ZModal(base){
		this._base = base;
		this._content = null;
		this._preX = 0;
		this._preY = 0;
		this._randomClickHandler = null;
		this._mousemoveHandler = null;
		this._mousedownHandler = null;
		this._mouseupHandler = null;
		this._init();
	}

	ZModal.prototype._init = function(){
		this._content = this._base.querySelector('.z-modal-content');
		addHandler(this._base, 'click', this._randomClickHandler = this._handlerWrapper(this._randomClick));
		addHandler(this._content, 'mousedown', this._mousedownHandler = this._handlerWrapper(this._mousedown));
		addHandler(this._content, 'mouseup', this._mouseupHandler = this._handlerWrapper(this._mouseup));
	};

	ZModal.prototype._mousemove = function(e){
		this._content.style.left = e.pageX - this._preX + 'px';
		this._content.style.top = e.pageY - this._preY + 'px';
	};

	ZModal.prototype._mousedown = function(e){
		this._content.style.left = this._content.offsetLeft + 'px';
		this._content.style.top = this._content.offsetTop + 'px';
		this._content.style.margin = '0';
		this._preX = e.pageX - this._content.offsetLeft;
		this._preY = e.pageY - this._content.offsetTop;
		addHandler(this._content, 'mousemove', this._mousemoveHandler = this._handlerWrapper(this._mousemove));
	};

	ZModal.prototype._mouseup = function(e){
		removeHandler(this._content, 'mousemove', this._mousemoveHandler);
		this._mousemoveHandler = null;
	}

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