//处理多行被选中
//paste事件
//setStart当#text长度为0的问题
//Range #text和其他的区别
//Selection中返回的Node的类型

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
		r.collapse(true);
		sel.removeAllRanges();
		sel.addRange(r);
		return sel;
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

	ZText.prototype._pasteHandler = function(e){
		console.log('oops');
		e.preventDefault();
		var data = e.clipboardData.getData('text/plain');
		
		var lines = data.split('\n');//todo: add newline for different system
		var lineCnt = lines.length;

		var sel = getSelection();
		sel = this._multiLineCollapse(sel);

		var newLines = [];
		for(var i = 0; i < lineCnt; i++){
			var ne = $e('div');
			ne.innerHTML = lines[i] === ''?'<br>':lines[i];
			newLines.push(ne);
		}

		var anchor = sel.anchorNode;
		if(anchor === this._win){
			
		}
		else if(anchor.nodeName === 'DIV'){
			
		}

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

		if(e.ctrlKey && code == 86){
			//ctrl+v shortcut
			return;
		}

		if(code == 9
			|| (code >= 45 && code <= 46)
			|| (code >= 65 && code <= 90)
			|| (code >= 48 && code <= 57)
			|| (code >= 186 && code <= 187)
			|| (code >= 189 && code <= 192)
			|| (code >= 219 && code <= 221)){
			e.preventDefault();
			var sel = getSelection();

			sel = this._multiLineCollapse(sel);

			var anchor = sel.anchorNode;
			if(anchor === this._win){
				this._win.innerHTML = '<div>' + key + '</div>';
				sel = _(sel, this._win.firstChild.firstChild, 1);
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
				sel = _(sel, anc.firstChild, index);
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

			sel = this._multiLineCollapse(sel);

			var anchor = sel.anchorNode;
			if(anchor === this._win){
				this._win.innerHTML = '<div><br></div><div><br></div>';
				sel = _(sel, this._win.lastChild.lastChild);
			}
			else{
				if(anchor.nodeName === 'DIV'){
					var newLine = $e('div');
					newLine.innerHTML = '<br>';
					this._win.insertBefore(newLine, anchor);
					sel = _(sel, this._win.lastChild.lastChild);
				}
				else if(anchor.nodeName === '#text'){
					var parAnchor = anchor.parentNode;
					var offset = sel.anchorOffset;
					var oldText = parAnchor.innerHTML;

					if(oldText.length == offset){
						var newLine = $e('div');
						newLine.innerHTML = '<br>';
						this._win.appendChild(newLine);
						sel = _(sel, this._win.lastChild.lastChild);
					}
					else{
						var lNode = $e('div');
						var rNode = $e('div');
						lNode.innerHTML = oldText.substring(0, offset);
						rNode.innerHTML = oldText.substring(offset);
						this._win.insertBefore(lNode, parAnchor);
						this._win.insertBefore(rNode, parAnchor);

						sel = _(sel, rNode.firstChild, 0);

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
			var sel = getSelection();
			if(!sel.isCollapsed){
				sel = this._multiLineCollapse(sel);
			}
			else{
				var anchor = sel.anchorNode;
				if(anchor.nodeName === 'DIV'){
					if(anchor === this._win || anchor === this._win.firstChild){
						return;
					}
					else{
						if(anchor.nextSibling.nodeName === 'DIV'){
							var next = anchor.nextSibling;
						}
						else if(anchor.nextSibling.nodeName === '#text'){
							var next = anchor.nextSibling.firstChild;
						}
						sel = _(sel, next, 0);
						this._win.removeChild(anchor);
						this._removeLine();
					}
				}
				else if(anchor.nodeName === '#text'){
					var parAnchor = anchor.parentNode;
					var preInner = parAnchor.innerHTML;
					var off = sel.anchorOffset;
					parAnchor.innerHTML = preInner.substring(0, off - 1) + preInner.substring(off);
					parAnchor.innerHTML = parAnchor.innerHTML === ''?'<br>':parAnchor.innerHTML;
					sel = _(sel, anchor, off - 1);
				}
			}
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

	/**
	 * Remove contents of a selection if its not collapsed
	 */
	ZText.prototype._multiLineCollapse = function(sel){
		if(sel.isCollapsed){
			return sel;
		}

		var anchor = sel.anchorNode;
		var focus = sel.focusNode;

		var anc = anchor.nodeName === 'DIV'?anchor:anchor.parentNode;
		var foc = focus.nodeName === 'DIV'?focus:focus.parentNode;

		var preOffset = sel.anchorOffset;

		//remove lines between anchor and focus if anchor !== focus
		if(anc !== foc){
			var curr = anc.nextSibling;
			while(curr && curr !== foc){
				var next = curr.nextSibling;
				this._win.removeChild(curr);
				this._removeLine();
				curr = next;
			}
		}


		//collapse anchor and focus
		anc.innerHTML = anc.innerHTML.substring(0, sel.anchorOffset)
			+ (focus.nodeName === 'DIV' ?'':foc.innerHTML.substring(sel.focusOffset));
		anc.innerHTML = anc.innerHTML === ''?'<br>':anc.innerHTML;
		if(anc !== foc){
			this._win.removeChild(foc);
			this._removeLine();
		}
	
		
		var r = document.createRange();
		r.setStart(anc.firstChild, preOffset);
		r.collapse(true);
		sel.removeAllRanges();
		sel.addRange(r);
		return sel;
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