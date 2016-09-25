/***** main *****/
/* TODO 命令数据格式适配；处理僵尸飞船 */
//////////////////

function init(){
	var commander = new Commander();
	var forward = new Forward();
	var media = new Media(0.1, 300, 'bus', forward);

	forward.register(commander);
	
	$('.cmd').delegate('button', 'click', (function(){
		var com = commander;
		var med = media;
		return function(){
			com.buttonHandler($(this), forward, med);
		}
	})());
}

init();

//////////////////