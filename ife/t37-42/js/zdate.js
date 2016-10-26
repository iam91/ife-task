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
		SHOW          : '.z-d-show input',
		PAD           : '.z-d-pad',
		HEAD          : '.z-d-head',
		PREV_ARROW    : '.z-d-prev',
		NEXT_ARROW    : '.z-d-next',
		CALENDAR      : '.z-d-cal',
		CALENDAR_HEAD : '.z-d-cal-h',
		CALENDAR_BODY : '.z-d-cal-b',
		YEAR          : '.z-d-y',
		MONTH         : '.z-d-m',
		DATE         : 'span',
		SEL_TERMINAL  : '.z-d-ter',
		SEL_RANGE     : '.z-d-ran'
	};

	var CAL_HEAD_VALIDATOR = {
		y: /^[1-9]\d{0,3}$/, 
		m: /^([1-9]{1}|1[0-2]{1})$/
	}

	var frame =     '<div class="z-d-show"><input type="text" readonly="true"></div>'
				  + '<div class="z-d-pad">'
				   	+'<div class="z-d-head">'
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

	var MILLISECOND_DAY = 24 * 3600 * 1000;

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
		},

		dateFormat: function(d){
			return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
		},

		dateStandardize: function(d, standard){
			var r = null;
			if(d && standard){
				r = this.dateClone(standard);
				r.setDate(d.getDate());
				r.setMonth(d.getMonth());
				r.setFullYear(d.getFullYear());
			}
			d = null;
			return r;
		}
	};

	function ZDate(base, param){
		//store current year and month showing
		this._currCal = new Date();
		this._calStart = 0;
		this._calEnd = 0;
		this._calStartElem = null;
		this._calEndElem = null;

		this._selStart = param 
			&& (
					Util.dateStandardize(param.sel, this._currCal) 
					|| Util.dateStandardize(param.selStart, this._currCal)
				)
			|| Util.dateClone(this._currCal);
		this._selEnd = param 
			&& (
					Util.dateStandardize(param.sel, this._currCal) 
					|| Util.dateStandardize(param.selEnd, this._currCal)
				)
			|| Util.dateClone(this._currCal);
		this._min = param && param.min || 0;
		this._max = param && param.max || 0
		this._selStartElem = null;
		this._selEndElem = null;

		this._base = base;
		this._month = null;
		this._year = null;
		this._calbody = null;
		this._show = null;
		this._pad = null;

		this._init();
	}

	//rendering and events binding
	ZDate.prototype._init = function(){
		var base = this._base;

		//render the frame
		$(base).html(frame);

		var e_month = $(base).find(Selector.MONTH);
		var e_year = $(base).find(Selector.YEAR);
		var e_calbody = $(base).find(Selector.CALENDAR_BODY);
		var e_show = $(base).find(Selector.SHOW);
		var e_pad = $(base).find(Selector.PAD);

		this._month = e_month;
		this._year = e_year;
		this._calbody = e_calbody;
		this._show = e_show;
		this._pad = e_pad;

		var month = this._currCal.getMonth();
		var year = this._currCal.getFullYear();

		$(e_month).val(month + 1);
		$(e_year).val(year);
		e_pad.hide();
		this._renderShow();
		this._renderCalendar();

		//events binding
		var handlerWrapper = function(fn){
			return function(e){
				var _this = e.data.that;
				fn.call(_this, e);
			};
		};

		var fix = {that: this};

		$($(base).find(Selector.PREV_ARROW))
			.bind('click', fix, handlerWrapper(this.prevMonth));
		$($(base).find(Selector.NEXT_ARROW))
			.bind('click', fix, handlerWrapper(this.nextMonth));
		$(e_calbody).on('dblclick', Selector.DATE, fix, handlerWrapper(this._setSingleSel));
		$(e_calbody).on('click', Selector.DATE, fix, handlerWrapper(this._setRangeSel));
		$(e_show).bind('click', fix, handlerWrapper(this.togglePad));
		
		$(e_year).focusout(fix, handlerWrapper(this._changeCalHead));
		$(e_month).focusout(fix, handlerWrapper(this._changeCalHead));
	};

	//rendering
	ZDate.prototype._renderShow = function(){
		//render show text box
		var t = this._selStart.getTime() == this._selEnd.getTime() ? '' 
			: ' ~ ' + Util.dateFormat(this._selEnd)
		$(this._show).val(Util.dateFormat(this._selStart) + t);
	};

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
		$(this._calbody).html('');
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
		//set end date of calendar
		this._calEnd = Util.dateClone(cursor);
		this._calEnd.setDate(this._calEnd.getDate() - 1);
		//set start and end elements of calendar
		this._calStartElem = $(frag).children().first().children().first();
		this._calEndElem = $(frag).children().last().children().last();

		$(frag).appendTo(this._calbody);
	};

	ZDate.prototype._setHead = function(){
		$(this._month).val('').val(this._currCal.getMonth() + 1);
		$(this._year).val('').val(this._currCal.getFullYear());
	};

	ZDate.prototype._renderSel = function(){
		if(this._selStart.getTime() > this._calEnd.getTime()
			|| this._selEnd.getTime() < this._calStart.getTime()){
			return;
		}

		var cur = this._selStartElem ? this._selStartElem : this._calStartElem;
		var end = this._selEndElem ? this._selEndElem : this._calEndElem;

		$(cur).addClass(
			this._selStart.getTime() >= this._calStart.getTime() ? 
			ClassName.SEL_TERMINAL : ClassName.SEL_RANGE);

		$(end).addClass(
			this._selEnd.getTime() <= this._calEnd.getTime() ?
			ClassName.SEL_TERMINAL : ClassName.SEL_RANGE);

		if(!$(cur).is(end)){
			cur = this._nextDate(cur);
			while(cur && !$(cur).is(end)){
				$(cur).addClass(ClassName.SEL_RANGE);
				cur = this._nextDate(cur);
			}
		}
	};

	ZDate.prototype._nextDate = function(cur){
		var curPar = $(cur).parent();
		if($(cur).next().length == 0){
			return $(curPar).next().length == 0 ? null : $(curPar).next().children().first();
		}
		return $(cur).next();
	};

	ZDate.prototype._clearSel = function(){
		$(this._calbody).find(Selector.SEL_TERMINAL).removeClass(ClassName.SEL_TERMINAL);
		$(this._calbody).find(Selector.SEL_RANGE).removeClass(ClassName.SEL_RANGE);
	};

	//private
	ZDate.prototype._changeCalHead = function(e){
		var target = e.target;
		var g = $(target).is(this._year) ? 'y' : 'm'
		var t = g === 'y' ? this._currCal.getFullYear() : this._currCal.getMonth();
		var va = CAL_HEAD_VALIDATOR[g];
		var v = $(target).val().trim();
		if(va.test(v)){
			if(g === 'y'){
				this._currCal.setFullYear(parseInt(v));
			}else{
				this._currCal.setMonth(parseInt(v - 1));
			}
			this._setHead();
			this._renderCalBody();
			this._renderSel();
		}else{
			this._setHead();
		}
	};

	ZDate.prototype._getSelDate = function(target){
		var selDate = parseInt($(target).text());
		var sel = Util.dateClone(this._currCal);
		sel.setDate(selDate);


		if(selDate < 7 && $(target).parent().is($(this._calEndElem).parent())){
			sel.setMonth(sel.getMonth() + 1);
		}
		if(selDate > 22 && $(target).parent().is($(this._calStartElem).parent())){
			sel.setMonth(sel.getMonth() - 1);
		}

		return sel;
	};

	ZDate.prototype._setRangeSel = function(e){
		var target = e.target;
		var sel = this._getSelDate(target);
		var startTime = this._selStart.getTime();
		var endTime = this._selEnd.getTime();
		var midTime = (startTime + endTime) / 2;
		var curTime = sel.getTime();
		//reset time
		var selStart = curTime <= midTime ? sel : this._selStart;
		var selEnd = curTime > midTime ? sel : this._selEnd;
		
		var dayRange = (selEnd.getTime() - selStart.getTime()) / MILLISECOND_DAY + 1;
		if(this._max > 0 && dayRange > this._max){
			alert('Should be no more than ' + this._max + '!');
			return;
		}
		if(dayRange < this._min){
			alert('Should be no less than ' + this._min + '!');
			return;
		}

		this._selStart = selStart;
		this._selEnd = selEnd;

		this._selStartElem = curTime <= midTime ? target : this._selStartElem;
		this._selEndElem = curTime > midTime ? target : this._selEndElem;

		this._renderShow();
		this._clearSel();
		this._renderSel();
	}

	ZDate.prototype._setSingleSel = function(e){
		var target = e.target;
		var sel = this._getSelDate(target);
		this._selEnd = this._selStart = sel;
		this._selStartElem = this._selEndElem = target;
		this._renderShow();
		this._clearSel();
		this._renderSel();
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

	ZDate.prototype.togglePad = function(){
		$(this._pad).toggle();
	}

	ZDate.prototype.getDates = function(){
		if(this._selStart.getTime() ==  this._selEnd.getTime()){
			return {sel: this._selStart};
		}else{
			return {selStart: this._selStart, selEnd: this._selEnd};
		}
	};

	/**
	 * Expose it to global environment
	 */
	function zd(q, param){
		var d = $(q);
		/**
		 * Multiple z-dates found, wrap the first one.
		 */
		return d.length == 0 ? null : new ZDate(d[0], param);
	}

	window.zd = zd;
})(jQuery, window, document);