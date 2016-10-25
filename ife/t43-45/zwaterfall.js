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

		this._colCount = params && params.colCount || 4;
		this._cols = new Array(this._colCount);
		this._gutter = params && params.gutter || 16;
		this._urls = params && params.urls || [];
		this._urlIndex = 0;

		this._init();
	}

	ZWaterfall.prototype._init = function(){
		this._renderCols();
		this._fetchPic();
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

	ZWaterfall.prototype._fetchPic = function(e){
		if(this._urlIndex < this._urls.length){
			var url = this._urls[this._urlIndex++];
			this._renderPic(url);
		}
	};

	ZWaterfall.prototype._renderPic = function(url){
		var img = document.createElement('img');
		var div = document.createElement('div');
		img.src = url;
		div.appendChild(img);
		div.classList.add('z-waterfall-pic');
		div.style.padding = this._gutter / 2 + 'px';

		addHandler(img, 'load', t = this._handlerWrapper(this._fetchPic, true, 'load'));
		
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