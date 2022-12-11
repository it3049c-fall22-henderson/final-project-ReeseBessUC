/*
Name: Reesë Tuttle
Class: IT-3049C Web Game Development
Assignment: Final Project
*/

// Game Enviroment Variables.
var snakeTable = document.querySelector(".snakeTable");
var boxes = document.getElementsByClassName("box");
var module = document.querySelector(".module");
var start = document.querySelector(".start");
var historyContainer = document.querySelector(".history");
var gameStatus = document.querySelector(".gameStatus");
var scoreLimit = 10;
var table = {
	rowsCols: 33,
	boxes: 33 * 33
};
var snake = {
	direction: "right",
	position: [
		[15, 15],
		[16, 15],
		[17, 15],
		[18, 15],
		[19, 15]
	],
	interval: 300,
	food: 0,
	score: 0,
	final: 0,
	time: 0,
	canTurn: 0,
	level: 'easy',
	init: function() {
		snake.direction = "right";
		snake.position = [
			[15, 15],
			[16, 15],
			[17, 15],
			[18, 15],
			[19, 15]
		];
		snake.interval = 300;
		snake.food = 0;
		snake.score = 0;
		snake.time = 0;
		snake.canTurn = 0;
		snakeTable.innerHTML = "";
		snake.level = 'easy';
		getScoreHistory();
		tableCreation();
	}
};

setBackgroundStyle();

// init game
snake.init();

start.querySelector(".btn_easy").addEventListener("click", startSnakeEasy);
start.querySelector(".btn_hard").addEventListener("click", startSnakeHard);

// DOM exammple
document.addEventListener("keydown", function(e) {
	if (e.keyCode === 13 && snake.time === 0) {
		startSnake();
	}
});

function startSnakeEasy() {
	snake.level = 'easy';
	startSnake();
}

function startSnakeHard() {
	snake.level = 'hard';
	startSnake();
}



/*
Start Game
*/
function startSnake() {

	module.classList.add("hidden");
	// clearInterval(checkPageInterval);
	snake.time = 1;
	renderSnake();
	randomGenerateFood();
	// interval, heart of the game
	setInt = setInterval(function() {
		move();
	}, snake.interval);

	//Set visual mode (light/dark) based on user's device time.
	if (isDayTime()) {
		snakeTable.classList.add('day');
	} else {
		snakeTable.classList.add('night');
	}

	//Set game difficulty based on user's selection.
	if (snake.level == "easy") {
		snakeTable.classList.remove("hard");
		snakeTable.classList.add("easy");
	} else {
		snakeTable.classList.remove("easy");
		snakeTable.classList.add("hard");
	}
}



// end of game
function stop() {
	clearInterval(setInt);
	snake.final = snake.score;
        // DOM exammple
	start.querySelector("h1").innerHTML = snake.final + " Point(s) on " + snake.level;
        
        // Browser API ( Navigator, Geolocation ) example
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var lat = position.coords.latitude;
			var lon = position.coords.longitude;
			var requestOptions = {
				method: 'GET',
			};
                        // fetch example;
			fetch("https://api.geoapify.com/v1/geocode/reverse?lat=" + lat + "&lon=" + lon + "&apiKey=0900cdcdaedb4b979e78bf54062d0690", requestOptions)
			// Reverse Geocoding API using Geoapify.
				.then(response => response.json())
				.then(result => {
					console.log(result);
					console.log(result.features[0].properties.city)
					var scoreRecord = {
						location: result.features[0].properties.city,
						score: snake.final,
						level: snake.level,
						time: new Date().toLocaleString()
					};
					var records = [];
					try {
                                                // Browser API ( Local Storage )
						var scoreHistory = localStorage.getItem("scores");
                                                
                                                // JSON example
						records = JSON.parse(scoreHistory);
						if (records && records.length) {
							var isAdded = false;
							for (var i = 0; i < records.length; i++) {
								if (snake.final > records[i].score) {
									records.splice(i, 0, scoreRecord);
									isAdded = true;
									break;
								}
							}
							if (records.length < scoreLimit && !isAdded) {
								records.push(scoreRecord);
							}
							if (records.length > scoreLimit) {
								records.length = scoreLimit;
							}
						} else {
							records = [scoreRecord];
						}
					} catch (e) {
						records = [scoreRecord];
						console.log(e)
					}
                                        // Browser API ( Local Storage ) example
					localStorage.setItem("scores", JSON.stringify(records));
					//localStorage.clear();
				})
				.catch(error => console.log('error', error));

		}, function(error) {
			switch (error.code) {
				case error.PERMISSION_DENIED:
					//x.innerHTML="User denied the request for Geolocation."
					break;
				case error.POSITION_UNAVAILABLE:
					//x.innerHTML="Location information is unavailable."
					break;
				case error.TIMEOUT:
					//x.innerHTML="The request to get user location timed out."
					break;
				case error.UNKNOWN_ERROR:
					//x.innerHTML="An unknown error occurred."
					break;
			}
		});
	}

	snake.init();
	module.classList.remove("hidden");
}

