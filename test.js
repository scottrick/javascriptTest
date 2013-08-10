//Written by Scott Atkins
//2013

var canvasInset = 8;

var documentWidth = window.innerWidth;
var documentHeight = window.innerHeight;

if (documentWidth === undefined) {
	documentWidth = 1024;
}
if (documentHeight === undefined) {
	documentHeight = 768;
}

var gameWidth = documentWidth - canvasInset * 2;
var gameHeight = documentHeight - canvasInset * 2;

// console.log("screen " + screen.width + ", " + screen.height);
// console.log("window " + window.innerWidth + ", " + window.innerHeight);

var canvas = document.createElement("canvas");
canvas.style.border = "none";
canvas.width = gameWidth;
canvas.height = gameHeight;
document.body.appendChild(canvas);

// console.log(canvas.style);

var context = canvas.getContext("2d");

var NUMBER_OF_APPLES = 32;
var BOARD_SPACE_SIZE = 16;

var BOARD_SPACE_EMPTY = 0;
var BOARD_SPACE_WORM = 1;
var BOARD_SPACE_APPLE = 2;
var BOARD_SPACE_WORM_DEATH = 3;
var BOARD_SPACE_WORM_WALL_DEATH = 4;

var Board = { };
Board.width =  Math.floor(canvas.width / BOARD_SPACE_SIZE);
Board.height = Math.floor(canvas.height / BOARD_SPACE_SIZE);
Board.spaces = new Array();

var WORM_DIR_UP = 1;
var WORM_DIR_DOWN = 2;
var WORM_DIR_LEFT = 3;
var WORM_DIR_RIGHT = 4;

var Worm = { };
Worm.alive = true;
Worm.speed = 1.0 / 25.0;
Worm.length = 5;
Worm.direction = WORM_DIR_LEFT;
Worm.nextDirection = Worm.direction;
Worm.timeAccumulator = 0.0;

Worm.body = new Array();

Worm.initialize = function() {
	var head = { };
	head.x = Math.floor(Board.width / 2);
	head.y = Math.floor(Board.height / 2);
	Worm.body.push(head);
}

Worm.update = function(deltaTime) {
	if (!this.alive) {
		return;
	}

	Worm.timeAccumulator += deltaTime;

	while (Worm.timeAccumulator >= Worm.speed) {
		Worm.direction = Worm.nextDirection;
		Worm.advance();
		Worm.timeAccumulator -= Worm.speed;
	}
}

Worm.advance = function() {
	var head = Worm.body[0];
	var newHead = { };

	newHead.x = head.x;
	newHead.y = head.y;

	if (Worm.direction == WORM_DIR_LEFT) {
		newHead.x--;
	}
	else if (Worm.direction == WORM_DIR_RIGHT) {
		newHead.x++;
	}
	else if (Worm.direction == WORM_DIR_UP) {
		newHead.y--;
	}
	else if (Worm.direction == WORM_DIR_DOWN) {
		newHead.y++;
	}

	//check collision stuff here!
	//first make sure the user didn't collidge with the board walls
	if (newHead.x < 0 || newHead.y < 0 || newHead.x >= Board.width || newHead.y >= Board.height) {
		//ran into the wall!
		Worm.alive = false;
		Board.setSpace(head.x, head.y, BOARD_SPACE_WORM_WALL_DEATH);

		var snd = new Audio("scream.wav"); // buffers automatically when created
		snd.play();
	}
	else 
	{
		//check collision against board contents!
		var space = Board.getSpace(newHead.x, newHead.y);

		if (space == BOARD_SPACE_EMPTY) {
			//didn't run into anything!
			Board.setSpace(newHead.x, newHead.y, BOARD_SPACE_WORM);
		}
		else if (space == BOARD_SPACE_WORM || space == BOARD_SPACE_WORM_DEATH) {
			//ran into the worm!
			Worm.alive = false;
			Board.setSpace(newHead.x, newHead.y, BOARD_SPACE_WORM_DEATH);
		}
		else if (space == BOARD_SPACE_APPLE) {
			Worm.grow();
			Board.placeApple();
			Board.setSpace(newHead.x, newHead.y, BOARD_SPACE_WORM);
		}

		Worm.body.splice(0, 0, newHead);
	}

	if (Worm.alive) {
		while (Worm.body.length > Worm.length) {
			var tail = Worm.body.pop();
			Board.setSpace(tail.x, tail.y, BOARD_SPACE_EMPTY);
		}
	}
}

Worm.grow = function() {
	Worm.length += 4;
}

Board.setSpace = function(x, y, newValue) {
	Board.spaces[x + y * Board.width] = newValue;
}

Board.getSpace = function(x, y) {
	return Board.spaces[x + y * Board.width];
}

Board.initialize = function() {
	//set all spaces to empty!
	for (var x = 0; x < Board.width; x++) {
		for (var y = 0; y < Board.height; y++) {
			Board.setSpace(x, y, BOARD_SPACE_EMPTY);
		}
	}

	//set the initial worm head space
	Board.setSpace(Worm.headX, Worm.headY, BOARD_SPACE_WORM);

	//place the initial apples
	for (var i = 0; i < NUMBER_OF_APPLES; i++) {
		Board.placeApple();
	}
}

