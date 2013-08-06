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
	
	context.fillStyle = "#4F4"
	
	context.beginPath();
	context.fillRect(Worm.positionX - Worm.size / 2, Worm.positionY - Worm.size / 2, Worm.size, Worm.size);
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

