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
	var maxTrial = 100;
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

function Media(failRate, delay, type, receiver){
	this._failRate = failRate;
	this._delay = delay;
	this._type = type;
	this._receiver = receiver;
	this._console = $('.console');
}

Media.prototype._channels = {
	mediator: mediator,
	bus: bus
};

Media.prototype.getMessage = function(msg){
	this.transmit(msg, this._receiver);
}

Media.prototype.channelTrial = function(msg, channelFn){
	return channelFn(msg);
};

Media.prototype.transmit = function(msg, receiver){
	if(this.channelTrial(msg, this._channels[this._type])){
		var timer = -1;
		var delay = function(){
			if(timer > -1){
				clearTimeout(timer);
			}
			receiver.receive(msg);
		};

		timer = setTimeout(delay, this._delay);
	}
	else{
		$$('p').html("Message: " + msg + " lost!").appendTo(this._console);
	}
};

/*

|--- forward ---|

*/

function Forward(){
	this._participants = [];
	this._console = $('.console');
}

Forward.prototype.register = function(par){
	this._participants.push(par);
};

Forward.prototype.receive = function(msg){
	var t = -1;
	for(var i = 0; i < this._participants.length; i++){
		if(this._participants[i].exec(msg)){
			t = i;
		}
	}
	if(t > -1){
		this._participants = 
			this._participants.slice(0, t)
							  .concat(this._participants.slice(t + 1));
	}
	$$('p').html("Message: " + msg + " transmitted!").appendTo(this._console);
};
