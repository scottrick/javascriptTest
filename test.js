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

console.log("screen " + screen.width + ", " + screen.height);
console.log("window " + window.innerWidth + ", " + window.innerHeight);

var canvas = document.createElement("canvas");
canvas.style.border = "none";
canvas.width = gameWidth;
canvas.height = gameHeight;
document.body.appendChild(canvas);

console.log(canvas.style);

var context = canvas.getContext("2d");

var BOARD_SPACE_SIZE = 32;

var BOARD_SPACE_EMPTY = 0;
var BOARD_SPACE_WORM = 1;
var BOARD_SPACE_APPLE = 2;

var Board = { };
Board.width =  Math.floor(canvas.width / BOARD_SPACE_SIZE);
Board.height = Math.floor(canvas.height / BOARD_SPACE_SIZE);
Board.spaces = new Array();

Board.setSpace = function(x, y, newValue) {
	Board.spaces[x + y * Board.width] = newValue;
}

Board.getSpace = function(x, y) {
	return Board.spaces[x + y * Board.width];
}

Board.initialize = function() {
	for (var x = 0; x < Board.width; x++) {
		for (var y = 0; y < Board.height; y++) {
			Board.setSpace(x, y, BOARD_SPACE_EMPTY);
		}
	}

	Board.placeApple();

	// Board.setSpace(3, 5, BOARD_SPACE_APPLE);
	// Board.setSpace(0, 0, BOARD_SPACE_WORM);
	// Board.setSpace(1, 2, BOARD_SPACE_WORM);
	// Board.setSpace(13, 15, BOARD_SPACE_WORM);
	// Board.setSpace(13, 16, BOARD_SPACE_WORM);
	// Board.setSpace(13, 17, BOARD_SPACE_WORM);
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

Board.initialize();
// Board.dump();

var Worm = { };
Worm.velocity = 1250;
Worm.size = 24;
Worm.positionX = documentWidth / 2;
Worm.positionY = documentHeight / 2;

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
			}
		}
	}
};

Game.update = function() { 
	var deltaTime = 1 / Game.fps;
	
	if (38 in keysDown || 87 in keysDown) { // Player holding up
		Worm.positionY -= Worm.velocity * deltaTime;
	}
	if (40 in keysDown || 83 in keysDown) { // Player holding down
		Worm.positionY += Worm.velocity * deltaTime;
	}
	if (37 in keysDown || 65 in keysDown) { // Player holding left
		Worm.positionX -= Worm.velocity * deltaTime;
	}
	if (39 in keysDown || 68 in keysDown) { // Player holding right
		Worm.positionX += Worm.velocity * deltaTime;
	}
	
	//don't let the thing go off the board
	Worm.positionX = Math.max(Worm.positionX, Worm.size / 2);
	Worm.positionX = Math.min(Worm.positionX, gameWidth - Worm.size / 2);
	Worm.positionY = Math.max(Worm.positionY, Worm.size / 2);
	Worm.positionY = Math.min(Worm.positionY, gameHeight - Worm.size / 2);
};

//start the loop!
Game._intervalId = setInterval(Game.run, 0);