Board.placeApple = function() {
	//calculate how many empty spaces we have
	var numberOfEmptySpaces = 0;

	for (var x = 0; x < Board.width; x++) {
		for (var y = 0; y < Board.height; y++) {
			if (Board.getSpace(x, y) == BOARD_SPACE_EMPTY) {
				numberOfEmptySpaces++;
			}
		}
	}

	//choose a random empty space
	var space = Math.floor(Math.random() * numberOfEmptySpaces);

	var currentSpace = 0;
	for (var x = 0; x < Board.width; x++) {
		for (var y = 0; y < Board.height; y++) {
			if (Board.getSpace(x, y) == BOARD_SPACE_EMPTY) {
				if (currentSpace == space) {
					//found our space!!!!!
					Board.setSpace(x, y, BOARD_SPACE_APPLE);
					return;
				}
				else {
					currentSpace++;
				}
			}
		}
	}
}

Board.dump = function() {
	for (var y = 0; y < Board.height; y++) {
		var line = "" + y;

		while (line.length < 4) {
			line += " ";
		}

		line += " > ";

		for (var x = 0; x < Board.width; x++) {
			line += "" + Board.getSpace(x, y);
		}

		console.log(line);
	}
}

Worm.initialize();
Board.initialize();

//keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
		keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
		delete keysDown[e.keyCode];
}, false);

var Game = { };

Game.fps = 60;

Game.run = (function() {
		var loops = 0, skipTicks = 1000 / Game.fps,
		maxFrameSkip = 10,
		nextGameTick = (new Date).getTime(),
		lastGameTick;
		
		return function() {
			loops = 0;
			
			while ((new Date).getTime() > nextGameTick) {
				Game.update();
				nextGameTick += skipTicks;
				loops++;
			}		
			
			if (!loops) {
				Game.draw((nextGameTick - (new Date).getTime()) / skipTicks);
			} else {
				Game.draw(0);
			}
		};
})();

Game.draw = function() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	context.fillStyle = "#000"
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var xInset = Math.floor((canvas.width - BOARD_SPACE_SIZE * Board.width) / 2);
	var yInset = Math.floor((canvas.height - BOARD_SPACE_SIZE * Board.height) / 2);

	context.fillStyle = "#444";

	context.beginPath();
	context.fillRect(0, 0, canvas.width, yInset);
	context.fillRect(canvas.width - xInset, 0, xInset, canvas.height);
	context.fillRect(0, 0, xInset, canvas.height);
	context.fillRect(0, canvas.height - yInset, canvas.width, yInset);

	for (var x = 0; x < Board.width; x++) {
		for (var y = 0; y < Board.height; y++) {
			var spaceContents = Board.getSpace(x, y);

			if (spaceContents > BOARD_SPACE_EMPTY) {
				//space has something in it!  So lets draw it...
				if (spaceContents == BOARD_SPACE_APPLE) {
					context.fillStyle = "#B00";
					context.fillRect(xInset + x * BOARD_SPACE_SIZE, yInset + y * BOARD_SPACE_SIZE, BOARD_SPACE_SIZE, BOARD_SPACE_SIZE);
				}
				else if (spaceContents == BOARD_SPACE_WORM) {
					context.fillStyle = "#0B0";
					context.fillRect(xInset + x * BOARD_SPACE_SIZE, yInset + y * BOARD_SPACE_SIZE, BOARD_SPACE_SIZE, BOARD_SPACE_SIZE);
				}
				else if (spaceContents == BOARD_SPACE_WORM_DEATH) {
					context.fillStyle = "#BB0";
					context.fillRect(xInset + x * BOARD_SPACE_SIZE, yInset + y * BOARD_SPACE_SIZE, BOARD_SPACE_SIZE, BOARD_SPACE_SIZE);
				}
				else if (spaceContents == BOARD_SPACE_WORM_WALL_DEATH) {
					context.fillStyle = "#B0B";
					context.fillRect(xInset + x * BOARD_SPACE_SIZE, yInset + y * BOARD_SPACE_SIZE, BOARD_SPACE_SIZE, BOARD_SPACE_SIZE);
				}
			}
		}
	}
};

Game.update = function() { 
	var deltaTime = 1 / Game.fps;
	
	if (38 in keysDown || 87 in keysDown) { // Player holding up
		if (Worm.direction != WORM_DIR_DOWN) {
			//can't instantly go backwards
			Worm.nextDirection = WORM_DIR_UP;
		}
	}
	if (40 in keysDown || 83 in keysDown) { // Player holding down
		if (Worm.direction != WORM_DIR_UP) {
			//can't instantly go backwards
			Worm.nextDirection = WORM_DIR_DOWN;
		}
	}
	if (37 in keysDown || 65 in keysDown) { // Player holding left
		if (Worm.direction != WORM_DIR_RIGHT) {
			//can't instantly go backwards
			Worm.nextDirection = WORM_DIR_LEFT;
		}
	}
	if (39 in keysDown || 68 in keysDown) { // Player holding right
		if (Worm.direction != WORM_DIR_LEFT) {
			//can't instantly go backwards
			Worm.nextDirection = WORM_DIR_RIGHT;
		}
	}

	Worm.update(deltaTime);
};

//start the loop!
Game._intervalId = setInterval(Game.run, 0);

