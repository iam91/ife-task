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

		arrayClone: function(head, tail){
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

		imageClip: function(img, r, isRect, index, count){
			var w = img.width;
			var h = img.height;

			var svgHead = '<svg width="0" height="0"><defs><clipPath id="clip-shape-' + index + '" clipPathUnits="objectBoundingBox">';
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
				/*
				img.setAttribute('style', 
					'-webkit-clip-path: polygon(' + x + ' 0, 100% 0, 100%' + y + '%, 0 ' + y + '%);');*/
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
				/*
				img.setAttribute('style', 
					'-webkit-clip-path: polygon(' + 100*x1 + '% 0, ' + 100*x2 + '% 0, ' + 100*x2 + '% 100%, 0 100%);');*/
			}
			var styleInner = '.' + ClassName.JIGSAW_X + count + " div:nth-child(" + (index + 1) + ") img{-webkit-clip-path: url('#clip-shape-" + index + "');clip-path: url('#clip-shape-" + index + "');}";

			//make clip-path usable in firefox
			var t = document.createElement('div');
			var s = document.createElement('style');
			t.innerHTML = svgHead + polygon + svgTail;
			console.log(polygon);
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
		WATERFALL_G: 'z-g-waterfall',
		BRICK_G: 'z-g-brick',
		JIGSAW_X: 'z-g-jigsaw-',
		V_CLIP: 'v-clip',
		H_CLIP: 'h-clip'
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
		 * @private
		 */
		this._g = g;

		this._gutterY = 0;
		this._gutterX = 0;
		this._layout = this.LAYOUT.JIGSAW;
		this._urls = [];
		this._urlIndex = 0;
		this._imageElements = [];

		this._cache = [];
	}

	/******* The following are event handlers *******/

	/**
	 * @callback
	 */
	ZGallery.prototype._onImageLoaded = function(e){

		this._fetchImage();
		var img = e.target;
		this._cache.push(img);//console.log(this._cache)

		switch(this._layout){
			case this.LAYOUT.JIGSAW:
				this._placeImageJigsaw();
				break;
			case this.LAYOUT.WATERFALL:
				break; 
			case this.LAYOUT.BRICK:
				break;
			default:
				break;
		};
	};

	/**
	 * @callback
	 */
	ZGallery.prototype._onImageFailed = function(e){

		this._fetchImage();
		var img = e.target;
		this._cache.push(img);

		switch(this._layout){
			case this.LAYOUT.JIGSAW:
				break;
			case this.LAYOUT.WATERFALL:
				break; 
			case this.LAYOUT.BRICK:
				break;
			default:
				break;
		};
	};

	/******* The following are private methods *******/
	
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

	ZGallery.prototype._placeImageJigsaw = function(){
		this._g.classList.add(ClassName.JIGSAW_G);

		if(this._cache.length == this._urls.length   //images are all loaded 
			|| this._cache.length >= GlobalConst.jigsaw.max){     //jigsawMax has reached
			if(this._g.innerHTML){
				//layout should be reset
				this._g.innerHTML = '';
			}

			//fixed the height
			this._g.style.height = this._g.clientWidth * GlobalConst.jigsaw.ratio + 'px';
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

			/**
			 * @todo add resize handler
			 */
		}
	};

	ZGallery.prototype._placeImageWaterfall = function(){};

	ZGallery.prototype._placeImageBrick = function(){};

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
		if(typeof image === 'string'){
			this.setImage([image]);
			return;
		}

		Util.arrayClear(this._urls);
		Util.arrayClear(this._imageElements);
		/**
		 * @todo clear zgallery
		 */
		this._urls = Util.arrayClone(this._urls, image);
		this._fetchImage();
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

	window.g = ZGallery;

})(window, document);