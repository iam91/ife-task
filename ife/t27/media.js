/*

|--- channel ---|

*/

function mediator(failRate){
	var rand = Math.random();
	if(rand < failRate){
		return false;
	}
	return true;
}

function bus(failRate){
	var maxTrial = 10;
	for(var i = 0; i < maxTrial; i++){
		if(mediator(failRate)){
			return true;
		}
	}
	return false;
}

/*

|--- media ---|

*/

function Media(failRate, delay, type){
	this._failRate = failRate;
	this._delay = delay;
	this._type = type;
	this._ships = [];
	this._console = $('.console');
}

Media.prototype._channels = {
	mediator: mediator,
	bus: bus
}

Media.prototype.register = function(ship){
	this._ships.push(ship);
};

Media.prototype.getCommand = function(cmd){
	var fn = this._channels[this._type];
	if(this.channelTrial(cmd, fn)){
		var timer = -1;
		var _this = this;
		var delay = function(){
			if(timer > -1){
				clearTimeout(timer);
			}
			_this.broadcast(cmd);
			$$('p').html("命令" + cmd.command + ": " + cmd.id + "传送成功").appendTo(_this._console);
		};
		timer = setTimeout(delay, this._delay);
	}
	else{
		$$('p').html("命令" + cmd.command + ": " + cmd.id + "丢失").appendTo(this._console);
	}
};

Media.prototype.channelTrial = function(cmd, channelFn){
	return channelFn(cmd);
}

Media.prototype.broadcast = function(cmd){
	var command = cmd.command;
	var r = false;
	var t = -1;
	for(var i = 0; i < this._ships.length; i++){
		var r = this._ships[i].exec(cmd);
		if(command === 'destroy' && r){
			t = i;
		}
	}
	if(t > -1){
		this.ships = this.ships.slice(0, t)
						   	   .concat(this.ships.slice(t + 1));
	}
};