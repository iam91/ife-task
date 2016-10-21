/**
 * Depends on jQuery
 */
;(function($, window, document){

	function $$(elem){
		return document.createElement(elem);
	}

	var ClassName = {

	};

	var Selector = {
		BASE: '.z-modal',
		HEAD: '.z-d-head',
		PREV_ARROW: '.'
		CALENDAR: '.z-d-cal',
		CALENDAR_HEAD: '.z-d-cal-h',
		CALENDAR_BODY: '.z-d-cal-b'
	};

	function ZDate(base){
		//store current year and month showing
		this._currCal = new Date();

		this._selStart = new Date();
		this._selEnd = new Date();
		this._isSingleDay = true;

		this._ele = {
			base: base,
			month: null,
			year: null,
			prev: null,
			next: null,
			calen: null,
			selStart: null,
			selEnd: null
		};

		this._init();
	}

	ZDate.prototype._monthDayCount = {
		'1': 31, '2': 29, '3': 31, '4': 30, '5': 31, '6': 30,
		'7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31
	};

	ZDate.prototype._init = function(){
		$(this._ele.base).html('<div class="z-d-head">'
					+ '<span class="z-d-prev"></span>'
				    + '<input class="z-d-y">'
				    + '<input class="z-d-m">'
					+ '<span class="z-d-next"></span>'
					+ '</div><div class="z-d-cal"></div>');

		var e_month = $('.z-d-m', this._ele.base);
		var e_year = $('.z-d-y', this._ele.base);
		var e_cal = $('.z-d-cal', this._ele.base);
		var e_prev = $('.z-d-prev', this._ele.base);
		var e_next = $('.z-d-next', this._ele.base);

		this._ele.month = e_month;
		this._ele.year = e_year;
		this._ele.calen = e_cal;
		this._ele.prev = e_prev;
		this._ele.next = e_next;

		var month = this._currCal.getMonth();
		var year = this._currCal.getFullYear();

		$(e_month).val(month + 1);
		$(e_year).val(year);

		this._renderCalendar();

		$(e_prev).bind('click', this._handlerWrapper(this.prevMonth));
		$(e_next).bind('click', this._handlerWrapper(this.nextMonth));
		$('.z-d', e_cal).bind('click', this._handlerWrapper(this.setSelStart));
		$('.z-d', e_cal).bind('dblclick', this._handlerWrapper(this.setSingleSel));
	};

	ZDate.prototype._handlerWrapper = function(handler){
		var _this = this;
		return function(e){
			handler.call(_this, e);
		};
	};

	ZDate.prototype._renderCalendar = function(){
		$(this._ele.calen).html('<div><span>1&nbsp;</span><span>2&nbsp;</span><span>3&nbsp;</span><span>4&nbsp;</span><span>5&nbsp;</span><span>6&nbsp;</span><span>7&nbsp;</span></div>');
		
		var cursor = new Date();
		cursor.setFullYear(this._currCal.getFullYear());
		cursor.setMonth(this._currCal.getMonth());
		cursor.setDate(1);

		this._renderFirstLine(cursor);
		this._renderRemainingLines(cursor);
	};

	ZDate.prototype._renderFirstLine = function(cursor){
		if(cursor.getDay() == 0){
			return cursor;
		}
		var inner = '';
		var inverseCursor = new Date();
		inverseCursor.setFullYear(cursor.getFullYear());
		inverseCursor.setMonth(cursor.getMonth());
		inverseCursor.setDate(cursor.getDate() - 1);
		while(inverseCursor.getDay() >= 0){
			inner = '<span class="z-d z-d-notin">' + inverseCursor.getDate() + '&nbsp;</span>' + inner;	
			if(inverseCursor.getDay() == 0){
				break;
			}
			inverseCursor.setDate(inverseCursor.getDate() - 1);
		}
		while(cursor.getDay() <= 6){
			inner += '<span class="z-d">' + cursor.getDate() + '&nbsp;</span>';	
			if(cursor.getDay() == 6){
				cursor.setDate(cursor.getDate() + 1);
				break;
			}
			cursor.setDate(cursor.getDate() + 1);
		}

		var line = $$('div');
		$(line).html(inner).appendTo(this._ele.calen);
		return cursor;
	};

	ZDate.prototype._renderRemainingLines = function(cursor){
		var month = cursor.getMonth();
		var endFlag = true;
		while(endFlag){
			var inner = '';
			while(cursor.getDay() <= 6){
				if(cursor.getMonth() != month){
					var preinner = '<span class="z-d z-d-notin">';
					endFlag = false;
				}
				else{
					var preinner = '<span class="z-d">';
				}
				inner += preinner + cursor.getDate() + '&nbsp;</span>';
				if(cursor.getDay() == 6){
					cursor.setDate(cursor.getDate() + 1);
					break;
				}
				cursor.setDate(cursor.getDate() + 1);
			}
			var line = $$('div');
			$(line).html(inner).appendTo(this._ele.calen);
			if(cursor.getMonth() != month){
				endFlag = false;
			}
		}
		return cursor;
	};

	ZDate.prototype._setHead = function(){
		var e_month = this._ele.month;
		var e_year = this._ele.year;
		$(e_month).val('');
		$(e_year).val('');
		$(e_month).val(this._currCal.getMonth() + 1);
		$(e_year).val(this._currCal.getFullYear());
		$(this._ele.calen).html('');
		this._renderCalendar();
	};

	ZDate.prototype._getTimeFromElem = function(){

	};

	ZDate.prototype.nextMonth = function(){
		this._currCal.setMonth(this._currCal.getMonth() + 1);
		this._setHead();
	};

	ZDate.prototype.prevMonth = function(){
		this._currCal.setMonth(this._currCal.getMonth() - 1);
		this._setHead();
	};

	ZDate.prototype.setSelStart = function(e){
		var target = e.target;
		$(target).removeClass('z-d-sel');
		$(target).addClass('z-d-sel-term');
	}

	ZDate.prototype.setSingleSel = function(e){
		var target = e.target;
		$(target).removeClass('z-d-sel-term');
		$(target).addClass('z-d-sel');
	};

	/**
	 * Expose it to global environment
	 */
	function zd(q){
		var d = $(q);
		/**
		 * Multiple z-dates found, wrap the first one.
		 */
		return d.length == 0 ? null : new ZDate(d[0]);
	}

	window.zd = zd;
})(jQuery, window, document);