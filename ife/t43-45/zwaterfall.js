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
	 * Remove event handler
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

	function ZWaterfall(base, params){
		this._base = base;
		this._modal = null;

		this._colCount = params && params.colCount || 4;
		this._cols = new Array(this._colCount);
		this._gutter = params && params.gutter || 16;
		//must use concat
		this._urls = [];
		this._urlIndex = 0;

		this._init(params);
	}

	ZWaterfall.prototype._init = function(params){
		/**
		 * Be careful of Array copy
		 */
		var t = params && params.urls || [];
		for(var i = 0; i < t.length; i++){
			this._urls.push(t[i]);
		}

		this._renderCols();
		this._renderModal();
		this.fetchPic();
	};

	ZWaterfall.prototype._handlerWrapper = function(fn, once, eventType){
		var _this = this;
		if(!once){
			return function(e){
				fn.call(_this, e);
			};
		}
		else{
			return function(e){
				removeHandler(this, eventType, arguments.callee);
				fn.call(_this, e);
			};
		}
	};

	ZWaterfall.prototype._renderModal = function(){
		modal = document.createElement('div');
		modal.classList.add('z-waterfall-modal');
		modal.style.visibility = 'hidden';
		this._modal = modal;
		document.body.appendChild(modal);
		addHandler(modal, 'click', this._handlerWrapper(this._hide));
	};

	ZWaterfall.prototype._show = function(e){
		var t = e.target.cloneNode(true);
		this._modal.appendChild(t);
		var w = t.clientWidth;
		var h = t.clientHeight;
		t.style.marginLeft = '-' + w/2 + 'px';
		t.style.marginTop = '-' + h/2 + 'px';
		this._modal.style.visibility = 'visible';
	};

	ZWaterfall.prototype._hide = function(e){
		var t = e.target;
		if(t === this._modal){
			this._modal.innerHTML = '';
			this._modal.style.visibility = 'hidden';
		}
	};

	ZWaterfall.prototype._renderPic = function(url){
		var img = document.createElement('img');
		var div = document.createElement('div');
		img.src = url;
		div.appendChild(img);
		div.classList.add('z-waterfall-pic');
		div.style.padding = this._gutter / 2 + 'px';

		addHandler(img, 'load', this._handlerWrapper(this.fetchPic, true, 'load'));
		addHandler(img, 'click', this._handlerWrapper(this._show, false));
		
		//find the shortest column
		var minPointer = this._cols[0];
		var min = minPointer.clientHeight;
		for(var i = 0; i < this._colCount; i++){
			var h = this._cols[i].clientHeight;
			if(min > h){
				min = h;
				minPointer = this._cols[i];
			}
		}

		minPointer.appendChild(div);
	};

	ZWaterfall.prototype._renderCols = function(){
		//render columns
		var colWidth = 100 / this._colCount;
		var frag = document.createDocumentFragment();
		for(var i = 0; i < this._colCount; i++){
			var col = document.createElement('div');
			col.style.width = colWidth + '%';
			col.classList.add('z-waterfall-col');
			frag.appendChild(col);

			this._cols[i] = col;
		}
		this._base.appendChild(frag);
	};

	//public
	ZWaterfall.prototype.fetchPic = function(){
		if(this._urlIndex < this._urls.length){
			var url = this._urls[this._urlIndex++];
			this._renderPic(url);
		}
	};

	ZWaterfall.prototype.loadMore = function(urls){
		/**
		 * Be careful of Array copy
		 */
		for(var i = 0; i < urls.length; i++){
			this._urls.push(urls[i]);
		}
		this.fetchPic();
	};

	ZWaterfall.prototype.allLoaded = function(){
		return this._urlIndex == this._urls.length;
	};

	function zw(q, params){
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
		return m ? new ZWaterfall(m, params) : null;
	}

	window.zw = zw;
})(window, document);