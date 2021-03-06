//TODO add shortcut handle
;(function(window, document){

	var $ = function(root, query){
		return root.querySelector(query);
	};
	
	/**
	 * Create DOM elementd
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
	};

	ZText.prototype._setCaret = function(anchor, index){
		var r = document.createRange();
		r.setStart(anchor, index);
		r.collapse(true);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(r);
		r.detach();
		r = null;
		sel = null;
	};

	ZText.prototype._collapse = function(){
		var sel = window.getSelection();
		if(sel.isCollapsed){return;}

		var anchor = sel.anchorNode;
		var anchorOffset = sel.anchorOffset;
		var focus = sel.focusNode;
		var focusOffset = sel.focusOffset;

		var curr = anchor.parentNode;
		while(curr != focus.parentNode){
			this._removeLine();
			curr = curr.nextSibling;
		}

		sel.deleteFromDocument();

		if(anchor !== focus){
			anchor.insertData(anchorOffset, focus.data);
			this._win.removeChild(focus.parentNode);
		}
		
		var r = document.createRange();
		r.setStart(anchor, anchorOffset);
		r.collapse(true);
		sel.removeAllRanges();
		sel.addRange(r);
		r.detach();
		r = null;
		sel = null;
	};

	ZText.prototype.init = function(){
		this._base.innerHTML = "<div class='ztext-serial'></div>" 
			+ "<div class='ztext-win' contenteditable='true'></div>";

		this._serial = $(this._base, '.ztext-serial');
		this._win = $(this._base, '.ztext-win');
		this._initLine();

		addHandler(this._base, 'keydown', this._handlerWrapper(this._backspaceHandler));
		addHandler(this._base, 'keydown', this._handlerWrapper(this._newLineHandler));
		addHandler(this._base, 'keydown', this._handlerWrapper(this._normalKeyHandler));
		addHandler(this._win, 'scroll', this._handlerWrapper(this._scrollHandler));
		addHandler(this._win, 'paste', this._handlerWrapper(this._pasteHandler));
	};

	ZText.prototype.clear = function(){
		this._win.innerHTML = '';
		this._serial.innerHTML = '';
		this._num = 0;
		this._initLine();
	};

	ZText.prototype.lineValidate = function(validateFn){
		this._win.contentEditable = 'false';
		var lineCnt = this._win.childNodes.length;
		var flag = true;
		for(var i = 0; i < lineCnt; i++){
			var lineWrapper = this._win.childNodes[i];
			var line = lineWrapper.firstChild;
			if(line.data.length > 1){
				this._serial.childNodes[i].classList.remove('warn');
				if(!validateFn(line.data.substring(1))){
					flag = false;
					this._serial.childNodes[i].classList.add('warn');
				}
			}
		}
		this._win.contentEditable = 'true';
		return flag;
	};

	ZText.prototype.valueInLine = function(){
		this._win.contentEditable = 'false';
		var lineCnt = this._win.childNodes.length;
		var ret = [];
		for(var i = 0; i < lineCnt; i++){
			var lineWrapper = this._win.childNodes[i];
			var line = lineWrapper.firstChild;
			//ignore empty line
			if(line.data.length > 1){
				ret.push(line.data.substring(1));
			}
		}
		this._win.contentEditable = 'true';
		return ret;
	};

	ZText.prototype._initLine = function(){
		this._win.innerHTML = '<div><br></div>';
		//initialize editable area with an empty line
		var initLine = $(this._win, 'div');
		//little trick: add a text node before <br>
		initLine.insertBefore($t('\b'), initLine.firstChild);
		this._setCaret(initLine.firstChild, 1);
		this._addLine();
	};

	ZText.prototype._handlerWrapper = function(handler){
		var _this = this;
		return function(e){
			handler.call(_this, e);
		};
	};

	ZText.prototype._pasteHandler = function(e){
		e.preventDefault();
		var data = e.clipboardData.getData('text/plain');

		if(data === ''){return;}
		
		var lines = data.split('\n');//todo: add newline for different system
		var lineCnt = lines.length;

		var newLines = [];
		for(var i = 0; i < lineCnt; i++){
			var ne = $e('div');
			var br = $e('br');
			var t = $t('\b' + lines[i]);
			ne.appendChild(t);
			ne.appendChild(br);
			newLines.push(ne);
		}

		this._collapse();

		var sel = window.getSelection();
		var anchor = sel.anchorNode;
		var parAnchor = anchor.parentNode;
		var anchorOffset = sel.anchorOffset;

		var firstNew = newLines[0].firstChild;
		var lastNew = newLines[lineCnt - 1].firstChild;

		//concate
		firstNew.insertData(1, anchor.data.substring(1, anchorOffset));
		lastNew.insertData(lastNew.data.length, anchor.data.substring(anchorOffset));

		var frag = document.createDocumentFragment();
		for(var i = 0; i < lineCnt; i++){
			frag.appendChild(newLines[i]);
			this._addLine();
		}
		this._win.insertBefore(frag, parAnchor);
		this._win.removeChild(parAnchor);
		this._removeLine();
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
			//TODO add shortcut handle
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
			this._collapse();
			var sel = window.getSelection();
			var anchor = sel.anchorNode;
			var offset = sel.anchorOffset;
			anchor.insertData(offset, key)
			this._setCaret(anchor, offset + key.length);
		}
	};

	ZText.prototype._newLineHandler = function(e){
		var target = e.target;
		var code = e.keyCode;
		if(code === 13){
			//when enter pressed, different browsers execute differently.
			e.preventDefault();
			this._collapse();

			var sel = window.getSelection();
			var anchor = sel.anchorNode;
			var parAnchor = anchor.parentNode;
			var offset = sel.anchorOffset;

			anchor.splitText(offset);

			var rText =  parAnchor.firstChild.nextSibling;
			rText.insertData(0, '\b');
			parAnchor.removeChild(rText);
			var newline = $e('div');
			var newBr = $e('br');
			newline.appendChild(rText);
			newline.appendChild(newBr);
			this._win.insertBefore(newline, parAnchor.nextSibling);
			this._setCaret(rText, 1);
			
			this._addLine();
		}
	};

	ZText.prototype._backspaceHandler = function(e){
		var target = e.target;
		var code = e.keyCode;

		if(code === 8){
			e.preventDefault();
			var sel = window.getSelection();
			if(sel.isCollapsed){
				var anchor = sel.anchorNode;
				var offset = sel.anchorOffset;
				if(offset == 1){
					if(anchor.parentNode.previousSibling){
						var preText = anchor.parentNode.previousSibling.firstChild;
						var preOff = preText.data.length;
						preText.insertData(preOff, anchor.data.substring(1));
						this._win.removeChild(anchor.parentNode);
						this._removeLine();
						this._setCaret(preText, preOff);
					}
				}
				else{
					anchor.deleteData(offset - 1, 1);
				}
			}
			else{
				this._collapse();
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

	window.ZText = ZText;
})(window, document);