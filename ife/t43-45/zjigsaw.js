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

	var ratio = 9 / 16;

	var clipPathInline = '<svg width="0" height="0"><defs><clipPath id="clip-shape" clipPathUnits="objectBoundingBox"><polygon points="0.666 0, 1 0, 1 1, 0.333 1" /></clipPath></defs></svg>'
	var clipPathStyleInline = ".z-jigsaw-2 img:last-child{-webkit-clip-path: url('#clip-shape');clip-path: url('#clip-shape');}";

	function ZJigsaw(base, params){
		this._base = base;

		this._urls = params && params.urls || [];
		this._count = this._urls.length;

		this._init();
	}

	ZJigsaw.prototype._init = function(){
		//fix height
		var width = this._base.clientWidth;
		this._base.style.height = width * ratio + 'px';
		
		this._base.classList.add('z-jigsaw-' + this._count);

		//render pictures
		var inner = '';
		for(var i = 0; i < this._count; i++){
			inner += '<img src="' + this._urls[i] + '" alt="">';
		}
		this._base.innerHTML = inner;

		/*--------------------------------------------*/
		//make clip-path usable for ff
		var t = document.createElement('div');
		var s = document.createElement('style');
		t.innerHTML = clipPathInline;
		s.innerHTML = clipPathStyleInline;
		s.type = "text/css";
		document.body.appendChild(t);
		document.head.appendChild(s);
		/*--------------------------------------------*/

		//listen to resize event
		function resizeHandlerGetter(context){
			var _this = context;
			return function(e){
				var width = _this._base.clientWidth;
				_this._base.style.height = width * ratio + 'px';
			}
		}

		addHandler(window, 'resize', resizeHandlerGetter(this));
	};

	function zj(q, params){
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
		return m ? new ZJigsaw(m, params) : null;
	}

	window.zj = zj;
})(window, document);