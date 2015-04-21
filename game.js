var Game = {
	display: null,
	init: function() {
		this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());
        this._generateMap();
	}
}

Game.map = {};
Game.player = null;
Game.engine = null;


// Key code Stuff
// -----------------------------------------------------------------------------
var keyMap = {};
keyMap[38] = 0;
keyMap[33] = 1;
keyMap[39] = 2;
keyMap[34] = 3;
keyMap[40] = 4;
keyMap[35] = 5;
keyMap[37] = 6;
keyMap[36] = 7;

// Map Stuff
// -----------------------------------------------------------------------------

Game._generateMap = function() {
    var digger = new ROT.Map.Digger();
    var freeCells = [];
 
    var digCallback = function(x, y, value) {
        if (value) { return; } /* do not store walls */
 
        var key = x+","+y;
        freeCells.push(key);
        this.map[key] = ".";
    }
    digger.create(digCallback.bind(this));
    this._generateBoxes(freeCells);
    this._createPlayer(freeCells);
    this._drawWholeMap();
}

Game._generateBoxes = function(freeCells) {
	for (var i=0; i < 10; i++) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        this.map[key] = "*";
    }
}

Game._drawWholeMap = function() {
    for (var key in this.map) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        this.display.draw(x, y, this.map[key]);
    }
}

// Player Stuff
// -----------------------------------------------------------------------------
var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}
 
Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#fff");
    console.log("Drawn?");
}

Player.prototype.act = function() {
    Game.engine.lock();
    /* wait for user input; do stuff when user hits a key */
    window.addEventListener("keydown", this);
}
 
Player.prototype.handleEvent = function(e) {
    var code = e.keyCode;
 
    if (!(code in keyMap)) { return; }
 
    var diff = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + diff[0];
    var newY = this._y + diff[1];
 
    var newKey = newX + "," + newY;
    if (!(newKey in Game.map)) { return; } /* cannot move in this direction */

    Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
}
 
Game._createPlayer = function(freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    this.player = new Player(x, y);
};

// Engine Stuff
// -----------------------------------------------------------------------------
Game.init = function() {
    var scheduler = new ROT.Scheduler.Simple();
    scheduler.add(this.player, true);
    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
}
