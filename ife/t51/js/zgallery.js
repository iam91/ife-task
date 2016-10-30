/**
 * @todo jigsaw add image
 */
;(function(window, document){

	'use strict';

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
		 */
		imageClip: function(img, r, isRect, index, count){
			var w = img.width;
			var h = img.height;

			var svgHead = '<svg width="0" height="0"><defs><clipPath id="clip-shape-' 
				+ index + '" clipPathUnits="objectBoundingBox">';
			var svgTail = '</clipPath></defs></svg>';

			if(h / w > r){
				//too much height
				var ww = w;
				var hh = ww * r;
				if(isRect){
					var x = 0;
				}
				else{
					var x = 0.5;
				}
				var y = hh / h;
				img.classList.add(ClassName.V_CLIP);
				var polygon = '<polygon points="' + x + ' 0, 1 0, 1 ' + y + ', 0 ' + y + '"/>';
			}
			else{
				//too much width
				var hh = h;
				var ww = hh / r;
				if(isRect){
					var x1 = 0;
				}
				else{
					var x1 = ww * 0.5 / w;
				}
				var x2 = ww / w;
				img.classList.add(ClassName.H_CLIP);
				var polygon = '<polygon points="' + x1 + ' 0, ' + x2 + ' 0, ' + x2 + ' 1, 0 1"/>';
			}
			var styleInner = '.' + ClassName.JIGSAW_X + count + " div:nth-child(" + (index + 1) 
				+ ") img{-webkit-clip-path: url('#clip-shape-" + index 
				+ "');clip-path: url('#clip-shape-" + index + "');}";

			//make clip-path usable in firefox
			var t = document.createElement('div');
			var s = document.createElement('style');
			t.innerHTML = svgHead + polygon + svgTail;
			s.innerHTML = styleInner;
			s.type = "text/css";
			document.body.appendChild(t);
			document.head.appendChild(s);
		}
	};

	/**
	 * @private
	 */
	var ClassName = {
		JIGSAW_G: 'z-g-jigsaw',
		JIGSAW_X: 'z-g-jigsaw-',
		WATERFALL_G: 'z-g-waterfall',
		WATERFALL_COL: 'z-g-waterfall-col',
		WATERFALL_PIC: 'z-g-waterfall-pic',
		BRICK_G: 'z-g-brick',
		BRICK_ROW: 'z-g-brick-row',
		V_CLIP: 'v-clip',
		H_CLIP: 'h-clip',
	};

	/**
	 * @private
	 */
	var GlobalConst = {
		jigsaw: {
			max: 6,
			ratio: 9 / 15,
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
	 * ZGallery
	 * @public
	 * @constructor
	 */
	function ZGallery(g){

		/**
		 * Common member variables
		 * @private
		 */
		this._g = g;
		this._layout = this.LAYOUT.JIGSAW;
		this._urls = [];
		this._urlIndex = 0;
		this._imageElements = [];
		this._cache = [];

		this._initialized = false;

		this._gutterX = 0;
		this._gutterY = 0;

		/**
		 * Waterfall layout member variables
		 * @namespace
		 * @private
		 */
		this._waterfall = {
			colCount: 0,
			cols: null
		}

		/**
		 * Brick layout member variables
		 * @namespace
		 * @private
		 */
		this._brick = {
			minHeight: 0,
			maxHeight: 0,
			cacheHead: 0,
			cacheTail: 0,
			rows: null,
			renderCache: null
		}

		//for test
		this.temp = null;
	}

	/******* The following are event handlers *******/

	/**
	 * @callback
	 */
	ZGallery.prototype._onImageLoaded = function(e){

		this._fetchImage();
		var img = e.target;
		this._cache.push(img);
		this._brick.cacheTail++;
		this._placeImage();
	};

	/**
	 * @callback
	 */
	ZGallery.prototype._onImageFailed = function(e){

		this._fetchImage();
		var img = e.target;
		this._cache.push(img);
		this._brick.cacheTail++;
		this._placeImage();
	};

	/******* The following are private methods for common use *******/

	
	
	ZGallery.prototype._fetchImage = function(){
		if(this._urlIndex < this._urls.length){
			var url = this._urls[this._urlIndex++];
			var img = document.createElement('img');
			img.src = url;
			Util.addHandler(img, 'load', 
				Util.eventHandlerWrapper(this._onImageLoaded, this, true, 'load'));
			Util.addHandler(img, 'error', 
				Util.eventHandlerWrapper(this._onImageFailed, this, true, 'error'));
		}
	};

	ZGallery.prototype._placeImage = null;

	ZGallery.prototype._removeImage = null;

	/******* The following are private methods for a speicific layout *******/

	ZGallery.prototype._initJigsaw = function(){
		this._g.classList.add(ClassName.JIGSAW_G);
		//fixed the height
		this._g.style.height = this._g.clientWidth * GlobalConst.jigsaw.ratio + 'px';

		function jigsawOnresize(e){
			this._g.style.height = this._g.clientWidth * GlobalConst.jigsaw.ratio + 'px';
		}

		Util.addHandler(window, 'resize', Util.eventHandlerWrapper(jigsawOnresize, this, false));
	};

	ZGallery.prototype._placeImageJigsaw = function(){

		if(this._cache.length == this._urls.length                //images are all loaded 
			|| this._cache.length >= GlobalConst.jigsaw.max){     //jigsawMax has reached
			if(this._g.innerHTML){
				//layout should be reset
				this._g.innerHTML = '';
			}
			
			var count = GlobalConst.jigsaw.max < this._cache.length ? GlobalConst.jigsaw.max : this._cache.length;
			this._g.classList.add(ClassName.JIGSAW_X + count);

			for(var i = 0; i < count; i++){
				var img = this._cache[i];
				var iw = img.width;
				var ih = img.height;

				var r = GlobalConst.jigsaw.ratios[String(count)][i];

				if(count == 2 && i == 1){
					Util.imageClip(img, r, false, i, count);
				}
				else{
					Util.imageClip(img, r, true, i, count);
				}

				var div = document.createElement('div');
				div.appendChild(img);
				this._g.appendChild(div);
			}
		}
	};

	ZGallery.prototype._initWaterfall = function(opt){
		this._g.classList.add(ClassName.WATERFALL_G);
		this._waterfall.colCount = opt && opt.colCount || 4;
		if(!this._waterfall.cols){
			this._makeColsWaterfall();
		}
	};

	ZGallery.prototype._makeColsWaterfall = function(){
		this._waterfall.cols = new Array(this._colCount);
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
	};

	ZGallery.prototype._placeImageWaterfall = function(){
		var img = this._cache[this._cache.length - 1];
		var div = document.createElement('div');
		div.appendChild(img);
		div.classList.add(ClassName.WATERFALL_PIC);

		//Set horizontal gutter width.
		div.style.marginBottom = this._gutterY + 'px';

		//Find the shortest column.
		var minIndex = 0;
		var minReferer = this._waterfall.cols[minIndex];
		var min = minReferer.clientHeight;
		for(var i = 0; i < this._waterfall.colCount; i++){
			var h = this._waterfall.cols[i].clientHeight;
			if(min > h){
				min = h;
				minIndex = i;
				minReferer = this._waterfall.cols[minIndex];
			}
		}
		minReferer.appendChild(div);
	};

	ZGallery.prototype._initBrick = function(opt){
		this._g.classList.add(ClassName.BRICK_G);

		this._brick.minHeight = opt && opt.minHeight || 150;
		this._brick.maxHeight = opt && opt.maxHeight || 200;
		this._brick.cacheHead = 0;
		this._brick.cacheTail = 0;
		this._brick.rows = [];

		this._addPlaceholderRow();

		function brickOnresize(e){
			var totWidth = this._g.clientWidth;
			var responsiveFlag = false;
			for(var i = 0; i < this._g.children.length; i++){
				//Resize every row.
				var row = this._g.children[i];
				var expectHeight = totWidth * (this._brick.minHeight / this._brick.rows[i].minTotalWidth);
				row.style.height = expectHeight + 'px';

				//responsive actions
				if(expectHeight < this._brick.minHeight || expectHeight > this._brick.maxHeight){
					responsiveFlag = true;
				}
			}
			if(responsiveFlag){
				//clear 
				this._clearLayoutBrick();
				//reset the layout
				this._brick.cacheHead = 0;
				while(this._brick.cacheHead < this._brick.cacheTail){
					var t = this._brick.cacheHead;
					this._placeImageBrick();
					if(t == this._brick.cacheHead){
						//The last row reached.
						break;
					}
				}
			}
		}
		Util.addHandler(window, 'resize', Util.eventHandlerWrapper(brickOnresize, this, false));
	};

	ZGallery.prototype._addPlaceholderRow = function(){
		var placeholderRow = document.createElement('div');
		this._g.appendChild(placeholderRow);
		this._brick.rows.push({minTotalWidth: 0});
	};

	ZGallery.prototype._clearLayoutBrick = function(){
		this._g.innerHTML = '';
		this._addPlaceholderRow();
	};

	ZGallery.prototype._placeImageBrick = function(){

		var tail = this._brick.cacheTail;
		var head = this._brick.cacheHead;
		var offset = tail - head;

		//clear remains
		this._g.removeChild(this._g.lastChild);
		this._brick.rows.pop();

		var totWidth = this._g.clientWidth;
		var totImageWidth = 0;

		//get images in the row
		var id = head;
		var isFull = false;
		while(id < tail){
			var img = this._cache[id];
			var w = this._brick.minHeight * img.width / img.height;
			if(totImageWidth + w > totWidth){
				isFull = true;
				break;
			}
			id++;
			totImageWidth += w;
		}
		//console.log(head + ',' + id + ',' + tail)

		//row container
		var row = document.createElement('div');
		row.classList.add(ClassName.BRICK_ROW);

		if(isFull){
			var rowHeight = totWidth * (this._brick.minHeight / totImageWidth);
			var minTotalWidth = totImageWidth;
		}
		else{
			var rowHeight = this._brick.minHeight;
			var minTotalWidth = totWidth;
		}

		this._brick.rows.push({minTotalWidth: minTotalWidth});
		row.style.height = rowHeight + 'px';

		//add to the row
		for(var i = head; i < id; i++){
			var img = this._cache[i];
			if(isFull){
				//images in this row may be not enough, can be used next time
				this._brick.cacheHead++;
			}
			var styleWidth = (this._brick.minHeight * img.width / img.height / minTotalWidth);

			var imgWrapper = document.createElement('div');
			imgWrapper.style.width = styleWidth * 100 + '%';

			imgWrapper.style.paddingBottom = this._gutterY + 'px';
			if(i < id - 1){
				imgWrapper.style.paddingRight = this._gutterX + 'px';
			}
			imgWrapper.appendChild(img);
			row.appendChild(imgWrapper);
		}
		this._g.appendChild(row);
		if(isFull){
			this._addPlaceholderRow();
		}

		if(this._cache.length == this._urls.length && isFull){
			//Manually add remaining images since onload event will no longer triggered
			this._placeImageBrick();
		}
	};

	ZGallery.prototype._removeImageBrick = function(image){
		/***
		for(var i = 0; i < image.length; i++){
			var imgWrapper = image[i].elem;             
			var id = image[i].id;
			//Find the first image in the same row
			var cursor = imgWrapper;
			var rowHeadId = id;
			while(cursor.previousSibling){
				cursor = cursor.previousSibling;
				rowHeadId--;
			}

			//Clear following rows.
			var curr = imgWrapper.parentNode;
			while(curr){
				var next = curr.nextSibling;
				this._g.removeChild(curr);
				curr = next;
			}
			this._addPlaceholderRow();

			this._cache.splice(id, 1);
			this._urls.splice(id, 1);
			this._imageElements.splice(id, this._imageElements.length - id);

			this._brick.cacheHead = rowHeadId;
			this._brick.cacheTail--;
			while(this._brick.cacheHead < this._brick.cacheTail){
				var t = this._brick.cacheHead;
				this._placeImageBrick();
				if(t == this._brick.cacheHead){
					//If the last row reached.
					break;
				}
			}
		}
		***/
	};

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
		Util.arrayClear(this._imageElements);
		/**
		 * @todo clear zgallery
		 */
		this._urls = Util.arrayAppend(this._urls, image);
		this._fetchImage();
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
	 * Set the layout of zgallery.
	 * @public
	 * @param {number} layout Indicate layout of zgallery.
	 */
	ZGallery.prototype.setLayout = function(layout){
		/**
		 * @todo check layout value
		 */
		this._layout = layout;
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

		switch(this._layout){
			case this.LAYOUT.JIGSAW:
				this._initJigsaw(opt);
				this._placeImage = this._placeImageJigsaw;
				this._removeImage = this._removeImageJigsaw;
				break;
			case this.LAYOUT.WATERFALL:
				this._initWaterfall(opt);
				this._placeImage = this._placeImageWaterfall;
				this._removeImage = this._removeImageWaterfall;
				break; 
			case this.LAYOUT.BRICK:
				this._initBrick(opt);
				this._placeImage = this._placeImageBrick;
				this._removeImage = this._removeImageBrick;
				break;
			default:
				break;
		};

		this._initialized = true;
	};

	window.g = ZGallery;

})(window, document);