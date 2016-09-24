var $$ = function(element){
	//convert newly created dom object to jquery object
	return $(document.createElement(element));
};

var sysTimeInterval = 50;

/*

|--- ship ---|

*/

function Ship(id){
	this._space = $('.space');
	this._id = id;
	this._position = 0;
	this._speed = 8;
	this._stepInterval = 50;
	this._fuel = 100;
	this._isRunning = false;
	this._isCharging = false;
	
	this._fd = -1;
	this.chargeFd = -1;
	this.fuelRenderFd = -1;

	this._dom = (function(){
		var self = this;
		var charge = function(){
			self.charge();
		};
		var fuelRender = function(){
			self.fuelRender();
		};
		this._chargeFd = setInterval(charge, this._param.stepInterval);
		this._fuelRenderFd = setInterval(fuelRender, this._param.fuelRenderInterval);

		var orbit = $$('div').addClass('orbit')
							 .html(Ship.prototype.template.replace(/\{\}/g, this._id)
							 							  .replace(/\[\]/g, this._fuel))
							 .appendTo(this._space);
		return orbit;
	}).call(this);
}

Ship.prototype._param = {
	fuelRenderInterval: 1000,
	stepInterval: sysTimeInterval,
	speed: 12 / (1000 / sysTimeInterval), //12 deg/s
	consume: 20 / (1000 / sysTimeInterval),
	charge: 10 / (1000 / sysTimeInterval),
	fuelPerStep: 50 / (1000 / sysTimeInterval)
};

Ship.prototype.template = 
	"<div class=ship>{}号-[]%</div>";

Ship.prototype.fuelRender = function(){
	this._dom.html(Ship.prototype.template.replace(/\{\}/g, this._id)
							 			  .replace(/\[\]/g, parseInt(this._fuel)));
}

Ship.prototype.destroy = function(){
	this.stop();
	this._dom.remove();
	this._space = null;
	clearInterval(this._chargeFd);
	clearInterval(this._fuelRenderFd);
};

Ship.prototype.consume = function(){
	var curr = this._fuel;
	this._fuel -= (curr - this._param.consume < 0) ? 0 : this._param.consume;
};

Ship.prototype.charge = function(){
	var curr = this._fuel;
	this._fuel += (curr <= 100 - this._param.charge) ? this._param.charge : 100 - curr;
};

Ship.prototype.shift = function(){
	this._dom.css('transform', 'rotate(' + (this._position += this._param.speed) % 360 + 'deg)');
};

Ship.prototype.step = function(){
	if(this._isRunning){
		
		if(!this._isCharging){
			if(this._param.fuelPerStep < this._fuel){
				//take a step when fuels are enough
				this.shift();
				this.consume();
			}
			else{
				this._isCharging = true;
			}
		}
		else{
			if(this._fuel > 50){
				this._isCharging = false;
			}
		}
	}
};

Ship.prototype.move = function(){
	
	if(!this._isRunning){
		this._isRunning = true;
		var self = this;
		var step = function(){
			self.step();
		}
		this._fd = setInterval(step, this._param.stepInterval);
	}
};

Ship.prototype.stop = function(){
	this._isRunning = false;
	clearInterval(this._fd);
};

Ship.prototype.exec = function(cmd){
	if(cmd.id === this._id){
		this[cmd.command].call(this);
		return true;
	}
	return false;
}

/*

|--- commander ---|

*/

function Commander(space){
	this._dom = $('.cmd');
	this.ships = {};
	this.shipCnt = 0;
	this.max = 4;
};

Commander.prototype.template = 
			 "<label>对第{}号飞船下达命令</label>" + 
			 "<button name='{}' class='cmd-move'>飞行</button>" + 
			 "<button name='{}' class='cmd-stop'>停止</button>" +
			 "<button name='{}' class='cmd-destroy'>销毁</button>";

Commander.prototype.command = function(btn, mediator){
	var id = parseInt(btn.attr('name'));
	var cmd = {};
	cmd.id = id;
	if(btn.hasClass('cmd-create')){
		this.create(mediator);
		return;
	}
	else if(btn.hasClass('cmd-move')){
		cmd.command = 'move';
	}
	else if(btn.hasClass('cmd-stop')){
		cmd.command = 'stop';
	}
	else if(btn.hasClass('cmd-destroy')){
		cmd.command = 'destroy';
		this.destroy(id);
	}
	mediator.getCommand(cmd);
};

Commander.prototype.destroy = function(id){
	this.ships[id].detach();
	delete this.ships[id];
	this.shipCnt--;
}

Commander.prototype.create = function(mediator){
	var code = 0;
	if(this.shipCnt < this.max){
		for(var i = 0; i < this.max; i++){
			if(!this.ships[i]){
				code = i;
				break;
			}
		}

		var dom = $$('div').html(this.template.replace(/\{\}/g, code));

		this._dom.prepend(dom);

		var newShip = new Ship(code);
		mediator.register(newShip);
		this.ships[code] = dom;
		this.shipCnt++;
	}
	else{
		alert('No more than 4 ships can be created!');
	}
};


/*

|--- mediator ---|

*/

function Mediator(){
	this.ships = [];
	this._console = $('.console');
}

Mediator.prototype.getCommand = function(cmd){
	var rand = Math.random();
	var command = cmd.command;
	var r = false;
	if(rand > 0.7 && rand <= 1.0){
		var t = -1;
		for(var i = 0; i < this.ships.length; i++){
			var r = this.ships[i].exec(cmd);
			if(command === 'destroy' && r){
				t = i;
			}
		}
		if(t > -1){
			this.ships = this.ships.slice(0, t)
							   	   .concat(this.ships.slice(t + 1));
		}
		$$('p').html("命令" + cmd.command + ": " + cmd.id + "传送成功").appendTo(this._console);
	}
	else{
		$$('p').html("命令" + cmd.command + ": " + cmd.id + "丢失").appendTo(this._console);
	}
}

Mediator.prototype.register = function(ship){
	this.ships.push(ship);
}

/***** main *****/

//////////////////

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