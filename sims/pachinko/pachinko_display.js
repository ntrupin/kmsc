var canvas = document.getElementById("canvas");
canvas.style.background = "white";
var ctx = canvas.getContext("2d");
var numberOfRows = 10;
var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
var scale = (0.75*h)/(numberOfRows+3);
// var scaleX = 0.6 * scale;
// var scaleY = 1.2 * scale;
var scaleX = 1.42 * scale;
var scaleY = 1.27 * scale;
canvas.width =  (1 + numberOfRows) * scaleX * 2;
canvas.height = (2 + numberOfRows + 1) * scaleY;
var midCanvasX = canvas.width / 2;
var intervalCreateBall = 10;
var numberOfBalls = 1000;
var releaseTime = numberOfBalls * intervalCreateBall;
var rectangleRow = numberOfRows + 1;
var binHeightScale = 1;

var pi = Math.PI;
var ballRadius = 0.6 * scale;
var bias = (Math.ceil(Math.random()*20)/20);


document.getElementById("bias").innerHTML = bias;
var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

var platformRadius = 0.1 * scale;
var tMax = 700;
var tInterval = 20;
var old_tInterval = tInterval;

// var rectangleX = midCanvasX - scaleX * (rectangleRow - 1);
var rectangleY = scaleY * rectangleRow;
var rectangleWidth = scaleX;
var rectangleHeight = canvas.height - (rectangleY - platformRadius);

var ballArray = [];
var binArray = [];
for (var i = 0; i < numberOfRows + 1; i++){
	binArray[i] = 0;
}

var createBallInterval = 300;
setTimeout( createBall, createBallInterval );
var intervalID = setInterval(refresh, tInterval);

function releaseGroup(numberOfBalls){
	//Loop to create multiple balls
	for (var i = 0; i < numberOfBalls; i++) {
		/*setTimeout(createBall, intervalCreateBall*i);*/
		createBall();
	}
}

function play() {
	clearInterval(intervalID);
	intervalID = setInterval(refresh, tInterval);
}

function pause() {
	clearInterval(intervalID);
}

//Decrease bias
function decreaseBias() {
	bias -= 0.05;
	bias = Number(bias.toFixed(2));
	if (bias < 0){
		bias = 0; 
	} else {
//	bias = bias.toFixed(2);
		document.getElementById("bias").innerHTML = bias.toFixed(2);
	}
}

//Increase bias
function increaseBias() {
	bias += 0.05;
	bias = Number(bias.toFixed(2));
	if (bias > 1){
		bias = 1; 
	} else {
		document.getElementById("bias").innerHTML = bias.toFixed(2);
	}
}


function createBall() {
	if ( ballArray.length <= 100 ) {
		ballArray.push( new Ball() );
	}
	// keV: reduce lag on display by dynamically slowing creation of new balls
	if ( ballArray.length <= 4 ) {
		setTimeout(createBall, createBallInterval);
	} else {
		var delaySpawn = 0.6 + ballArray.length/10;
		setTimeout(createBall, createBallInterval/**delaySpawn*/);
	}
}

function refresh() {
	// canvas.width = canvas.width;
	// keV: online suggestion indicated this method for clearing is faster
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < ballArray.length; i++){
		drawBall( ballArray[i] );
	}
		drawPlatforms();
}

function Ball() {
	this.radius = ballRadius;

	this.x0 = midCanvasX;
	this.x = this.x0;
	this.y0 = 0 * scaleY  - this.radius - platformRadius;
	this.y = this.y0;

	this.vx0 = scaleX * tInterval / tMax;
	this.vx = 0;
	this.vy0 = 0.1;
	this.vy = this.vy0;

	this.g = 2 * (scaleY + this.vy0 * tMax) / (tMax * tMax);

	this.t = 0;
	this.bounceNumber = 0;
}

//draw balls
function drawBall(ball) {
	if (ball.t >= tMax ) { // end of cycle
		ball.bounceNumber += 1;
		if (ball.bounceNumber > numberOfRows) {
			// stop bounce
			ball.vx = 0;
			var ballOnBinX = Math.round(ball.x);
			//	console.log("ballOnBinX " + ballOnBinX);
			if (ball.y + ball.radius > canvas.height) {
				ballArray.shift();
				var binNumber = Math.round((ballOnBinX - midCanvasX + numberOfRows * scaleX)/(2 * scaleX));
				binArray[binNumber] += 1;
				// binSum += 1;
				if(binArray[binNumber] * binHeightScale >= rectangleHeight){
					binHeightScale *= 0.5;
				}
			}
		} else {
			// bounce
			ball.t = 0;
			ball.y0 += scaleY;
			if (Math.random() < bias) {
				ball.vx = ball.vx0;
			} else {
				ball.vx = -1 * ball.vx0;
			}
		}
	}
	moveBall(ball);
	ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * pi, true);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
}

//move Balls
function moveBall(ball) {
	ball.t += tInterval;
	//Movement in X  
	ball.x += ball.vx;
	//Movement in Y
	ball.y = ball.y0 - ball.vy0 * ball.t + (ball.g * ball.t * ball.t)/2;
}

//Draw lines
function drawPlatforms() {
	for (var row = 1; row <= numberOfRows; row++) {
		var platformX = midCanvasX - scaleX * (row - 1);
		var platformY = scaleY * row;
		for (var column = 0; column < row; column++) {
			ctx.beginPath();
    		ctx.arc(platformX, platformY, platformRadius, 0, 2 * pi, true);
    		ctx.strokeStyle = "black";
    		ctx.stroke();
			platformX = platformX + ( 2 * scaleX );
		}
	}
	rectangleX = midCanvasX - scaleX * (rectangleRow - 1);
	// var rectangleY = scaleY * rectangleRow;
	// var rectangleWidth = scaleX;
	// var rectangleHeight = canvas.height - (rectangleY - platformRadius);

	for (var column = 0; column <= rectangleRow; column++) {
		//
		//var binHeight = 2 * binArray[column] / binSum * rectangleHeight; 
		var binHeight = binArray[column] * binHeightScale;
		ctx.beginPath();
		ctx.fillStyle = "darkred";
		ctx.fillRect(rectangleX - rectangleWidth / 2, canvas.height - binHeight, rectangleWidth, binHeight);
		// 
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.rect(rectangleX - scaleX - rectangleWidth / 2, rectangleY - platformRadius, rectangleWidth, rectangleHeight);
		ctx.stroke();
//		rectangleX = rectangleX + ( 2 * scaleX );
		ctx.beginPath();
		ctx.fillStyle = "lightgray";
		ctx.fillRect(rectangleX - scaleX - rectangleWidth / 2, rectangleY - platformRadius, rectangleWidth, rectangleHeight);
		rectangleX = rectangleX + ( 2 * scaleX );

	}
}

play();

window.receive(data => {
	if (data == "inc") {
		increaseBias();
	} else if (data == "dec") {
		decreaseBias();
	} else if (data == "dump") {
		releaseGroup(100);
	} else if (data == "clear") {
		binArray.fill(0);
	}
});