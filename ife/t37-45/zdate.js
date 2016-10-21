/**
 * Depends on jQuery
 */
;(function($, window, document){

	function $$(elem){
		return document.createElement(elem);
	}

	function ZDate(base){
		this._currStartDate = new Date();
		this._currEndDate = new Date();

		this._ele = {
			base: base,
			month: null,
			year: null,
			prev: null,
			next: null,
			calen: null,
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

		var e_month = $('input.z-d-m', this._ele.base);
		var e_year = $('input.z-d-y', this._ele.base);
		var e_cal = $('div.z-d-cal', this._ele.base);

		this._ele.month = e_month;
		this._ele.year = e_year;
		this._ele.calen = e_cal;

		var month = this._currStartDate.getMonth();
		var year = this._currStartDate.getFullYear();

		$(e_month).val(month + 1);
		$(e_year).val(year);

		this._renderCalendar();
	};

	ZDate.prototype._renderCalendar = function(){
		$(this._ele.calen).html('<div><span>1&nbsp;</span><span>2&nbsp;</span><span>3&nbsp;</span><span>4&nbsp;</span><span>5&nbsp;</span><span>6&nbsp;</span><span>7&nbsp;</span></div>');
		
		var cursor = new Date();
		cursor.setFullYear(this._currStartDate.getFullYear());
		cursor.setMonth(this._currStartDate.getMonth());
		cursor.setDate(1);

		this._renderFirstLine(cursor);
		this._renderRemainingLines(cursor);
	};

	ZDate.prototype._renderFirstLine = function(cursor){
		var inner = '';
		var inverseCursor = new Date();
		inverseCursor.setFullYear(cursor.getFullYear());
		inverseCursor.setMonth(cursor.getMonth());
		inverseCursor.setDate(cursor.getDate() - 1);
		while(inverseCursor.getDay() >= 0){
			inner = '<span class="z-d-notin">' + inverseCursor.getDate() + '&nbsp;</span>' + inner;	
			if(inverseCursor.getDay() == 0){
				break;
			}
			inverseCursor.setDate(inverseCursor.getDate() - 1);
		}
		while(cursor.getDay() < 7){
			inner += '<span class="z-d-in">' + cursor.getDate() + '&nbsp;</span>';	
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
			while(cursor.getDay() < 7){
				console.log(cursor.getDate())
				if(cursor.getMonth() > month){
					var preinner = '<span class="z-d-notin">';
					endFlag = false;
				}
				else{
					var preinner = '<span class="z-d-in">';
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
		}
		return cursor;
	};
	/*
	ZDate.prototype._getMonthStart = function(year, month){
		var d = new Date();
		d.setFullYear(year);
		d.setMonth(month);
		d.setDate(1);
		return {date: 1, day: d.getDay()};
	};

	ZDate.prototype._getMonthEnd = function(year, month){
		var d = new Date();
		d.setFullYear(year);
		d.setMonth(month);
		var date = this._monthDayCount[month + 1];
		d.setDate(date);
		if(d.getMonth() != month){
			d.setMonth(month);
			d.setDate(28);
			date = 28;
		}
		return {date: date, day: d.getDay()};
	};*/

	ZDate.prototype.nextMonth = function(){};

	/**
	 * Expose it to global environment
	 */
	function zd(q){
		var d = $(q);
		console.log(d)
		/**
		 * Multiple z-dates found, wrap the first one.
		 */
		return d.length == 0 ? null : new ZDate(d[0]);
	}

	window.zd = zd;
})(jQuery, window, document);