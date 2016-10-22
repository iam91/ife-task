/**
 * Depends on jQuery
 */
;(function($, window, document){

	function $$(elem){
		return document.createElement(elem);
	}

	var ClassName = {
		NOT_IN_MONTH : 'z-d-not-in',
		SEL_TERMINAL : 'z-d-ter',
		SEL_RANGE    : 'z-d-ran'
	};

	var Selector = {
		BASE          : '.z-date',
		HEAD          : '.z-d-head',
		PREV_ARROW    : '.z-d-prev',
		NEXT_ARROW    : '.z-d-next',
		CALENDAR      : '.z-d-cal',
		CALENDAR_HEAD : '.z-d-cal-h',
		CALENDAR_BODY : '.z-d-cal-b',
		YEAR          : '.z-d-y',
		MONTH         : '.z-d-m',
		DATE          : 'span',
		SEL_TERMINAL  : '.z-d-ter',
		SEL_RANGE     : '.z-d-ran'
	};

	var frame = '<div class="z-d-head">'
			  	+ '<span class="z-d-prev"></span>'
				+ '<input class="z-d-y">'
				+ '<input class="z-d-m">'
				+ '<span class="z-d-next"></span>'
			  + '</div>' 
			  + '<div class="z-d-cal">'
			  	+ '<div class="z-d-cal-h"></div>'
				+ '<div class="z-d-cal-b"></div>'
			  + '</div>';

	var week = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

	var Util = {
		dateClone: function(d){
			return new Date(d.getTime());
		},

		dateForward: function(d){
			d.setDate(d.getDate() + 1);
			return d;
		},

		dateBackward: function(d){
			d.setDate(d.getDate() - 1);
			return d;
		}
	};

	function ZDate(base){
		//store current year and month showing
		this._currCal = new Date();
		this._calStart = 0;
		this._calEnd = 0;
		this._calStartElem = null;
		this._calEndElem = null;

		this._selStart = Util.dateClone(this._currCal);
		this._selEnd = Util.dateClone(this._currCal);
		this._selStartElem = null;
		this._selEndElem = null;
		this._selSingleDay = true;

		this._base = base;
		this._month = null;
		this._year = null;
		this._calbody = null;

		this._init();
	}

	//rendering and events binding
	ZDate.prototype._init = function(){
		var base = this._base;

		//render the frame
		$(base).html(frame);

		var e_month = $(base).find(Selector.MONTH);
		var e_year = $(base).find(Selector.YEAR);
		var e_cal = $(base).find(Selector.CALENDAR);
		var e_prev = $(base).find(Selector.PREV_ARROW);
		var e_next = $(base).find(Selector.NEXT_ARROW);
		var e_calbody = $(base).find(Selector.CALENDAR_BODY);

		this._month = e_month;
		this._year = e_year;
		this._calbody = e_calbody;

		var month = this._currCal.getMonth();
		var year = this._currCal.getFullYear();

		$(e_month).val(month + 1);
		$(e_year).val(year);

		this._renderCalendar();

		//events binding
		var handlerWrapper = function(fn){
			return function(e){
				var _this = e.data.that;
				fn.call(_this, e);
			};
		};

		var fix = {that: this};

		$(e_prev).bind('click', fix, handlerWrapper(this.prevMonth));
		$(e_next).bind('click', fix, handlerWrapper(this.nextMonth));
		$(e_calbody).bind('dblclick', fix, handlerWrapper(this.setSingleSel));
		$(e_calbody).bind('click', fix, handlerWrapper(this.setRangeSel));

		//$(this._selStartElem).trigger('click');
		//$(this._selEndElem).trigger('click');
	};

	//rendering
	ZDate.prototype._renderCalendar = function(){
		//render calendar head
		var inner = '<div>';
		for(var i = 0; i < 7; i++){
			inner += '<span>' + week[i] + '&nbsp;</span>';
		}
		inner += '</div>';
		$(this._base).find(Selector.CALENDAR_HEAD).html(inner);

		this._renderCalBody();
		this._renderSel();
	};

	ZDate.prototype._renderCalBody = function(){
		//create cursor for calendar body rendering
		var currMonth = this._currCal.getMonth();
		var nextMonth = (currMonth + 1) % 12;

		var cursor = Util.dateClone(this._currCal);
		cursor.setDate(1);
		cursor.setDate(cursor.getDate() - cursor.getDay());

		//set start date of calendar
		this._calStart = Util.dateClone(cursor);

		var frag = document.createDocumentFragment();
		this._selStartElem = null;
		this._selEndElem = null;
		while(cursor.getMonth() != nextMonth){
			var line = $($$('div')).appendTo(frag);
			for(var i = 0; i < 7; i++){
				var d = $$('span');
				$(d).text(cursor.getDate() + ' ').appendTo(line);
				if(cursor.getMonth() != currMonth){
					$(d).addClass(ClassName.NOT_IN_MONTH);
				}

				//set selected day(s)
				this._selStartElem = cursor.getTime() == this._selStart.getTime() 
					? d : this._selStartElem;
				this._selEndElem = cursor.getTime() == this._selEnd.getTime() 
					? d : this._selEndElem;

				cursor = Util.dateForward(cursor);
			}
		}
		console.log('-------------------');
		console.log(this._selStartElem);
		console.log(this._selEndElem);
		console.log('-------------------');
		//set end date of calendar
		this._calEnd = Util.dateClone(cursor);
		//set start and end elements of calendar
		this._calStartElem = $(frag).children().first().children().first();
		this._calEndElem = $(frag).children().last().children().last();

		this._selStartElem = this._selStart.getTime() < this._calStart.getTime() 
			? this._calStartElem : this._selStartElem;
		this._selEndElem = this._selEnd.getTime() > this._calEnd.getTime() 
			? this._calEndElem : this._selEndElem;

		$(frag).appendTo(this._calbody);
		console.log('===================');
		console.log(this._selStartElem);
		console.log(this._selEndElem);
		console.log(this._calStartElem);
		console.log(this._calEndElem);
		console.log('===================');
	};

	ZDate.prototype._setHead = function(){
		var e_month = this._month;
		var e_year = this._year;
		$(e_month).val('').val(this._currCal.getMonth() + 1);
		$(e_year).val('').val(this._currCal.getFullYear());
		$(this._calbody).html('');
	};

	ZDate.prototype._renderSel = function(){
		var cur = this._selStartElem;
		var end = this._selEndElem;

		if(this._selStart.getTime() >= this._calStart.getTime()){
			$(cur).addClass(ClassName.SEL_TERMINAL);
		}
		else{
			$(cur).addClass(ClassName.SEL_RANGE);
		}
		if(this._selEnd.getTime() <= this._calEnd.getTime()){
			$(end).addClass(ClassName.SEL_TERMINAL);
		}
		else{
			$(end).addClass(ClassName.SEL_RANGE);
		}
		
		while($(cur).parent()[0] != $(end).parent()[0]){
			if(cur != this._selEndElem){
				$(cur).addClass(ClassName.SEL_RANGE).nextAll().addClass(ClassName.SEL_RANGE);
			}
			cur = $($(cur).parent()[0]).next().children().first();
		}
		$(cur).addClass(ClassName.SEL_RANGE).nextUntil(end).addClass(ClassName.SEL_RANGE);

		
	};

	ZDate.prototype._clearSel = function(){
		$(this._calbody).find(Selector.SEL_TERMINAL).removeClass(ClassName.SEL_TERMINAL);
		$(this._calbody).find(Selector.SEL_RANGE).removeClass(ClassName.SEL_RANGE);
	};

	//private
	ZDate.prototype._getSelDate = function(target){
		var selDate = parseInt($(target).text());
		var sel = Util.dateClone(this._currCal);
		sel.setDate(selDate);

		if(selDate < 7 && $(target).parent()[0] == $(this._calEndElem).parent()[0]){
			sel.setMonth(sel.getMonth() + 1);
		}
		if(selDate > 22 && $(target).parent()[0] == $(this._calStartElem).parent()[0]){
			sel.setMonth(sel.getMonth() - 1);
		}

		return sel;
	};

	//public
	ZDate.prototype.nextMonth = function(){
		this._currCal.setMonth(this._currCal.getMonth() + 1);
		this._setHead();
		this._renderCalBody();
		this._renderSel();
	};

	ZDate.prototype.prevMonth = function(){
		this._currCal.setMonth(this._currCal.getMonth() - 1);
		this._setHead();
		this._renderCalBody();
		this._renderSel();
	};

	ZDate.prototype.setRangeSel = function(e){
		var target = e.target;

		this._clearSel();
		
		var sel = this._getSelDate(target);

		var startTime = this._selStart.getTime();
		var endTime = this._selEnd.getTime();
		var midTime = (startTime + endTime) / 2;
		var curTime = sel.getTime();
		
		this._selStartElem = curTime < midTime ? target : this._selStartElem;
		this._selEndElem = curTime > midTime ? target : this._selEndElem;
		//reset time
		this._selStart = curTime < midTime ? sel : this._selStart;
		this._selEnd = curTime > midTime ? sel : this._selEnd;

		console.log('-------------------');
		console.log(this._selStart);
		console.log(this._selEnd);
		console.log('-------------------');

		this._renderSel();
	}

	ZDate.prototype.setSingleSel = function(e){
		var target = e.target;
		
		this._clearSel();

		var sel = this._getSelDate(target);
		this._selEnd = this._selStart = sel;
		this._selStartElem = this._selEndElem = target;
		this._renderSel();
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