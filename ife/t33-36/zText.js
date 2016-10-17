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
		this._pre = '';
	};

	ZText.prototype._setCaret = function(anchor, index){
		var r = document.createRange();
		r.setStart(anchor, index);
		r.collapse(true);
		var sel = getSelection();
		sel.removeAllRanges();
		sel.addRange(r);
		r.detach();
		r = null;
		sel = null;
	};

	ZText.prototype._collapse = function(){
		var sel = getSelection();
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
			+ "<div class='ztext-win' contenteditable='true'><div><br></div></div>";

		this._serial = $(this._base, '.ztext-serial');
		this._win = $(this._base, '.ztext-win');

		this._addLine();
		//initialize editable area with an empty line
		var initLine = $(this._win, 'div');
		//little trick: add a text node before <br>
		initLine.insertBefore($t('\b'), initLine.firstChild);
		this._setCaret(initLine.firstChild, 1);

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
		e.preventDefault();
		var data = e.clipboardData.getData('text/plain');
		
		var lines = data.split('\n');//todo: add newline for different system
		var lineCnt = lines.length;

		this._collapse();
		this._splitLine();

		var sel = getSelection();

		var newLines = [];
		for(var i = 0; i < lineCnt; i++){
			var ne = $e('div');
			var br = $e('br');
			var t = $t('\b' + lines[i]);
			ne.appendChild(t);
			ne.appendChild(br);
			newLines.push(ne);
		}

		var rText = sel.anchor;
		var lText = sel.anchor.parentNode.previousSibling;
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
			this._collapse();
			var sel = getSelection();
			var anchor = sel.anchorNode;
			var offset = sel.anchorOffset;
			anchor.insertData(offset, key)
			this._setCaret(anchor, offset + key.length);
		}
	};

	ZText.prototype._splitLine = function(){
		var sel = getSelection();
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
	};

	ZText.prototype._newLineHandler = function(e){
		var target = e.target;
		var code = e.keyCode;
		if(code === 13){
			//when enter pressed, different browsers execute differently.
			e.preventDefault();
			this._collapse();
			this._splitLine();
		}
	};

	ZText.prototype._backspaceHandler = function(e){
		var target = e.target;
		var code = e.keyCode;

		if(code === 8){
			e.preventDefault();
			var sel = getSelection();
			if(sel.isCollapsed){
				var anchor = sel.anchorNode;
				var offset = sel.anchorOffset;
				if(offset == 1){
					if(anchor.parentNode.previousSibling)
					var preText = anchor.parentNode.previousSibling.firstChild;
					var preOff = preText.data.length;
					preText.insertData(preOff, anchor.data.substring(1));
					this._win.removeChild(anchor.parentNode);
					this._removeLine();
					this._setCaret(preText, preOff);
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