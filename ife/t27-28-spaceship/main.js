/***** main *****/
/* TODO 命令数据格式适配；处理僵尸飞船 */
//////////////////

function init(){
	var dc = new DC();
	var commander = new Commander(dc);
	var forward = new Forward();
	var media = new Media(0.1, 300, 'bus', forward);

	forward.register(commander);
	
	$('.cmd').delegate('button', 'click', (function(){
		var com = commander;
		var med = media;
		var forw = forward;
		return function(){
			com.buttonHandler($(this), forw, med);
		}
	})());
}

init();

//////////////////