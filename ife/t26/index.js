var $$ = function(element){
	//convert newly created dom object to jquery object
	return $(document.createElement(element));
}

/*

|--- ship --- dom
		 |--- position
         |--- fuel
         |--- state
         |--- subjectiveId
         |--- objectiveId
         |*** move()
         |*** stop()
         |*** consumeFuel()
         |*** provideFuel()
         |*** destroy()

*/

function Ship(space){
	var _ = Ship.prototype;

	this._space = space;
	this._position = 0;
	this._speed = 8;
	this._isRunning = false;
	this._dom = (function(){
		var orbit = $$('div').addClass('orbit').appendTo(this.space);
		$$('div').addClass('ship').appendTo(orbit);
		return orbit;
	}).call(this);
}

Ship.prototype.move = function(){
	
	this._dom.css('transform', 'rotate(' + (this._position += this._speed) % 360 + 'deg)');
};

Ship.prototype.stop = function(){

}

/*

|--- commander --- shipId
              |*** launch()
              |*** moveCmd()
              |*** stopCmd()
              |*** destroyCmd()

*/

/*

|--- mediator *** recieve()
             |*** forward()

*/

/*

|--- space view(coordinate system) --- ships

*/

var Universe = (function(){
	var instance;

	var Universe = function(){
		if(instance){
			return instance;
		}

		this.ships = [];
		this.space = this.init();

		instance = this;
	};

	Universe.prototype.init = function(){
		var space = $$('div').addClass('space');
		var planet = $$('div').addClass('planet');

		planet.appendTo(space);
		space.appendTo($(document.body));
		return space;
	};

	return Universe;
})();

/***** main *****/

var p1 = new Universe();
var p2 = new Universe();

console.log(p1 === p2);

var s = new Ship(p1.space);

setInterval(function(){
	s.move();
}, 10);