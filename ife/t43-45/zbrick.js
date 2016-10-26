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

	function arrayAppend(r, arr){
		for(var i = 0; i < arr.length; i++){
			r.push(arr[i]);
		}
		return r;
	}
	
	function ZBrick(base, params){
		this._base = base;

		this._minHeight = params && params.minHeight || 150;
		this._minPerRow = params && params.minPerRow || 3;
		this._maxPerRow = params && params.maxPerRow || 6

		this._urls = [];
		this._urlIndex = 0;
		this._cache = [];

		this._init(params);
	}

	ZBrick.prototype._init = function(params){
		/**
		 * Be careful of Array copy
		 */
		var t = params && params.urls || [];
		arrayAppend(this._urls, t);
	};

	ZBrick.prototype._handlerWrapper = function(fn, once, eventType){
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

	ZBrick.prototype._tryRenderPic = function(e){
		this._cache.push(e.target);
		if(this._cache.length >= this._maxPerRow){
			var totWidth = this._base.clientWidth;
			var totPicWidth = 0;
			var id = 0;
			while(id < this._cache.length){
				var img = this._cache[id];
				var w = this._minHeight * img.width / img.height;
				totPicWidth += w
				id++;
				if(totPicWidth > totWidth){
					totPicWidth -= w;
					id--;
					break;
				}
			}

			var styleHeight = parseInt(this._minHeight * totWidth / totPicWidth);

			var row = document.createElement('div');
			row.classList.add('z-brick-row');
			for(var i = 0; i < id; i++){
				var img = this._cache.shift();

				var wiggle = 0.98;
				var styleWidth = parseInt(styleHeight * img.width / img.height) * wiggle;

				var imgWrapper = document.createElement('div');

				imgWrapper.style.width = styleWidth + 'px';
				imgWrapper.style.height = styleHeight + 'px';

				imgWrapper.appendChild(img);
				row.appendChild(imgWrapper);
			}
			this._base.appendChild(row);
		}
		console.log(this._cache.length);
		this.fetchPic();
	};

	ZBrick.prototype.fetchPic = function(){
		if(this._urlIndex < this._urls.length){
			var url = this._urls[this._urlIndex++];
			var img = document.createElement('img');
			img.src = url;
			addHandler(img, 'load', 
				this._handlerWrapper(this._tryRenderPic, true, 'load'));
		}
	};


	function zb(q, params){
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
		return m ? new ZBrick(m, params) : null;
	}

	window.zb = zb;
})(window, document);