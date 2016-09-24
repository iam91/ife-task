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

		var engine = $('.engine input[name="engine"]:checked').val();
		var energy = $('.energy input[name="energy"]:checked').val();

		console.log(engine + ',' + energy);

		var newShip = new Ship(code, engine, energy);
		newShip.init();
		mediator.register(newShip);
		this.ships[code] = dom;
		this.shipCnt++;
	}
	else{
		alert('No more than 4 ships can be created!');
	}
};