// move the snake function
function move() {
	// check if move allowed & then eat food
	meetFood();
	meetBorder();
	meetBody();
	// actually move the snake
	updatePositions();
	renderSnake();
        // DOM example
	document.addEventListener("keydown", turn);
	snake.canTurn = 1;
}

function updatePositions() {
	// remove last snake part (first snake pos)
	boxes[snake.position[0][0] + snake.position[0][1] * table.rowsCols].classList.remove("snake");
	boxes[snake.position[0][0] + snake.position[0][1] * table.rowsCols].classList.remove("head_up");
	boxes[snake.position[0][0] + snake.position[0][1] * table.rowsCols].classList.remove("head_down");
	boxes[snake.position[0][0] + snake.position[0][1] * table.rowsCols].classList.remove("head_right");
	boxes[snake.position[0][0] + snake.position[0][1] * table.rowsCols].classList.remove("head_left");
	snake.position.shift();
	// add new snake part
	var head = snake.position[snake.position.length - 1];
	switch (snake.direction) {
		case "left":
			snake.position.push([head[0] - 1, head[1]]);
			break;
		case "up":
			snake.position.push([head[0], head[1] - 1]);
			break;
		case "right":
			snake.position.push([head[0] + 1, head[1]]);
			break;
		case "down":
			snake.position.push([head[0], head[1] + 1]);
			break;
		default:
			console.log("no direction !");
	}
}

// checks border contact
function meetBorder() {
	var headPos = snake.position.length - 1;
	// goes of limits
	if (((snake.position[headPos][0] === table.rowsCols - 1) && (snake.direction === "right")) || ((snake.position[headPos][0] === 0) && (snake.direction === "left")) || ((snake.position[headPos][1] === table.rowsCols - 1) && (snake.direction === "down")) || ((snake.position[headPos][1] === 0) && (snake.direction === "up"))) {
		// console.log("border hit");
		stop();
	}
}

// checks self contact
function meetBody() {
	var positions = snake.position;
	var headPos = positions.length - 1;
	for (var i = 0; i < headPos; i++) {
		if (positions[headPos].toString() === positions[i].toString()) {
			console.log("snake hit", snake);
			stop();
		}
	}
}

// checks food contact
function meetFood() {
	var head = snake.position[snake.position.length - 1];
	var tail = snake.position[0];
	if (head.toString() === foodPos.toString()) {
		boxes[random].classList.remove("food");
		snake.position.unshift(tail);
		randomGenerateFood();
		snake.food++;
		//snake.score += snake.food;
		snake.score++;
		scoreElt.innerHTML = "Points: " + snake.score;
		// increase speed
		clearInterval(setInt);
		snake.interval = snake.interval - snake.interval / 40;
		setInt = setInterval(function() {
			move();
		}, snake.interval);
	}
}

