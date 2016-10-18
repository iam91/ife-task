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
		this._innerOffsetX = 0;
		this._innerOffsetY = 0;
		this._randomClickHandler = null;
		this._dragHandler = null;
		this._dragStartHandler = null;
		this._dragStopHandler = null;
		this._init();
	}

	ZModal.prototype._init = function(){
		this._content = this._base.querySelector('.z-modal-content');
		addHandler(this._base, 'click', this._randomClickHandler = this._handlerWrapper(this._randomClick));
		addHandler(this._content, 'mousedown', this._dragStartHandler = this._handlerWrapper(this._dragStart));
		addHandler(this._content, 'mouseup', this._dragStopHandler = this._handlerWrapper(this._dragStop));
	};

	ZModal.prototype._drag = function(e){
		this._content.style.left = e.pageX - this._innerOffsetX + 'px';
		this._content.style.top = e.pageY - this._innerOffsetY + 'px';
	};

	ZModal.prototype._dragStart = function(e){
		this._content.style.left = this._content.offsetLeft + 'px';
		this._content.style.top = this._content.offsetTop + 'px';
		this._content.style.margin = '0';
		this._innerOffsetX = e.pageX - this._content.offsetLeft;
		this._innerOffsetY = e.pageY - this._content.offsetTop;
		addHandler(this._content, 'mousemove', this._dragHandler = this._handlerWrapper(this._drag));
	};

	ZModal.prototype._dragStop = function(e){
		removeHandler(this._content, 'mousemove', this._dragHandler);
		this._dragHandler = null;
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