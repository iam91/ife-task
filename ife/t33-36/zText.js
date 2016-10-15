;(function(window, document){

	var $ = function(root, query){
		return root.querySelector(query);
	};
	
	/**
	 * Create DOM element
	 */
	var $e = function(elem){
		return document.createElement(elem);
	};

	/**
	 * Create textNode
	 */
	var $t = function(data){
		return document.createTextNode(data);
	};

	/**
	 * Reset cursor according to index of an anchor
	 */
	var _ = function(sel, anchor, index){
		var r = document.createRange();
		r.setStart(anchor, index);
		sel.removeAllRanges();
		sel.addRange(r);/*
		console.log(r);
		console.log('-----');
		console.log(sel);*/
	};

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

	function ZText(base){
		this._base = base;
		this._serial = null;
		this._win = null;

		this._num = 0;
		this._pre = '';
	};

	ZText.prototype._initSerial = function(){};

	ZText.prototype.init = function(){
		this._base.innerHTML = "<div class='ztext-serial'></div>" 
			+ "<div class='ztext-win' contenteditable='true'></div>";

		this._serial = $(this._base, '.ztext-serial');
		this._win = $(this._base, '.ztext-win');

		this._addLine();

		addHandler(this._base, 'keydown', this._handlerWrapper(this._backspaceHandler));
		addHandler(this._base, 'keydown', this._handlerWrapper(this._newLineHandler));
		addHandler(this._base, 'keydown', this._handlerWrapper(this._normalKeyHandler));
		addHandler(this._win, 'scroll', this._handlerWrapper(this._scrollHandler));
		addHandler(this._win, 'paste', this._handlerWrapper(this._pasteHandler));
	};

	ZText.prototype._handlerWrapper = function(handler){
		var _this = this;
		return function(e){
			handler.call(_this, e);
		};
	};

	ZText.prototype._countLines = function(str){
		return str.split('\n').length - 1;
	};

	ZText.prototype._pasteHandler = function(e){
		e.preventDefault();
		var data = e.clipboardData.getData('text/plain');
		var lineCnt = this._countLines(data);
		while(lineCnt-- > 0){
			this._addLine();
		}
	};

	ZText.prototype._scrollHandler = function(e){
		this._serial.scrollTop = this._win.scrollTop;
	};

	ZText.prototype._normalKeyHandler = function(e){
		var target = e.target;
		var code = e.keyCode;
		var key = e.key;

		if(code == 9
			|| (code >= 45 && code <= 46)
			|| (code >= 65 && code <= 90)
			|| (code >= 48 && code <= 57)
			|| (code >= 186 && code <= 187)
			|| (code >= 189 && code <= 192)
			|| (code >= 219 && code <= 221)){
			e.preventDefault();
			var sel = getSelection();
			var anchor = sel.anchorNode;
			if(anchor === this._win){
				this._win.innerHTML = '<div>' + key + '</div>';
				_(sel, this._win.firstChild.firstChild, 1);
			}
			else{
				if(anchor.nodeName === 'DIV'){
					var anc = anchor;
					var preInner = anc.innerHTML;
					preInner = preInner.substring(preInner.indexOf('<br>') + 4);
				}
				else{
					var anc = anchor.parentNode;
					var preInner = anc.innerHTML;
				}
				preInner += key;
				var index = preInner.length;
				anc.innerHTML = preInner;
				_(sel, anc.firstChild, index);
			}
		}
	};

	ZText.prototype._newLineHandler = function(e){
		var target = e.target;
		var code = e.keyCode;
		if(code === 13){
			//when enter pressed, different browsers execute differently.
			e.preventDefault();
			var sel = getSelection();
			var anchor = sel.anchorNode;
			if(anchor === this._win){
				this._win.innerHTML = '<div><br></div><div><br></div>';
				_(sel, this._win.lastChild.lastChild);
			}
			else{
				if(anchor.nodeName === 'DIV'){
					var newLine = $e('div');
					newLine.innerHTML = '<br>';
					this._win.insertBefore(newLine, anchor);
					_(sel, this._win.lastChild.lastChild);
				}
				else if(anchor.nodeName === '#text'){
					var parAnchor = anchor.parentNode;
					var offset = sel.anchorOffset;
					var oldText = parAnchor.innerHTML;

					if(oldText.length == offset){
						var newLine = $e('div');
						newLine.innerHTML = '<br>';
						this._win.appendChild(newLine);
						_(sel, this._win.lastChild.lastChild);
					}
					else{
						var lNode = $e('div');
						var rNode = $e('div');
						lNode.innerHTML = oldText.substring(0, offset);
						rNode.innerHTML = oldText.substring(offset);
						this._win.insertBefore(lNode, parAnchor);
						this._win.insertBefore(rNode, parAnchor);

						_(sel, rNode.firstChild, 0);

						this._win.removeChild(parAnchor);
					}
				}
			}
			
			this._addLine();
		}
	};

	ZText.prototype._backspaceHandler = function(e){
		var target = e.target;
		var code = e.keyCode;

		if(code === 8){
			e.preventDefault();
			var sel = window.getSelection();

			var anchor = sel.anchorNode;
			var focus = sel.focusNode;

			var anc = anchor.nodeName === 'DIV'?anchor:anchor.parentNode;
			var foc = focus.nodeName === 'DIV'?focus:focus.parentNode;

			var curr = anc.nextSibling;
			while(curr && curr != foc){
				var next = curr.nextSibling;
				this._win.removeChild(curr);
				this._removeLine();
				curr = next;
			}

			anc.innerHTML = anc.innerHTML.substring(0, sel.anchorOffset)
				+ (focus.nodeName === 'DIV' ?'':foc.innerHTML.substring(sel.focusOffset));
			this._win.removeChild(foc);
			sel.removeAllRanges();
		}
	};

	ZText.prototype._addLine = function(){
		var t = $e('div');
		t.innerHTML = (this._num++) + '.';
		this._serial.appendChild(t);
	};

	ZText.prototype._removeLine = function(){
		this._serial.removeChild(this._serial.lastChild);
		this._num--;
	};

	window.ZText = ZText;
})(window, document);


window.onload = function(e){

	var $ = function(query){
		return document.querySelectorAll(query);
	};
	
	var $$ = function(elem){
		return document.createElement(elem);
	};

	var t = $('.ztext');
	var zt = new ZText(t[0]);
	zt.init();
};