// JavaScript Fundamentals example
// random 'food'
function randomGenerateFood() {
	var randomX = Math.floor(Math.random() * table.rowsCols);
	var randomY = Math.floor(Math.random() * table.rowsCols);
	random = randomX + randomY * table.rowsCols;
	// picks another foodPos if food pops on snake
	while (boxes[random].classList.contains("snake")) {
		randomX = Math.floor(Math.random() * table.rowsCols);
		randomY = Math.floor(Math.random() * table.rowsCols);
		random = randomX + randomY * table.rowsCols;
	}
	boxes[random].classList.add("food");
	foodPos = [randomX, randomY];
}

// JavaScript Fundamentals example
// read positions and render the snake
function renderSnake() {
	for (var i = 0; i < snake.position.length; i++) {
		boxes[snake.position[i][0] + snake.position[i][1] * table.rowsCols].classList.add("snake");
		boxes[snake.position[i][0] + snake.position[i][1] * table.rowsCols].classList.remove("head_left");
		boxes[snake.position[i][0] + snake.position[i][1] * table.rowsCols].classList.remove("head_right");
		boxes[snake.position[i][0] + snake.position[i][1] * table.rowsCols].classList.remove("head_down");
		boxes[snake.position[i][0] + snake.position[i][1] * table.rowsCols].classList.remove("head_up");
	}
	boxes[snake.position[snake.position.length - 1][0] + snake.position[snake.position.length - 1][1] * table.rowsCols].classList.add("head_" + snake.direction);
}

// keypress handling to turn
function turn(e) {
	if (snake.canTurn) {
		switch (e.keyCode) {
			case 13:
				// document.removeEventListener()
				break;
			case 37: // left
				if (snake.direction === "right") return;
				snake.direction = "left";
				break;
			case 38: // up
				if (snake.direction === "down") return;
				snake.direction = "up";
				break;
			case 39: // right
				if (snake.direction === "left") return;
				snake.direction = "right";
				break;
			case 40: // down
				if (snake.direction === "up") return;
				snake.direction = "down";
				break;
			default:
				console.log("wrong key");
		}
		snake.canTurn = 0;
	}
}

// table creation
function tableCreation() {
	if (snakeTable.innerHTML === "") {
		// main table
		for (var i = 0; i < table.boxes; i++) {
			var divElt = document.createElement("div");
			divElt.classList.add("box");
			snakeTable.appendChild(divElt);
		}
		// status bar
		var statusElt = document.createElement("div");
		statusElt.classList.add("status");
		gameStatus.innerHTML = "";
		gameStatus.appendChild(statusElt);
		scoreElt = document.createElement("span");
		scoreElt.classList.add("score");
		scoreElt.innerHTML = "Points: " + snake.score;
		statusElt.appendChild(scoreElt);
	}
}


/*
Retreive top 10 history.
*/
function getScoreHistory() {

	try {
                // localstorage example;
		var scoreHistory = localStorage.getItem("scores");

		records = JSON.parse(scoreHistory);

		if (records && records.length) {
			var scoreStr = "";
			for (var i = 0; i < records.length; i++) {
				scoreStr += "<div>" + records[i].time + " : " + records[i].score + " - " + (records[i].level ? records[i].level : "Easy") + " - (" + records[i].location + ")" + "</div>";
			}
			historyContainer.innerHTML = scoreStr; // DOM example;
		} else {
			historyContainer.innerHTML = "No Previous Scores."; // DOM example;
		}

	} catch (e) {
		console.log(e)
		historyContainer.innerHTML = "No Previous Scores."; // DOM example;
	}

}



/*
Determine Day time or Night time.
	• Day time 6am to 8pm.
	• Night time: 8pm to 6am.
*/
function isDayTime() {
	const currentDate = new Date();
	const hours = currentDate.getHours();
	const isDay = hours > 6 && hours < 20;
	return isDay;
}



/*
Set background base on user's time.
*/
function setBackgroundStyle() {
	if (isDayTime()) {
		document.body.style.background = "lightgray";   // DOM example;
	} else {
		document.body.style.background = "darkgray";    // DOM example;
	}
}


