/*

|--- data center ---|

*/

function DC(){
	this._ships = {};
	this._dc = $('.dc tbody');
}

DC.prototype._template = '<td>No.{id}</td>'
	+ '<td>{energy}</td>'
	+ '<td>{engine}</td>'
	+ '<td>{state}</td>'
	+ '<td>{fuel}</td>';

DC.prototype._render = function(ship){
	ship.dom.html(this._template.replace(/\{id\}/g, ship.id)
									  	   .replace(/\{energy\}/g, ship.energy)
									  	   .replace(/\{engine\}/g, ship.engine)
									  	   .replace(/\{state\}/g, ship.state)
									  	   .replace(/\{fuel\}/g, ship.fuel));
};

DC.prototype.destroy = function(id){
	var ship = this._ships[id];
	ship.dom.detach();
	delete this._ships[id];
};

DC.prototype.update = function(report){
	var id = report.id;
	var ship = this._ships[id];
	if(ship){
		/* 
		 * A little bug here, ship information should be removed when ship is really destroyed!
		 * 
		 */
		ship.state = report.state;
		ship.fuel = report.fuel;
		this._render(ship);
	}
};

DC.prototype.addShip = function(id, engine, energy){
	var ship = {
		id: id,
		engine: engine, 
		energy: energy,
		state: 'unknown',
		fuel: 'unknown',
		dom: $$('tr').appendTo(this._dc)
	};
	this._render(ship);
	this._ships[id] = ship;
};

/*

|--- commander ---|

*/

function Commander(dc){
	this._dom = $('.cmd');
	this.ships = {};
	this.shipCnt = 0;
	this.max = 4;
	this._dc = dc;
};

Commander.prototype.template = 
			 "<label>对第{}号飞船下达命令</label>" + 
			 "<button name='{}' class='cmd-move'>飞行</button>" + 
			 "<button name='{}' class='cmd-stop'>停止</button>" +
			 "<button name='{}' class='cmd-destroy'>销毁</button>";

Commander.prototype.buttonHandler = function(btn, forward, media){
	var id = parseInt(btn.attr('name'));
	var cmd = {
		type: 'cmd',
		id: id
	};
	if(btn.hasClass('cmd-create')){
		this.create(forward, media);
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
		this._dc.destroy(id);
	}
	media.getMessage(JSON.stringify(cmd));
};

Commander.prototype.exec = function(report){
	var report = JSON.parse(report);
	if(report.type === 'report'){
		//send to data center
		this._dc.update(report);
	}
	return false;
};

Commander.prototype.destroy = function(id){
	this.ships[id].detach();
	delete this.ships[id];
	this.shipCnt--;
};

Commander.prototype.create = function(forward, media){
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

		var engine = $('.engine input[name="engine"]:checked').val();
		var energy = $('.energy input[name="energy"]:checked').val();

		console.log(engine + ',' + energy);

		var newShip = new Ship(code, engine, energy, media);
		newShip.init();
		//register 
		forward.register(newShip);
		this._dc.addShip(code, engine, energy);
		this.ships[code] = dom;
		this.shipCnt++;
	}
	else{
		alert('No more than 4 ships can be created!');
	}
};
