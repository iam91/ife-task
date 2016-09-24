/***** main *****/
/* TODO 抽象出信道，用于广播和单播；命令数据格式适配；处理僵尸飞船 */
//////////////////

function Mediator(){
	return new Media(0.1, 300, 'bus');
}

var Singleton = {
	Commander: Commander,
	Mediator: Mediator,
	getInstance: function(type){
		if(typeof this[type] === 'function'){
			this[type] = new this[type]();
		}
		return this[type];
	}
}

function init(){
	var commander = Singleton.getInstance('Commander');
	var mediator = Singleton.getInstance('Mediator');
	
	$('.cmd').delegate('button', 'click', (function(){
		var com = commander;
		var med = mediator;
		return function(){
			com.command($(this), med);
		}
	})());
}

init();

//////////////////