// jQuery example;
// swipe Showcase
$("document").ready(function() {
	$("body")
		.swipeDetector()
		.on("swipeLeft.sd swipeRight.sd swipeUp.sd swipeDown.sd", function(event) {
			if (event.type === "swipeLeft") {
				if (snake.direction === "right") return;
				snake.direction = "left";
			} else if (event.type === "swipeRight") {
				if (snake.direction === "left") return;
				snake.direction = "right";
			} else if (event.type === "swipeUp") {
				if (snake.direction === "down") return;
				snake.direction = "up";
			} else if (event.type === "swipeDown") {
				if (snake.direction === "up") return;
				snake.direction = "down";
			}
			snake.canTurn = 0;
		});
});

/*
https://gist.github.com/AlexEmashev/ee8302b5036b01362f63dab35948401f
*/
// jQuery example;
(function($) {
	$.fn.swipeDetector = function(options) {
		// States: 0 - no swipe, 1 - swipe started, 2 - swipe released
		var swipeState = 0;
		// Coordinates when swipe started
		var startX = 0;
		var startY = 0;
		// Distance of swipe
		var pixelOffsetX = 0;
		var pixelOffsetY = 0;
		// Target element which should detect swipes.
		var swipeTarget = this;
		var defaultSettings = {
			// Amount of pixels, when swipe don't count.
			swipeThreshold: 30,
			// Flag that indicates that plugin should react only on touch events.
			// Not on mouse events too.
			useOnlyTouch: true
		};
		// Initializer
		(function init() {
			options = $.extend(defaultSettings, options);
			// Support touch and mouse as well.
			swipeTarget.on("mousedown touchstart", swipeStart);
			$("html").on("mouseup touchend", swipeEnd);
			$("html").on("mousemove touchmove", swiping);
		})();

		function swipeStart(event) {
			if (options.useOnlyTouch && !event.originalEvent.touches) return;

			if (event.originalEvent.touches) event = event.originalEvent.touches[0];

			if (swipeState === 0) {
				swipeState = 1;
				startX = event.clientX;
				startY = event.clientY;
			}
		}

		function swipeEnd(event) {
			if (swipeState === 2) {
				swipeState = 0;
				if (
					Math.abs(pixelOffsetX) > Math.abs(pixelOffsetY) &&
					Math.abs(pixelOffsetX) > options.swipeThreshold
				) {

					// Horizontal Swipe
					if (pixelOffsetX < 0) {
						swipeTarget.trigger($.Event("swipeLeft.sd"));
					} else {
						swipeTarget.trigger($.Event("swipeRight.sd"));
					}
				} else if (Math.abs(pixelOffsetY) > options.swipeThreshold) {
					// Vertical swipe
					if (pixelOffsetY < 0) {
						swipeTarget.trigger($.Event("swipeUp.sd"));
					} else {
						swipeTarget.trigger($.Event("swipeDown.sd"));
					}
				}
			}
		}

		function swiping(event) {
			// If swipe don't occuring, do nothing.
			if (swipeState !== 1) return;

			if (event.originalEvent.touches) {
				event = event.originalEvent.touches[0];
			}

			var swipeOffsetX = event.clientX - startX;
			var swipeOffsetY = event.clientY - startY;

			if (
				Math.abs(swipeOffsetX) > options.swipeThreshold ||
				Math.abs(swipeOffsetY) > options.swipeThreshold
			) {
				swipeState = 2;
				pixelOffsetX = swipeOffsetX;
				pixelOffsetY = swipeOffsetY;
			}
		}

		return swipeTarget; // Return element available for chaining.
	};
})(jQuery);



// remove scroll for mobile IOS issue
function preventDefault(e) {
	e.preventDefault();
}

function disableScroll() {
    // DOM example;
	document.body.addEventListener('touchmove', preventDefault, {
		passive: false
	});
}

function enableScroll() {
    // DOM example;
	document.body.removeEventListener('touchmove', preventDefault, {
		passive: false
	});
}

disableScroll();