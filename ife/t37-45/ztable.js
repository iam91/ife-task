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

	/**
	 * function for remove event handler
	 */
	function removeHandler(element, type, handler){
		if(element.removeEventListener){
			element.removeEventListener(type, handler, false);
		} 
		else if(element.detachEvent){
			element.detachEvent('on' + type, handler);
		} 
		else{
			element['on' + type] = null;
		}
	}

	function $$(elem){
		return document.createElement(elem);
	}

	function sort(a, b){
		return b - a;
	}

	function ZTable(base, param){
		this._base = base;
		this._cols = param.cols;
		this._data = param.data;

		this._sortFn = {};

		this._thead = $$('thead');
		this._tbody = $$('tbody');

		this._init();
	}

	ZTable.prototype._init = function(){
		this._base.appendChild(this._thead);
		this._base.appendChild(this._tbody);

		this._loadTitle();
		this._loadData();
	};

	/**
	 * @param {string} col - property name of that column in a data object
	 */
	ZTable.prototype._sortWrapper = function(sort, col, asc){
		return function(a, b){
			var s = sort(a[col], b[col]);
			return asc ? s : -s;
		};
	};

	ZTable.prototype._sortArrow = 
		'<span class="sort"><div class="arrow-u"></div><div class="arrow-d"></div></span>';

	ZTable.prototype._loadTitle = function(){

		var frag = document.createDocumentFragment();

		for(var i = 0; i < this._cols.length; i++){
			var col = this._cols[i];

			var title = $$('td');

			title.innerHTML = '<span>' + col.title + '</span>' 
				+ (col.sortable !== undefined ? this._sortArrow : '');

			var asc = title.querySelector('.arrow-u');
			var des = title.querySelector('.arrow-d');

			this._cols[i].sortable = col.sortable || sort, col.index;
			this._sortFn[col.index] = {};
			this._sortFn[col.index]['asc'] = this._sortWrapper(this._cols[i].sortable, col.index, true);
			this._sortFn[col.index]['des'] = this._sortWrapper(this._cols[i].sortable, col.index, false);

			if(asc){
				addHandler(asc, 'click', this._getSortHandler(col.index, true));
			}
			if(des){
				addHandler(des, 'click', this._getSortHandler(col.index, false));
			}

			frag.appendChild(title);
		}
		this._thead.appendChild(frag);
	};

	ZTable.prototype._getSortHandler = function(col, asc){
		var _this = this;
		return function(e){
			return _this.sortCol(col, asc);
		};
	};

	ZTable.prototype._loadData = function(){
		this._tbody.innerHTML = '';
		var frag = document.createDocumentFragment();
		for(var i = 0; i < this._data.length; i++){
			var row = $$('tr');
			row.innerHTML = '';
			for(var j = 0; j < this._cols.length; j++){
				var col = this._cols[j].index;
				row.innerHTML += '<td>' + this._data[i][col] + '</td>';
			}
			frag.appendChild(row);
		}
		this._tbody.appendChild(frag);
	};

	/**
	 * @param {string} col - property name of that column in a data object
	 */
	ZTable.prototype.sortCol = function(col, asc){
		var order = asc ? 'asc' : 'des';
		var sortFn = this._sortFn[col][order];
		this._data.sort(sortFn);
		this._loadData();
	}

	function zt(q, param){
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
		return m ? new ZTable(m, param) : null;
	}

	window.zt = zt;
})(window, document);