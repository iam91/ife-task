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
	 * Connect
	 */
	var connect = function(a, b){

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

	ZText.prototype._isEmptyLine = function(line){
		return line.indexOf('\b') == 0;
	};

	ZText.prototype._getLineNode = function(node){
		return this._isEmptyLine(node) ? node: node.parentNode;
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
		var offset = sel.anchorOffset;
		sel.deleteFromDocument();

		var r = document.createRange();
		r.setStart(anchor, offset);
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

		var sel = getSelection();
		sel = this._multiLineCollapse(sel);

		var newLines = [];
		for(var i = 0; i < lineCnt; i++){
			var ne = $e('div');
			ne.innerHTML = lines[i] === ''?'<br>':lines[i];
			newLines.push(ne);
		}

		var anchor = sel.anchorNode;
		var parAnchor = anchor.nodeName === 'DIV'?anchor:anchor.parentNode;
		if(anchor.nodeName === '#text'){
			var oldText = parAnchor.innerHTML;
			var lNode = $e('div');
			var rNode = $e('div');
			lNode.innerHTML = oldText.substring(0, offset);
			rNode.innerHTML = oldText.substring(offset);
			this._win.insertBefore(lNode, parAnchor);
			this._win.insertBefore(rNode, parAnchor);

			sel = _(sel, rNode.firstChild);

			this._win.removeChild(parAnchor);
		}
		/*
		var anchor = sel.anchorNode;
		var focus = sel.focusNode;
		var parAnchor = anchor.nodeName === 'DIV'?anchor:anchor.parentNode;
		var parFocus = focus.nodeName === 'DIV'?focus:focus.parentNode;
		parFocus = parFocus === this._win?null:parFocus;


		for(var i = newLines.length - 1, curr = parFocus; i >= 0; i--){
			this._win.insertBefore(newLines[i], curr);
			curr = newLines[i];
		}

		

		while(lineCnt-- > 0){
			this._addLine();
		}*/
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
			//this._collapse();
			var sel = getSelection();
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
			//_.collapse();
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
		}
	};

	ZText.prototype._backspaceHandler = function(e){
		var target = e.target;
		var code = e.keyCode;

		if(code === 8){
			e.preventDefault();
			//this._collapse();
			var sel = getSelection();
			if(sel.isCollapsed){
				var anchor = sel.anchorNode;
				var offset = sel.anchorOffset;
				console.log(offset);
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