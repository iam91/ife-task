;(function(window, document){

	'use strict';

	/** 
	 * @typedef LoadCacheItem
	 * @type {Object} 
	 * @property {HTMLImageElement} img - Store the element.
	 * @property {boolean} commit - Indicate whether the image can be committed.
	 */

	/**
	 * @typedef cacheItem
	 * @type {Object}
	 * @property {HTMLElement} wrapper - Element wrapping the image.
	 * @property {HTMLImageElement} img - The image.
	 * @property {number} urlIndex - Index in urls and loadCache.
	 * @property {string} title - Image title.
	 */

	/**
	 * @typedef MonitorItem
	 * @type {Object}
	 * @property {HTMLImageElement} img - Store the element.
	 * @property {number} width - Width before checking.
	 * @property {number} height - Height bofore checking.
	 */

	/**
	 * @typedef ClipCompatible
	 * @type {Object}
	 * @property {HTMLElement} svg
	 * @property {HTMLElement} style
	 */

	/**
	 * @typedef BrickRow
	 * @type {Object}
	 * @property {number} ratio Height to width ratio of the brick row.
	 */

	/**
	 * Util
	 * @namespace
	 */
	var Util = {
		addHandler: function(elem, type, handler){
			if(elem.attachEvent){
				elem.attachEvent('on' + type, handler);
			}
			else if(elem.addEventListener){
				elem.addEventListener(type, handler, false);
			}
			else{
				elem['on' + type] = handler;
			}
		},

		removeHandler: function(ele, type, handler){
			if(ele.removeEventListener){
				ele.removeEventListener(type, handler, false);
			} 
			else if(ele.detachEvent){
				ele.detachEvent('on' + type, handler);
			} 
			else{
				ele['on' + type] = null;
			}
		},

		/**
		 * Rectify execution context of event handlers.
		 * Remove the event handler if it's intended to execute only once.
		 * @param {Function} handler Event handler.
		 * @param {Object} context Execution context of the event handler.
		 * @param {boolean} once Indicate whether the handler is intended to execute only once.
		 * @param {string} eventType The event type.
		 */
		eventHandlerWrapper: function(handler, context, once, eventType){
			var h = function(e){
				if(once){
					Util.removeHandler(this, eventType, h);
				}
				handler.call(context, e);
			};
			return h;
		},

		arrayAppend: function(head, tail){
			for(var i = 0; i < tail.length; i++){
				head.push(tail[i]);
			}
			return head;
		},

		arrayClear: function(arr){
			while(arr.length > 0){
				arr.pop();
			}
		},

		/**
		 * Used in jigsaw layout
		 * @param {HTMLElement} wrapper Element wraps the image.
		 * @param {HTMLEImageElement} img Image needs clipping.
		 * @param {number} r Height to width ratio.
		 * @param {number} index Index of the image, used to add to clip-path ids to distinguish clip-paths.
		 * @param {number} count Number of images to be showed.
		 * @return {ClipCompatible} HTML elements used to make clip-path compatible.
		 */
		imageClip: function(wrapper, img, r, isRect, index, count){
			var w = img.width;
			var h = img.height;

			var svgHead = '<svg width="0" height="0"><defs><clipPath id="clip-shape-' 
				+ index + '" clipPathUnits="objectBoundingBox">';
			var svgTail = '</clipPath></defs></svg>';

			if(h / w > r){
				img.classList.add(ClassName.V_CLIP);
				if(!isRect){
					var ww = w;
					var hh = ww * r;
					var x = 1 / 3;
					var polygon = '<polygon points="' + x + ' 0, 1 0, 1 1, 0 1"/>';
				}
			}else{
				img.classList.add(ClassName.H_CLIP);
				if(!isRect){
					var hh = h;
					var ww = hh / r;
					var x1 = ww * 0.5 / w;
					var x2 = ww / w + 0.01;
					var polygon = '<polygon points="' + x1 + ' 0, ' + x2 + ' 0, ' + x2 + ' 1, 0 1"/>';
				}
			}

			if(!isRect){
				var styleInner = '.' + ClassName.JIGSAW_X + count + " div.wrapper:nth-child(" + (index + 1) 
					+ "){-webkit-clip-path: url('#clip-shape-" + index 
					+ "');clip-path: url('#clip-shape-" + index + "');}";
				var t = document.createElement('div');
				var s = document.createElement('style');
				t.innerHTML = svgHead + polygon + svgTail;
				s.innerHTML = styleInner;
				s.type = "text/css";
				document.body.appendChild(t);
				document.head.appendChild(s);
				return {svg: t, style: s};
			}else{
				return null;
			}
		}
	};

	/**
	 * @private
	 * @readonly
	 * @enum {number}
	 */
	var ClassName = {
		MODAL:             'z-g-modal',
		MODAL_BANNER:      'z-g-modal-banner',
		MODAL_BANNER_PREV: 'z-g-modal-b-prev',
		MODAL_BANNER_MID:  'z-g-modal-b-mid',
		MODAL_BANNER_NEXT: 'z-g-modal-b-next',
		MODAL_HIDE:        'z-g-modal-hide',
		MODAL_SHOW:    	   'z-g-modal-show',
		JIGSAW_G:      	   'z-g-jigsaw',
		JIGSAW_X:          'z-g-jigsaw-',
		WATERFALL_G:       'z-g-waterfall',
		WATERFALL_COL:     'z-g-waterfall-col',
		BRICK_G:           'z-g-brick',
		BRICK_ROW:         'z-g-brick-row',
		V_CLIP:            'v-clip',
		H_CLIP:            'h-clip',
		WIDTH_FIRST:       'w-first',
		HEIGHT_FIRST:      'h-first',
		ARROW_PREV:        'arrow-prev',
		ARROW_NEXT:        'arrow-next',
		ARROW:             'arrow',
		WRAPPER:           'wrapper',
		WRAPPER_DELETED:   'wrapper-deleted',
		INFO:              'info',
		DEL:               'del',
		LOADING:           'loading',
		LOADING_HIDE:      'loading-hide',
		LOADING_SHOW:      'loading-show'
	};

	/**
	 * GlobalConst
	 * @readonly
	 * @namespace
	 */
	var GlobalConst = {
		jigsaw: {
			max:    6,
			ratio:  9 / 15,
			ratios: {
						'1': [9 / 15],
						'2': [9 / 10, 9 / 10],
						'3': [9 / (15 - 4.5), 1, 1],
						'4': [9 / 15, 9 / 15, 9 / 15, 9 / 15],
						'5': [6 / 10, 1, (9 - 5) / 5, 9 / 15, 9 / 15],
						'6': [9 / 15, 9 / 15, 9 / 15, 9 / 15, 9 / 15, 9 / 15]
					}
		}
	}

	

	/**
	 * ZGallery class
	 * @public
	 * @constructor
	 * @param {HTMLElement} g Base container of zgallery.
	 */
	function ZGallery(g){

		/**
		 * Common member variables
		 * @private
		 */
		this._urls = [];
		this._title = [];
		/**
		 * @type {LoadCacheItem}
		 */
		this._loadCache = [];
		this._commitCursor = 0;
		this._timeout = 5000;
		/**
		 * @type {CacheItem}
		 */
		this._cache = [];
		this._cacheCursor = 0;
		this._urlIndex = 0;


		this._g = g;
		this._layout = this.LAYOUT.JIGSAW;
		this._initialized = false;
		this._isBinded = false;
		this._gutterX = 0;
		this._gutterY = 0;
		this._enableFullScreen = true;
		
		this._modal = null;
		this._banner = null;
		this._bannerWin = 0;

		this._loadingFlag = null;
		this._onresize = null;

		/**
		 * Jigsaw layout member variables
		 * @namespace
		 * @private
		 */
		this._jigsaw = {
			clipPath: null,
			count: 0
		};

		/**
		 * Waterfall layout member variables
		 * @namespace
		 * @private
		 */
		this._waterfall = {
			minWidth:     0,
			maxWidth:     0,
			colCount:     0,
			cols:         null
		}

		/**
		 * Brick layout member variables
		 * @namespace
		 * @private
		 */
		this._brick = {
			minHeight:   0,
			maxHeight:   0,
			/**
			 * @type {BrickRow[]}
			 */
			rows:        null,
			renderCache: null
		}

		this._renderModal();
		this._renderLoading();

		Util.addHandler(this._g, 'click', 
			Util.eventHandlerWrapper(this._show, this, false));
	}
///////////////////////

	/******* The following are private methods for common use *******/
	
	ZGallery.prototype._renderModal = function(){
		var modal = document.createElement('div');
		modal.classList.add(ClassName.MODAL);
		modal.classList.add(ClassName.MODAL_HIDE);
		
		var prev = document.createElement('div');
		var next = document.createElement('div');
		var banner = document.createElement('div');

		prev.classList.add(ClassName.ARROW);
		next.classList.add(ClassName.ARROW);
		prev.classList.add(ClassName.ARROW_PREV);
		next.classList.add(ClassName.ARROW_NEXT);
		banner.classList.add(ClassName.MODAL_BANNER);

		modal.appendChild(banner);
		modal.appendChild(prev);
		modal.appendChild(next);
		document.body.appendChild(modal);

		Util.addHandler(banner, 'click', 
			Util.eventHandlerWrapper(this._hide, this, false));
		Util.addHandler(prev, 'click', 
			Util.eventHandlerWrapper(this._prev, this, false));
		Util.addHandler(next, 'click', 
			Util.eventHandlerWrapper(this._next, this, false));

		this._modal = modal;
		this._banner = banner;
	};

	ZGallery.prototype._renderLoading = function(){
		var loadingFlag = document.createElement('div');
		loadingFlag.classList.add(ClassName.LOADING);
		loadingFlag.innerHTML = 'LOADING......';
		document.body.appendChild(loadingFlag);
		this._loadingFlag = loadingFlag;
	};

	ZGallery.prototype._showLoading = function(){
		this._loadingFlag.classList.add(ClassName.LOADING_SHOW);
	};

	ZGallery.prototype._hideLoading = function(){
		this._loadingFlag.classList.remove(ClassName.LOADING_SHOW);
	};

	/**
	 * Fetch the image size.
	 */
	
	ZGallery.prototype._fetchImage = function(){
		/**
		 * @type {MonitorItem[]}
		 */
		var monitor = [];
		var timer = -1;
		var timerInterval = 40;

		this._showLoading();
		
		while(this._urlIndex < this._urls.length){

			var img = new Image();
			try{
				img.src = this._urls[this._urlIndex];
			}catch(e){
				console.log(e);
				continue;
			}
			//!!!
			img.style.visibility = 'hidden';

			monitor.push({
				img: img,
				width: img.width,
				height: img.height,
				index: this._urlIndex
			});

			if(img.complete){
				//!!!
				img.style.visibility = 'visible';
				this._loadCache[this._urlIndex] = {img: img, commit: true};
				this._commitImage();
			}else{
				this._loadCache[this._urlIndex] = {img: img, commit: false};

				img.onload = (function(i, that){

					return function(e){
						e.target.onload = null;
						//!!!
						e.target.style.visibility = 'visible';
						//!!!!
						that._loadCache[i] = {img: e.target, commit: true};
						that._commitImage();
					};

				})(this._urlIndex, this);

				img.onerror = (function(i, that){

					return function(e){
						e.target.onerror = null;
						that._loadCache[i] = {img: null, commit: true};
						that._commitImage();
						monitor[i] = null;
					};

				})(this._urlIndex, this);
			}

			this._urlIndex++;
		}
		
		var check = (function(that){
			var timeOutCnt = 0;
			return function(){
				timeOutCnt++;
				var timeOut = timeOutCnt * timerInterval;
				for(var i = 0; i < monitor.length; i++){
					var item = monitor[i];
					if(!item){
						//onerror already happened
						monitor.splice(i, 1);
					}
					if(item.img.width != 0
						&& item.img.height != 0){
						//size fetched
						monitor.splice(i, 1);
						that._loadCache[item.index].commit = true;
						that._commitImage();
					}else if(timeOut > that._timeout){
						console.log('timeout');
						//timeout happens
						monitor.splice(i, 1);
						that._loadCache[item.index].commit = true;
						that._loadCache[item.index].img = null;
						that._commitImage();
					}
				}
				if(monitor.length == 0){
					console.log('timer cleared');
					clearInterval(timer);
				}
			};
		})(this);
		
		timer = setInterval(check, timerInterval);
	};

	ZGallery.prototype._commitImage = function(){
		var cursor = this._commitCursor;
		while(cursor < this._loadCache.length && this._loadCache[cursor].commit){
			if(!this._loadCache[cursor].img){
				//!!!
				cursor++;
				continue;
			}

			var img = this._loadCache[cursor].img;
			img.setAttribute('z-g-index', this._cache.length);
			
			var wrapper = document.createElement('div');
			wrapper.classList.add(ClassName.WRAPPER);

			var title = this._title[cursor] ? this._title[cursor] : '';
			this._cache.push({
				wrapper: wrapper,
				img: img,
				urlIndex: cursor,
				title: title
			});
			cursor++;

			this._assembleImage(this._cache.length - 1);
		}
		this._commitCursor = cursor;
		if(this._commitCursor == this._loadCache.length){

			this._hideLoading();
		}
		this._placeImage();
	};

	ZGallery.prototype._assembleImage = function(cacheIndex, leanRight){
		var info = document.createElement('div');
		var del = document.createElement('a');
		del.classList.add(ClassName.DEL);
		info.classList.add(ClassName.INFO);

		if(leanRight){
			del.style.left = 'auto';
			info.style.left = 'auto';
			del.style.right = (100 / 3) + '%';
			info.style.right = (100 / 3) + '%';
		}

		var cache = this._cache[cacheIndex];
		var title = cache.title;
		var img = cache.img;
		var wrapper = cache.wrapper;

		info.innerHTML = '<p>' + (title ? title : '') + '</p><p>' + img.width + 'px ' + img.height + 'px</p>';
		wrapper.appendChild(img);
		wrapper.appendChild(info);
		wrapper.appendChild(del);
	};
	
	ZGallery.prototype._removeImageData = function(index){
		//cache array
		var cache = this._cache[index];
		if(index < this._cacheCursor){
			this._cacheCursor--;
		}
		this._cache.splice(index, 1);
		for(var j = index; j < this._cache.length; j++){
			this._cache[j].img.setAttribute('z-g-index', j);
		}

		//load cache array and url array
		index = cache.urlIndex;
		if(index < this._urlIndex){
			this._urlIndex--;
		}
		if(index < this._commitCursor){
			this._commitCursor--;
		}
		this._loadCache.splice(index, 1);
		this._urls.splice(index, 1);
	};

	ZGallery.prototype._methodBind = function(opt){
		switch(this._layout){
			case this.LAYOUT.JIGSAW:
				this._initJigsaw(opt);
				this._placeImage = this._placeImageJigsaw;
				this._removeImage = this._removeImageJigsaw;
				this._resetLayout = this._resetLayoutJigsaw;
				this._delete = this._deleteJigsaw;
				break;
			case this.LAYOUT.WATERFALL:
				this._initWaterfall(opt);
				this._placeImage = this._placeImageWaterfall;
				this._removeImage = this._removeImageWaterfall;
				this._resetLayout = this._resetLayoutWaterfall;
				this._delete = this._deleteWaterfall;
				break; 
			case this.LAYOUT.BRICK:
				this._initBrick(opt);
				this._placeImage = this._placeImageBrick;
				this._removeImage = this._removeImageBrick;
				this._resetLayout = this._resetLayoutBrick;
				this._delete = this._deleteBrick;
				break;
			default:
				break;
		};
		this._isBinded = true;
	};

	ZGallery.prototype._placeImage = null;

	ZGallery.prototype._removeImage = null;

	ZGallery.prototype._resetLayout = null;

	/******* The above are private methods for common use *******/

	/******* The following are event handlers *******/

	/**
	 * @callback
	 */
	ZGallery.prototype._show = function(e){
		if(e.target.nodeName !== 'IMG' || !this._enableFullScreen){
			return;
		}
		var bannerWin = this._layout == this.LAYOUT.JIGSAW ? this._jigsaw.count : this._cache.length;
		this._bannerWin = bannerWin;

		var img = e.target.cloneNode(e);
		var index = parseInt(img.getAttribute('z-g-index'));

		var prevIndex = (index - 1 + bannerWin) % bannerWin;
		var nextIndex = (index + 1) % bannerWin;

		var end = (nextIndex + 1) % bannerWin;

		for(var i = -1; i < 2; i++){
			var id = (i < 0 ? (index + i + bannerWin) : index + i) % bannerWin;
			var t = this._cache[id].img.cloneNode(true);
			t.classList.add(t.width > t.height 
				? ClassName.WIDTH_FIRST : ClassName.HEIGHT_FIRST);
			this._banner.appendChild(t);
		}

		this._banner.children[0].classList.add(ClassName.MODAL_BANNER_PREV);
		this._banner.children[1].classList.add(ClassName.MODAL_BANNER_MID);
		this._banner.children[2].classList.add(ClassName.MODAL_BANNER_NEXT);
		
		this._modal.classList.remove(ClassName.MODAL_HIDE);
		this._modal.classList.add(ClassName.MODAL_SHOW);
	};

	/**
	 * @callback
	 */
	ZGallery.prototype._hide = function(e){
		if(
			e.target == this._banner){
			this._banner.innerHTML = '';
			this._modal.classList.remove(ClassName.MODAL_SHOW);
			this._modal.classList.add(ClassName.MODAL_HIDE);
		}
	};

	/**
	 * @callback
	 */
	ZGallery.prototype._prev = function(e){
		//var bannerWin = this._layout == this.LAYOUT.JIGSAW ? this._jigsaw.count : this._cache.length;
		var bannerWin = this._bannerWin;
		var newMidIndex = parseInt(this._banner.children[0].getAttribute('z-g-index'));
		var newPrevIndex = (newMidIndex - 1 + bannerWin) % bannerWin;

		this._banner.children[0].classList.remove(ClassName.MODAL_BANNER_PREV);
		this._banner.children[1].classList.remove(ClassName.MODAL_BANNER_MID);
		this._banner.children[1].classList.add(ClassName.MODAL_BANNER_NEXT);
		this._banner.children[0].classList.add(ClassName.MODAL_BANNER_MID);

		this._banner.removeChild(this._banner.children[2]);

		var newImage = this._cache[newPrevIndex].img.cloneNode(true);
		newImage.classList.add(newImage.width > newImage.height 
			? ClassName.WIDTH_FIRST : ClassName.HEIGHT_FIRST);
		newImage.classList.add(ClassName.MODAL_BANNER_PREV);
		this._banner.insertBefore(newImage, this._banner.children[0]);
	};

	/**
	 * @callback
	 */
	ZGallery.prototype._next = function(e){
		//var bannerWin = this._layout == this.LAYOUT.JIGSAW ? this._jigsaw.count : this._cache.length;
		var bannerWin = this._bannerWin;
		var newMidIndex = parseInt(this._banner.children[2].getAttribute('z-g-index'));
		var newNextIndex = (newMidIndex + 1) % bannerWin;

		this._banner.children[2].classList.remove(ClassName.MODAL_BANNER_NEXT);
		this._banner.children[1].classList.remove(ClassName.MODAL_BANNER_MID);
		this._banner.children[1].classList.add(ClassName.MODAL_BANNER_PREV);
		this._banner.children[2].classList.add(ClassName.MODAL_BANNER_MID);

		this._banner.removeChild(this._banner.children[0]);
		var newImage = this._cache[newNextIndex].img.cloneNode(true);
		newImage.classList.add(newImage.width > newImage.height 
			? ClassName.WIDTH_FIRST : ClassName.HEIGHT_FIRST);
		newImage.classList.add(ClassName.MODAL_BANNER_NEXT);
		this._banner.appendChild(newImage);
	};

	/******* The above are event handlers *******/

	/******* The following are private methods for jigsaw layout *******/

	ZGallery.prototype._initJigsaw = function(){
		this._g.classList.add(ClassName.JIGSAW_G);
		this._jigsaw.clipPath = [];
		this._jigsaw.count = 0;
		//Fix the height
		this._g.style.height = this._g.clientWidth * GlobalConst.jigsaw.ratio + 'px';

		function jigsawOnresize(e){
			this._g.style.height = this._g.clientWidth * GlobalConst.jigsaw.ratio + 'px';
		}

		Util.addHandler(window, 'resize', 
			this._onresize = Util.eventHandlerWrapper(jigsawOnresize, this, false));

	};

	ZGallery.prototype._resetLayoutJigsaw = function(){
		for(var i = 0; i < this._cache.length; i++){
			var img = this._cache[i].img;
			var wrapper = this._cache[i].wrapper;
			img.classList.remove(ClassName.H_CLIP);
			img.classList.remove(ClassName.V_CLIP);
		}
		this._g.innerHTML = '';
		this._g.classList.remove(ClassName.JIGSAW_X + this._jigsaw.count);
		this._clearClipPath();
	};

	ZGallery.prototype._clearClipPath = function(){
		for(var i = 0; i < this._jigsaw.clipPath.length; i++){
			var clipPath = this._jigsaw.clipPath[i];
			document.head.removeChild(clipPath.style);
			document.body.removeChild(clipPath.svg);
			clipPath.style = clipPath.svg = null;
		}
		Util.arrayClear(this._jigsaw.clipPath);
	};

	ZGallery.prototype._placeImageJigsaw = function(){
		var currCacheLen = this._cache.length;
		if(this._commitCursor == this._loadCache.length     //all images are committed
			|| currCacheLen >= GlobalConst.jigsaw.max){     //jigsawMax has reached
			
			this._resetLayoutJigsaw();
			
			//Only first n ( 1<= n <=6 ) images are displayed.
			var count = GlobalConst.jigsaw.max < currCacheLen
				? GlobalConst.jigsaw.max : currCacheLen;

			this._jigsaw.count = count;

			this._g.classList.add(ClassName.JIGSAW_X + count);

			for(var i = 0; i < count; i++){
				var img = this._cache[i].img;
				var wrapper = this._cache[i].wrapper;
				var iw = img.width;
				var ih = img.height;

				//reassemble, cuz delete button may lay on the right
				wrapper.innerHTML = '';
				this._assembleImage(i, 
					this._layout == this.LAYOUT.JIGSAW && i == 1 && count == 2);

				var r = GlobalConst.jigsaw.ratios[String(count)][i];

				var clipResult = Util.imageClip(wrapper, img, r, 
					!(count == 2 && i == 1), i, count);
				if(clipResult){
					this._jigsaw.clipPath.push(clipResult);
				}

				this._g.appendChild(wrapper);
			}
		}
	};

	ZGallery.prototype._removeImageJigsaw = function(image){
		var flag = true;
		for(var i = 0; i < image.length; i++){
			var wrapper = image[i];
			var img = wrapper.firstChild;
			var index = parseInt(img.getAttribute('z-g-index'));
			var cur = img.nextSibling;

			if(index >= 0){
				this._removeImageData(index);
			}else{
				flag = false;
			}
		}
		this._resetLayoutJigsaw();
		this._placeImageJigsaw();
		return flag;
	};

	/**
	 * @callback
	 */
	ZGallery.prototype._deleteJigsaw = function(e){
		if(e.target.nodeName !== 'A' || !e.target.parentNode){
			return;
		}
		var wrapper = e.target.parentNode;
		this._removeImage([wrapper]);
	};

	/******* The above are private methods for jigsaw layout *******/

	/******* The following are private methods for waterfall layout *******/

	
	ZGallery.prototype._initWaterfall = function(opt){
		this._g.classList.add(ClassName.WATERFALL_G);

		this._waterfall.minWidth = opt && opt.minWidth || 250;
		this._waterfall.maxWidth = opt && opt.maxWidth || 350;
		this._cacheCursor = 0;
		this._g.style.minWidth = this._waterfall.minWidth + 'px';
		this._waterfall.cols = null;
		this._initColsWaterfall();
		
		function waterfallOnresize(e){
			var totWidth = this._g.clientWidth;
			var colWidth = totWidth / this._waterfall.colCount;

			if(colWidth > this._waterfall.maxWidth || colWidth < this._waterfall.minWidth){
				//responsive action
				this._resetLayoutWaterfall();
				this._placeImageWaterfall();
			}
		}
		Util.addHandler(window, 'resize', 
			this._onresize = Util.eventHandlerWrapper(waterfallOnresize, this, false));
	};

	
	ZGallery.prototype._initColsWaterfall = function(){
		if(!this._waterfall.cols){
			this._waterfall.colCount = Math.ceil(this._g.clientWidth / this._waterfall.minWidth);
			this._waterfall.cols = [];
			//Column width in percentage relative to container.
			var colWidth = 100 / this._waterfall.colCount;
			//Render the column containers.
			var frag = document.createDocumentFragment();
			for(var i = 0; i < this._waterfall.colCount; i++){
				var col = document.createElement('div');
				col.style.width = colWidth + '%';
				col.classList.add(ClassName.WATERFALL_COL);
				frag.appendChild(col);
				this._waterfall.cols.push({elem: col, height: 0});
				//Set vertical gutter width.
				if(i < this._waterfall.colCount - 1){
					col.style.paddingRight = this._gutterX + 'px';
				}
			}
			this._g.appendChild(frag);
		}
	};
	
	ZGallery.prototype._resetLayoutWaterfall = function(){
		for(var i = 0; i < this._g.children.length; i++){
			//clear columns
			this._g.children[i].innerHTML = '';
		}
		//clear container
		this._g.innerHTML = '';

		Util.arrayClear(this._waterfall.cols);
		this._waterfall.cols = null;
		this._initColsWaterfall();
		this._cacheCursor = 0;
	};

	
	ZGallery.prototype._placeImageWaterfall = function(){
		while(this._cacheCursor < this._cache.length){
			var img = this._cache[this._cacheCursor].img;
			var wrapper = this._cache[this._cacheCursor].wrapper;
			this._cacheCursor++;

			//Set horizontal gutter width.
			wrapper.style.marginBottom = this._gutterY + 'px';
			//Find the shortest column.
			var minIndex = 0;
			var minCol = this._waterfall.cols[minIndex];
			var min = minCol.height;
			for(var i = 0; i < this._waterfall.colCount; i++){
				var h = this._waterfall.cols[i].height;
				if(min > h){
					min = h;
					minIndex = i;
					minCol = this._waterfall.cols[minIndex];
				}
			}
			minCol.height += img.height;
			minCol.elem.appendChild(wrapper);
		}
	};

	
	ZGallery.prototype._removeImageWaterfall = function(image){
		var flag = true;
		for(var i = 0; i < image.length; i++){
			var wrapper = image[i];
			var col = wrapper.parentNode;
			if(!col){
				continue;
			}
			col.removeChild(wrapper);
			var img = wrapper.firstChild;
			var index = parseInt(img.getAttribute('z-g-index'));

			//destroy
			wrapper.innerHTML = '';

			if(index >= 0){
				this._removeImageData(index);
			}else{
				flag = false;
			}
		}
		return flag;
	};

	/**
	 * @callback
	 */
	ZGallery.prototype._deleteWaterfall = function(e){
		if(e.target.nodeName !== 'A'){
			return;
		}
		var wrapper = e.target.parentNode;

		//Image deletion animation.
		wrapper.classList.add(ClassName.WRAPPER_DELETED);
		wrapper.style.margin = 0;

		var _this = this;
		function delwaterfall(){
			_this._removeImage([wrapper]);
			clearTimeout(timer);
		};

		var timer = setTimeout(delwaterfall, 600);
	};

	/******* The above are private methods for waterfall layout *******/

	/******* The following are private methods for brick layout *******/
	
	ZGallery.prototype._initBrick = function(opt){
		this._g.classList.add(ClassName.BRICK_G);
		
		this._brick.minHeight = opt && opt.minHeight || 200;
		this._brick.maxHeight = opt && opt.maxHeight || 250;
		this._cacheCursor = 0;
		this._brick.rows = [];
		
		this._addPlaceholderRow();

		function brickOnresize(e){
			var totWidth = this._g.clientWidth;
			/**
			 * When window is small enough, this._g contains nothing.
			 * When window becomes larger from above condition, placeImageBrick() should be invoked,
			 * so assign true to responsiveFlag.
			 */
			var responsiveFlag = true; 
			for(var i = 0; i < this._g.children.length; i++){
				responsiveFlag = false;
				//Resize every row.
				var row = this._g.children[i];
				var expectHeight = totWidth * (this._brick.rows[i].ratio);
				row.style.height = expectHeight + 'px';

				//need responsive actions
				if(expectHeight < this._brick.minHeight || expectHeight > this._brick.maxHeight){
					responsiveFlag = true;
				}
			}

			if(responsiveFlag){
				this._resetLayoutBrick();
				this._placeImageBrick();
			}
		}
		Util.addHandler(window, 'resize', 
			this._onresize = Util.eventHandlerWrapper(brickOnresize, this, false));
	};

	ZGallery.prototype._addPlaceholderRow = function(){
		var placeholderRow = document.createElement('div');
		this._g.appendChild(placeholderRow);
		this._brick.rows.push({ratio: 0});
	};

	ZGallery.prototype._resetLayoutBrick = function(){
		for(var i = 0; i < this._g.children.length; i++){
			//clear rows
			this._g.children[i].innerHTML = '';
		}
		//clear container
		this._g.innerHTML = '';

		Util.arrayClear(this._brick.rows);
		this._addPlaceholderRow();
		this._cacheCursor = 0;
	};

	ZGallery.prototype._clearLastRow = function(){
		//Clear the last row(a placeholder row or a row needs rebuilding).
		this._g.removeChild(this._g.lastChild);
		this._brick.rows.pop();
	};

	ZGallery.prototype._placeImageBrick = function(){
		var preCursor = -1;
		while(
			preCursor != this._cacheCursor              //Images in the cache are meant to be left for rebuilding the last row in the future. 
			&& this._cacheCursor < this._cache.length   //When there are images left in the cache.
			){

			preCursor = this._cacheCursor;

			var tail = this._cache.length;
			var head = this._cacheCursor;
			var offset = tail - head;

			this._clearLastRow();

			//Get images in the row.
			var normHeight = this._brick.minHeight;
			var totWidth = this._g.clientWidth;
			var normTotWidth = 0;
			var id = head;
			var isFull = false;
			while(id < tail){
				var img = this._cache[id].img;
				var w = normHeight * img.width / img.height;
				if(normTotWidth + w > totWidth){
					isFull = true;
					break;
				}
				id++;
				normTotWidth += w;
			}

			if(isFull && id == head){
				//Can not contain an image.
				//Skip.
				this._cacheCursor++;
				this._addPlaceholderRow();
				return;
			}

			//row container
			var row = document.createElement('div');
			row.classList.add(ClassName.BRICK_ROW);

			//Compute and set row height.
			var rowWidth = isFull ? totWidth : normTotWidth;
			var rowHeight = normHeight * rowWidth / normTotWidth;
			var containerBaseWidth = isFull ? normTotWidth : totWidth;

			this._brick.rows.push({ratio: normHeight / containerBaseWidth});
			row.style.height = rowHeight + 'px';

			//Add images to the row
			for(var i = head; i < id; i++){
				var img = this._cache[i].img;
				var wrapper = this._cache[i].wrapper;
				if(isFull){
					//images in this row may be not enough, can be used next time
					this._cacheCursor++;
				}
				var styleWidth = (normHeight * img.width / img.height / containerBaseWidth);

				
				wrapper.style.width = styleWidth * 100 + '%';

				wrapper.style.paddingBottom = this._gutterY + 'px';
				if(i < id - 1){
					wrapper.style.paddingRight = this._gutterX + 'px';
				}
				row.appendChild(wrapper);
			}
			this._g.appendChild(row);

			if(isFull){
				this._addPlaceholderRow();
			}
		}
	};

	ZGallery.prototype._removeImageBrick = function(image){
		var flag = true;
		for(var i = 0; i < image.length; i++){
			var wrapper = image[i];
			var row = wrapper.parentNode;
			if(!row){
				continue;
			}
			row.removeChild(wrapper);
			var img = wrapper.firstChild;
			var index = parseInt(img.getAttribute('z-g-index'));

			//destroy
			wrapper.innerHTML = '';
			
			if(index >= 0){
				this._removeImageData(index);
			}else{
				flag = false;
			}

			if(row.children.length == 0){
				//When no image in this row, remove it.
				var rowIndex = 0;
				while(rowIndex < this._g.children.length){
					if(this._g.children[rowIndex] === row){
						break;
					}
					rowIndex++;
				}

				if(rowIndex == this._g.children.length - 1){
					this._addPlaceholderRow();
				}
				this._brick.rows.splice(rowIndex, 1);
				this._g.removeChild(row);
			}
		}
		return flag;
	};

	/**
	 * @callback
	 */
	ZGallery.prototype._deleteBrick = function(e){
		if(e.target.nodeName !== 'A' || !e.target.parentNode){
			return;
		}
		var wrapper = e.target.parentNode;

		//Image deletion animation.
		wrapper.classList.add(ClassName.WRAPPER_DELETED);
		wrapper.style.width = 0;
		wrapper.style.paddingRight = 0;
		if(wrapper.parentNode.children.length == 1){
			wrapper.parentNode.style.height = 0;
		}

		var _this = this;
		function delbrick(){
			_this._removeImage([wrapper]);
			clearTimeout(timer);
		};

		var timer = setTimeout(delbrick, 600);
	};

	/******* The above are private methods for brick layout *******/

	/******* The following are public methods and variables provided by zgallery *******/

	/**
	 * Enum for layout values.
	 * @public
	 * @readonly
	 * @enum {number}
	 */
	ZGallery.prototype.LAYOUT = {
		JIGSAW: 0,
		WATERFALL: 1,
		BRICK: 2
	};

	/**
	 * Initialize zgallery.
	 * Old images will be displaced by new images using this method.
	 * @param {(string|string[])} image A single image url or an array of image urls.
	 * @param {Object} opt Configuration options.
	 * @param {(string|string[])} title A single title or an array of titles associated with the images.
	 */
	ZGallery.prototype.setImage = function(image, opt, title){

		if(typeof image === 'string'){
			this.setImage([image], opt, [title]);
			return;
		}

		if(this._initialized){
			//If initialized, clear all.
			Util.removeHandler(window, 'resize', this._onresize);
			this._resetLayout();
			//In case that layout changes.
			this._g.classList.remove(ClassName.WATERFALL_G);
			this._g.classList.remove(ClassName.BRICK_G);
			this._g.classList.remove(ClassName.JIGSAW_G);
			this._g.classList.remove(ClassName.JIGSAW_X + this._jigsaw.count);
			//when reset layout, brick layout will add a placeholder row, should be cleared.
			//when reset layout, waterfall layout will add cols, should be cleared.
			this._g.innerHTML = '';
			this._g.setAttribute('style', '');

			Util.arrayClear(this._title);
			Util.arrayClear(this._urls);
			Util.arrayClear(this._loadCache);
			Util.arrayClear(this._cache);

			this._commitCursor = 0;
			this._cacheCursor = 0;
			this._urlIndex = 0;
		}

		this._methodBind(opt);

		if(!this._initialized){
			Util.addHandler(this._g, 'click', 
				Util.eventHandlerWrapper(this._delete, this, false));
		}
		this._initialized = true;

		this._urls = Util.arrayAppend(this._urls, image);
		if(title && title[0]){
			this._title = Util.arrayAppend(this._title, title);
		}
		this._fetchImage();
	};

	/**
	 * Add images to zgallery.
	 * @param {(string|string[])} image A single image url or an array of image urls.
	 * @param {(string|string[])} title A single title or an array of titles associated with the images.
	 */
	ZGallery.prototype.addImage = function(image, title){
		if(!this._initialized){
			console.warn('ZGallery has not been initialized yet!');
			return;
		}

		if(typeof image === 'string'){
			this.addImage([image], [title]);
			return;
		}

		this._urls = Util.arrayAppend(this._urls, image);
		if(title){
			this._title = Util.arrayAppend(this._title, title);
		}
		this._fetchImage();
	};

	/**
	 * Remove images.
	 * @param  {(HTMLElement|HTMLElement[])} image Images need removing.
	 * @return {boolean} Indicate whether all images are removed successfully.
	 */
	ZGallery.prototype.removeImage = function(image){
		if(!this._initialized){
			console.warn('ZGallery has not been initialized yet!');
			return;
		}
		if(!(image instanceof Array)){
			this.removeImage([image]);
			return;
		}
		this._removeImage(image);
	};

	/**
     * Set the gutter width between images.
     * @param {number}  x  The vertical gutter width between images.
     * @param {number} [y] The horizontal gutter width between images, it equals to x if y is undefined. 
     */
    ZGallery.prototype.setGutter = function (x, y) {
    	this._gutterX = x || 0;
    	this._gutterY = y || this._gutterX;
    };

    /**
     * Enable full screen image checking.
     * @public
     */
    ZGallery.prototype.enableFullScreen = function(){
    	this._enableFullScreen = true;
    };

    /**
     * Disable full screen image checking.
     * @public
     */
    ZGallery.prototype.disableFullScreen = function(){
    	this._enableFullScreen = false;
    };

    /**
     * Query whether full screen image cheching is enabled.
     * @public
     * @return {boolean} Whether full screen image checking is enabled.
     */
    ZGallery.prototype.isFullScreenEnabled = function(){
    	return this._enableFullScreen;
    };

    /**
     * Set the timeout time of loading an image.
     * @public
     * @param {number} timeout Timeout time in millisecond.
     */
    ZGallery.prototype.setTimeout = function(timeout){
    	this._timeout = timeout || 5000;
    };

    /**
     * Get the timeout time of loading an image.
     * @public
     * @return {number} Timeout time of loading an image.
     */
    ZGallery.prototype.getTimeout = function(){
    	return this._timeout;
    };

	/**
	 * Set the layout of zgallery.
	 * @public
	 * @param {number} layout Indicate layout of zgallery.
	 */
	ZGallery.prototype.setLayout = function(layout){
		for(var key in this.LAYOUT){
			if(this.LAYOUT[key] == layout){
				this._layout = layout;
				return;
			}
		}
		this._layout = this.LAYOUT.JIGSAW;
	};

	/**
	 * Get the layout of zgallery.
	 * @public
	 * @return {number} The layout of zgallery.
	 */
	ZGallery.prototype.getLayout = function(){
		return this._layout;
	};

	/**
	 * Get dom elements attached to images width index.
	 * @return {HTMLElement[]}
	 */
	ZGallery.prototype.getImageElements = function(){
		if(!this._initialized){
			console.warn('ZGallery has not been initialized yet!');
			return;
		}

		var elems = [];
		for(var i = 0; i < this._cache.length; i++){
			elems.push(this._cache[i].wrapper);
		}
		return elems;
	};


	if(typeof window.zGallery === 'undefined'){
		window.zGallery = function(container){
			if(container){
				var g = document.createElement('div');
				g.classList.add('z-gallery');
				container.appendChild(g);
			}
			return new ZGallery(g);
		};
		window.zGallery.LAYOUT = ZGallery.prototype.LAYOUT;
	}

})(window, document);