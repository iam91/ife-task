/*

|--- engine ---|

*/
function Engine(speed, consume){
	this._speed = speed;
	this._consume = consume;
}

/*
 * dynamicParam = {
 *     fuel:,
 *     position,
 *     dom
 * }
 */
Engine.prototype.step = function(dynamicParam){
	var curr = dynamicParam.fuel;
	var fuelChange = (curr - this._consume < 0) ? 0 : this._consume;
	dynamicParam.fuel -= fuelChange;
	if(fuelChange > 0){
		dynamicParam.dom.css('transform', 'rotate(' + (dynamicParam.position += this._speed) % 360 + 'deg)');
	}
	return fuelChange;
};

var EngineFactory = {
	_timeGra: timeGra,	
	_factory: {
		walker: {speed: 30, consume: 5},
		runner: {speed: 50, consume: 7},
		flier: {speed: 70, consume: 9}
	},
	getInstance: function(type){
		var speed = this._factory[type].speed / this._timeGra;
		var consume = this._factory[type].consume / this._timeGra;
		return new Engine(speed, consume);
	}
};

/*

|--- energy ---|

*/
function Energy(charge){
	this._charge = charge;
}

Energy.prototype.charge = function(fuel){
	var curr = fuel;
	fuel += (curr <= 100 - this._charge) ? this._charge : 100 - curr;
	return fuel;
};

var EnergyFactory = {
	_timeGra: timeGra,
	_factory: {
		strong: 2,
		lightwave: 3,
		permanent: 4
	},
	getInstance: function(type){
		return new Energy(this._factory[type] / this._timeGra);
	}
};

/*

|--- ship ---|

*/
function Ship(id, engine, energy){
	this._space = $('.space');
	this._id = id;
	this._fuel = 100;
	this._position = 0;


	this._engine = EngineFactory.getInstance(engine);
	this._energy = EnergyFactory.getInstance(energy);

	this._moveTimer = -1;
	this._chargeTimer = -1;
	this._renderTimer = -1;

	this._dom = null;

	this._isRunning = false;
	this._isCharging = false;
}

Ship.prototype.template = "<div class=ship>{}号-[]%</div>";
Ship.prototype.sysInterval = sysTimeInterval;
Ship.prototype.renderInterval = 1000;

Ship.prototype.render = function(dom){
	dom.html(this.template.replace(/\{\}/g, this._id)
						  .replace(/\[\]/g, parseInt(this._fuel)));
};

Ship.prototype.init = function(){
	this._dom = $$('div').addClass('orbit').appendTo(this._space);
	this.render(this._dom);

	var _this = this;

	var charge = function(){
		_this._fuel = _this._energy.charge(_this._fuel);
	};

	var render = function(){
		_this.render(_this._dom);
	};

	this._chargeTimer = setInterval(charge, this.sysInterval);
	this._renderTimer = setInterval(render, this.renderInterval);
};

Ship.prototype.exec = function(cmd){
	if(cmd.id === this._id){
		this[cmd.command].call(this);
		return true;
	}
	return false;
}

Ship.prototype.stop = function(){
	this._isRunning = false;
	this._isCharging = false;
	clearInterval(this._moveTimer);
};

Ship.prototype.move = function(){
	if(!this._isRunning){
		this._isRunning = true;
		var _this = this;

		var move = function(){
			var t = {
				fuel: _this._fuel,
				position: _this._position,
				dom: _this._dom
			};

			var fuelChange = 0;
			if(!_this._isCharging){
				fuelChange = _this._engine.step(t);
				if(fuelChange > 0){
					//update dynamic parameters
					_this._fuel = t.fuel;
					_this._position = t.position;
				}
				else{
					_this._isCharging = true;
				}
			}
			else{
				if(_this._fuel > 50){
					_this._isCharging = false;
				}
			}
		};

		this._moveTimer = setInterval(move, _this.sysInterval);
	}
};

Ship.prototype.destroy = function(){
	clearInterval(this._chargeTimer);
	clearInterval(this._renderTimer);
	clearInterval(this._moveTimer);
	this._dom.remove();
	this._space = null;
};
///////////////////////////////////////////////////
