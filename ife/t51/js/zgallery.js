;(function(window, document){

	'use strict';

	/** 
	 * @typedef CacheItem
	 * @type {object} 
	 * @property {HTMLImageElement} img - Store the element.
	 * @property {boolean} commit - Indicate whether the image can be committed.
	 */

	/**
	 * @typedef MonitorItem
	 * @type {object}
	 * @property {HTMLImageElement} img - Store the element.
	 * @property {CacheItem} cache - Point to its position in cache.
	 * @property {number} width - Width before checking.
	 * @property {number} height - Height bofore checking.
	 */

	/**
	 * @typedef ClipCompatible
	 * @type {object}
	 * @property {HTMLElement} svg
	 * @property {HTMLElement} style
	 */

	/**
	 * @typedef BrickRow
	 * @type {object}
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
		 * @param {object} context Execution context of the event handler.
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
		 * @param {Image} img Image needs clipping.
		 * @param {number} r Height to width ratio.
		 * @param {number} index Index of the image, used to add to clip-path ids to distinguish clip-paths.
		 * @param {number} count Number of images to be showed.
		 * @return {ClipCompatible} HTML elements used to make clip-path compatible.
		 */
		imageClip: function(img, r, isRect, index, count){
			var w = img.width;
			var h = img.height;

			var svgHead = '<svg width="0" height="0"><defs><clipPath id="clip-shape-' 
				+ index + '" clipPathUnits="objectBoundingBox">';
			var svgTail = '</clipPath></defs></svg>';

			if(h / w > r){
				//too large height
				var ww = w;
				var hh = ww * r;
				if(isRect){
					var x = 0;
				}
				else{
					var x = 1 / 3;
				}
				var y = hh / h + 0.01;
				img.classList.add(ClassName.V_CLIP);
				var polygon = '<polygon points="' + x + ' 0, 1 0, 1 ' + y + ', 0 ' + y + '"/>';
			}
			else{
				//too large width
				var hh = h;
				var ww = hh / r;
				if(isRect){
					var x1 = 0;
				}
				else{
					var x1 = ww * 0.5 / w;
				}
				var x2 = ww / w + 0.01;
				img.classList.add(ClassName.H_CLIP);
				var polygon = '<polygon points="' + x1 + ' 0, ' + x2 + ' 0, ' + x2 + ' 1, 0 1"/>';
			}
			var styleInner = '.' + ClassName.JIGSAW_X + count + " div:nth-child(" + (index + 1) 
				+ ") img{-webkit-clip-path: url('#clip-shape-" + index 
				+ "');clip-path: url('#clip-shape-" + index + "');}";

			//make clip-path usable in firefox
			//add clip-paths
			var t = document.createElement('div');
			var s = document.createElement('style');
			t.innerHTML = svgHead + polygon + svgTail;
			s.innerHTML = styleInner;
			s.type = "text/css";
			document.body.appendChild(t);
			document.head.appendChild(s);
			return {svg: t, style: s};
		}
	};

	/**
	 * @private
	 * @readonly
	 * @enum {number}
	 */
	var ClassName = {
		MODAL:         'z-g-modal',
		MODAL_HIDE:    'z-g-modal-hide',
		MODAL_SHOW:    'z-g-modal-show',
		JIGSAW_G:      'z-g-jigsaw',
		JIGSAW_X:      'z-g-jigsaw-',
		WATERFALL_G:   'z-g-waterfall',
		WATERFALL_COL: 'z-g-waterfall-col',
		WATERFALL_PIC: 'z-g-waterfall-pic',
		BRICK_G:       'z-g-brick',
		BRICK_ROW:     'z-g-brick-row',
		V_CLIP:        'v-clip',
		H_CLIP:        'h-clip',
		WIDTH_FIRST:   'w-first',
		HEIGHT_FIRST:  'h-first'
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
		/**
		 * @type {CacheItem[]}
		 */
		this._cache = [];
		this._cacheCursor = 0;
		this._commitCursor = 0;
		this._urlIndex = 0;


		this._g = g;
		this._imageElements = [];
		this._layout = this.LAYOUT.JIGSAW;
		this._initialized = false;
		this._gutterX = 0;
		this._gutterY = 0;
		this._enableFullScreen = true;
		this._modal = null;

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
	}

	/******* The following are private methods for common use *******/
	
	ZGallery.prototype._renderModal = function(){
		var modal = document.createElement('div');
		modal.classList.add(ClassName.MODAL);
		modal.classList.add(ClassName.MODAL_HIDE);
		document.body.appendChild(modal);
		Util.addHandler(modal, 'click', 
			Util.eventHandlerWrapper(this._hide, this, false));

		this._modal = modal;
	};

	ZGallery.prototype._fetchImage = function(){
		/**
		 * @type {MonitorItem[]}
		 */
		var monitor = [];
		var timer = -1;
		var timerInterval = 40;
		
		while(this._urlIndex < this._urls.length){
			var img = new Image();
			img.src = this._urls[this._urlIndex++];

			this._cache.push({
				img: img, 
				commit: false
			});

			var cache = this._cache[this._cache.length - 1];
			
			monitor.push({
				img: img, 
				cache: cache,
				width: img.width,
				height: img.height
			});	

			img.onload = (function(){
				var _cache = cache;
				return function(e){
					e.target.onload = null;
					_cache.commit = true;
				};
			})();

			img.onerror = (function(){
				var _cache = cache;
				return function(e){
					e.target.onerror = null;
					_cache.commit = true;
					/**
					 * @todo when failed to load the image.
					 */
				};
			})();

			if(this._enableFullScreen){
				Util.addHandler(img, 'click', 
					Util.eventHandlerWrapper(this._show, this, false));
			}
		}
		
		function check(){
			for(var i = 0; i < monitor.length; i++){
				var item = monitor[i];
				if(item.img.width != item.width 
					&& item.img.height != item.height){
					//Size fetched, commit the image.
					monitor.splice(i, 1);
					item.cache.commit = true;
					item.cache = null;
					item = null;
				}
			}
			if(monitor.length == 0){
				clearInterval(timer);
			}
		};
		
		timer = setInterval(check, timerInterval);
	};

	ZGallery.prototype._checkCacheCommit = function(){
		var timer = -1;
		var timerInterval = 40;
		
		var _this = this;
		function check(){
			var cursor = _this._commitCursor;
			while(cursor < _this._cache.length && _this._cache[cursor].commit){
				cursor++;
			}
			_this._commitCursor = cursor;
			_this._placeImage();
			
			if(_this._commitCursor == _this._cache.length){
				//All images are committed.
				timer = clearInterval(timer);
			}
		};

		timer = setInterval(check, timerInterval);
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
		var t = e.target.cloneNode(e);
		this._modal.appendChild(t);

		var w = t.width;
		var h = t.width;
		if(w > h){
			t.classList.add(ClassName.WIDTH_FIRST);
		}else{
			t.classList.add(ClassName.HEIGHT_FIRST);
		}

		/**
		 * @todo Refine centralization.
		 */
		var w = t.clientWidth;
		var h = t.clientHeight;
		t.style.marginLeft = '-' + w/2 + 'px';
		t.style.marginTop = '-' + h/2 + 'px';
		
		this._modal.classList.remove(ClassName.MODAL_HIDE);
		this._modal.classList.add(ClassName.MODAL_SHOW);
	};

	/**
	 * @callback
	 */
	ZGallery.prototype._hide = function(e){
		if(e.target == this._modal){
			this._modal.innerHTML = '';
			this._modal.classList.remove(ClassName.MODAL_SHOW);
			this._modal.classList.add(ClassName.MODAL_HIDE);
		}
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
			Util.eventHandlerWrapper(jigsawOnresize, this, false));
	};

	ZGallery.prototype._resetLayoutJigsaw = function(){
		for(var i = 0; i < this._imageElements.length; i++){
			var img = this._imageElements[i].firstChild;
			img.classList.remove(ClassName.H_CLIP);
			img.classList.remove(ClassName.V_CLIP);
		}
		this._g.innerHTML = '';
		this._g.classList.remove(ClassName.JIGSAW_X + this._jigsaw.count);
		Util.arrayClear(this._imageElements);
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
		if(this._commitCursor == this._cache.length               //all images are committed
			|| this._commitCursor >= GlobalConst.jigsaw.max){     //jigsawMax has reached
			
			this._resetLayoutJigsaw();
			
			//Only first n ( 1<= n <=6 ) images are displayed.
			var count = GlobalConst.jigsaw.max < this._commitCursor
				? GlobalConst.jigsaw.max : this._commitCursor;

			this._jigsaw.count = count;

			this._g.classList.add(ClassName.JIGSAW_X + count);

			for(var i = 0; i < count; i++){
				var img = this._cache[i].img;
				var iw = img.width;
				var ih = img.height;

				var r = GlobalConst.jigsaw.ratios[String(count)][i];

				if(count == 2 && i == 1){
					this._jigsaw.clipPath.push(Util.imageClip(img, r, false, i, count));
				}
				else{
					this._jigsaw.clipPath.push(Util.imageClip(img, r, true, i, count));
				}

				var wrapper = document.createElement('div');
				wrapper.appendChild(img);
				this._g.appendChild(wrapper);

				this._imageElements.push(wrapper);
			}
		}
	};

	ZGallery.prototype._removeImageJigsaw = function(image){
		var ret = true;
		for(var i = 0; i < image.length; i++){
			var img = image[i];
			img.parentNode.removeChild(img);
			var index = this._imageElements.indexOf(img);
			if(index < 0){
				ret = false;
			}
			if(index < this._cacheCursor){
				this._cacheCursor--;
			}
			if(index < this._commitCursor){
				this._commitCursor--;
			}
			this._imageElements.splice(index, 1);
			this._cache.splice(index, 1);
			this._urls.splice(index, 1);
		}
		this._resetLayoutJigsaw();
		this._placeImageJigsaw();
		return ret;
	};

	/******* The above are private methods for jigsaw layout *******/

	/******* The following are private methods for waterfall layout *******/

	ZGallery.prototype._initWaterfall = function(opt){
		this._g.classList.add(ClassName.WATERFALL_G);

		this._waterfall.minWidth = opt && opt.minWidth || 250;
		this._waterfall.maxWidth = opt && opt.maxWidth || 350;
		this._cacheCursor = 0;
		this._g.style.minWidth = this._waterfall.minWidth + 'px';
		
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
		Util.addHandler(window, 'resize', Util.eventHandlerWrapper(waterfallOnresize, this, false));
	};

	ZGallery.prototype._initColsWaterfall = function(){
		if(!this._waterfall.cols){
			this._waterfall.colCount = Math.ceil(this._g.clientWidth / this._waterfall.minWidth);
			this._waterfall.cols = new Array(this._waterfall.colCount);
			//Column width in percentage relative to container.
			var colWidth = 100 / this._waterfall.colCount;
			//Render the column containers.
			var frag = document.createDocumentFragment();
			for(var i = 0; i < this._waterfall.colCount; i++){
				var col = document.createElement('div');
				col.style.width = colWidth + '%';
				col.classList.add(ClassName.WATERFALL_COL);
				frag.appendChild(col);
				this._waterfall.cols[i] = col;
				//Set vertical gutter width.
				if(i < this._waterfall.colCount - 1){
					col.style.paddingRight = this._gutterX + 'px';
				}
			}
			this._g.appendChild(frag);
		}
	};

	ZGallery.prototype._resetLayoutWaterfall = function(){
		this._g.innerHTML = '';
		Util.arrayClear(this._waterfall.cols);
		Util.arrayClear(this._imageElements);
		this._waterfall.cols = null;
		this._initColsWaterfall();
		this._cacheCursor = 0;
	};

	ZGallery.prototype._placeImageWaterfall = function(){
		while(this._cacheCursor < this._commitCursor){
			var img = this._cache[this._cacheCursor++].img;
			var wrapper = document.createElement('div');
			wrapper.appendChild(img);
			wrapper.classList.add(ClassName.WATERFALL_PIC);
			
			//Add to image elements.
			this._imageElements.push(wrapper);

			//Set horizontal gutter width.
			wrapper.style.marginBottom = this._gutterY + 'px';

			//Find the shortest column.
			var minIndex = 0;
			var minCol = this._waterfall.cols[minIndex];
			var min = minCol.clientHeight;
			for(var i = 0; i < this._waterfall.colCount; i++){
				var h = this._waterfall.cols[i].clientHeight;
				if(min > h){
					min = h;
					minIndex = i;
					minCol = this._waterfall.cols[minIndex];
				}
			}
			minCol.appendChild(wrapper);
		}
	};

	ZGallery.prototype._removeImageWaterfall = function(image){
		for(var i = 0; i < image.length; i++){
			var img = image[i];
			img.parentNode.removeChild(img);
			var index = this._imageElements.indexOf(img);
			if(index < 0){
				return false;
			}
			if(index < this._cacheCursor){
				this._cacheCursor--;
			}
			if(index < this._commitCursor){
				this._commitCursor--;
			}
			this._imageElements.splice(index, 1);
			this._cache.splice(index, 1);
			this._urls.splice(index, 1);
		}
		return true;
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
			var responsiveFlag = false;
			for(var i = 0; i < this._g.children.length; i++){
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
		Util.addHandler(window, 'resize', Util.eventHandlerWrapper(brickOnresize, this, false));
	};

	ZGallery.prototype._addPlaceholderRow = function(){
		var placeholderRow = document.createElement('div');
		this._g.appendChild(placeholderRow);
		this._brick.rows.push({minTotalWidth: 0});
	};

	ZGallery.prototype._resetLayoutBrick = function(){
		this._g.innerHTML = '';
		Util.arrayClear(this._imageElements);
		Util.arrayClear(this._brick.rows);
		this._addPlaceholderRow();
		this._cacheCursor = 0;
	};

	ZGallery.prototype._clearLastRow = function(){
		//Clear the last row(a placeholder row or a row needs rebuilding).
		var lastRow= this._g.lastChild;
		var lastRowCount = lastRow.children.length;
		while(lastRowCount > 0){
			this._imageElements.pop();
			lastRowCount--;
		} 
		this._g.removeChild(this._g.lastChild);
		this._brick.rows.pop();
	};

	ZGallery.prototype._placeImageBrick = function(){
		var preCursor = -1;
		while(
			preCursor != this._cacheCursor              //Images in the cache are meant to be left for rebuilding the last row in the future. 
			&& this._cacheCursor < this._commitCursor   //When there are images left in the cache.
			){

			preCursor = this._cacheCursor;

			var tail = this._commitCursor;
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
			var normRowWidth = isFull ? normTotWidth : totWidth;

			this._brick.rows.push({ratio: normHeight / normRowWidth});
			row.style.height = rowHeight + 'px';

			//Add images to the row
			for(var i = head; i < id; i++){
				var img = this._cache[i].img;
				if(isFull){
					//images in this row may be not enough, can be used next time
					this._cacheCursor++;
				}
				var styleWidth = (normHeight * img.width / img.height / normRowWidth);

				var wrapper = document.createElement('div');
				wrapper.style.width = styleWidth * 100 + '%';

				wrapper.style.paddingBottom = this._gutterY + 'px';
				if(i < id - 1){
					wrapper.style.paddingRight = this._gutterX + 'px';
				}
				wrapper.appendChild(img);
				row.appendChild(wrapper);

				//Add to image elements.
				this._imageElements.push(wrapper);
			}
			this._g.appendChild(row);

			if(isFull){
				this._addPlaceholderRow();
			}
		}
	};

	ZGallery.prototype._removeImageBrick = function(image){
		for(var i = 0; i < image.length; i++){
			var img = image[i];
			img.parentNode.removeChild(img);
			var index = this._imageElements.indexOf(img);
			if(index < 0){
				return false;
			}
			if(index < this._cacheCursor){
				this._cacheCursor--;
			}
			if(index < this._commitCursor){
				this._commitCursor--;
			}
			this._imageElements.splice(index, 1);
			this._cache.splice(index, 1);
			this._urls.splice(index, 1);
		}
		return true;
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
	 */
	ZGallery.prototype.setImage = function(image){
		if(!this._initialized){
			console.warn('ZGallery has not been initialized yet!');
			return;
		}

		if(typeof image === 'string'){
			this.setImage([image]);
			return;
		}

		Util.arrayClear(this._urls);
		this._resetLayout();

		this._urls = Util.arrayAppend(this._urls, image);
		this._fetchImage();
		this._checkCacheCommit();
	};

	/**
	 * Add images to zgallery.
	 * @param {(string|string[])} image A single image url or an array of image urls.
	 */
	ZGallery.prototype.addImage = function(image){
		if(!this._initialized){
			console.warn('ZGallery has not been initialized yet!');
			return;
		}

		if(typeof image === 'string'){
			this.addImage([image]);
			return;
		}

		this._urls = Util.arrayAppend(this._urls, image);
		this._fetchImage();
		this._checkCacheCommit();
	};

	/**
	 * Remove images.
	 * @param  {(object|object[])} image Images need removing.
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
	 * @return {object[]}
	 */
	ZGallery.prototype.getImageElements = function(){
		if(!this._initialized){
			console.warn('ZGallery has not been initialized yet!');
			return;
		}
		return Util.arrayAppend([], this._imageElements);
	};

	/**
	 * Initialize zgallery based on specified layout.
	 * @public
	 * @param {object} opt Configuration options for zgallery.
	 */
	ZGallery.prototype.init = function(opt){
		if(this._initialized){
			return;
		}

		this._renderModal();

		switch(this._layout){
			case this.LAYOUT.JIGSAW:
				this._initJigsaw(opt);
				this._placeImage = this._placeImageJigsaw;
				this._removeImage = this._removeImageJigsaw;
				this._resetLayout = this._resetLayoutJigsaw;
				break;
			case this.LAYOUT.WATERFALL:
				this._initWaterfall(opt);
				this._placeImage = this._placeImageWaterfall;
				this._removeImage = this._removeImageWaterfall;
				this._resetLayout = this._resetLayoutWaterfall;
				break; 
			case this.LAYOUT.BRICK:
				this._initBrick(opt);
				this._placeImage = this._placeImageBrick;
				this._removeImage = this._removeImageBrick;
				this._resetLayout = this._resetLayoutBrick;
				break;
			default:
				break;
		};

		this._initialized = true;
	};

	window.g = ZGallery;

})(window, document);