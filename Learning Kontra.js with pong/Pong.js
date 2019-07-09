let mvSpeed = 5;
let ballSpeedx = 2 * Math.random() - 4;
let ballSpeedy = 2 * Math.random() - 4;
let speedIncrease = 0.2;
let playerPoints = 0;
let enemyPoints = 0;
kontra.init();

var paddle = kontra.sprite({
    x: 0, // starting x,y position of the sprite
    y: 0,
    color: '#FFFFFF', // fill color of the sprite rectangle
    width: 20, // width and height of the sprite rectangle
    height: 100,
    update() {
        if (kontra.keys.pressed('up')) {
            this.y -= mvSpeed;
        }
        if (kontra.keys.pressed('down')) {
            this.y += mvSpeed;
        }
        if (this.y < 0) {
            this.y = 0;
        } else if (this.y > kontra.canvas.height - this.height) {
            this.y = kontra.canvas.height - this.height
        }
    }
});

var enemy = kontra.sprite({
    x: kontra.canvas.width - 20, // starting x,y position of the sprite
    y: 80,
    color: '#FFFFFF', // fill color of the sprite rectangle
    width: 20, // width and height of the sprite rectangle
    height: 100,
    update() {
		if (this.y + this.height/2 > ball.y){
			if (this.y + this.height/2 - ball.y > mvSpeed - 2){
			    this.y -= mvSpeed;
			}
			else{
				this.y = ball.y - this.height/2;
			}
		} else { 
			if (ball.y - this.y + this.height/2 > mvSpeed - 2){
			    this.y += mvSpeed;
			}
			else{
				this.y = ball.y - this.height/2;
			}
		}
        if (this.y < 0) {
            this.y = 0;
        } else if (this.y > kontra.canvas.height - this.height) {
            this.y = kontra.canvas.height - this.height;
        }
    }
})

var background = kontra.sprite({
	render() {
		this.context.fillStyle = '#FFFFFF';
		this.context.beginPath();
		this.context.text();
		this.context.fill();
	}
})

var ball = kontra.sprite({
    x: kontra.canvas.width / 2,
    y: kontra.canvas.height / 2,
    color: '#FFFFFF',
    radius: 10,
    render() {
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();
    },
    update() {
        this.x += ballSpeedx;
        this.y += ballSpeedy;
        if (this.collidesWith(paddle) || this.collidesWith(enemy)) {
            ballSpeedx *= -1;
            ballSpeedx += ballSpeedx > 0 ? speedIncrease : -speedIncrease;
            ballSpeedy += ballSpeedy > 0 ? speedIncrease : -speedIncrease;
        }
        if (this.y > kontra.canvas.height - this.radius) {
            ballSpeedy *= -1;
        }
		if (this.y < this.radius) {
            ballSpeedy *= -1;
        }
		
		if (this.x < 0) {
			ballSpeedx = 2 * Math.random() - 4;
            ballSpeedy = 2 * Math.random() - 4;
			this.x = kontra.canvas.width / 2;
            this.y = kontra.canvas.height / 2;
			enemyPoints++;
		}
		if (this.x > kontra.canvas.width) {
			ballSpeedx = 2 * Math.random() - 4;
            ballSpeedy = 2 * Math.random() - 4;
			this.x = kontra.canvas.width / 2;
            this.y = kontra.canvas.height / 2;
			playerPoints++;
		}
    }
})

function fixScore(){
	document.getElementById("enemyPoints").innerHTML = "Enemy: " + enemyPoints;
	document.getElementById("playerPoints").innerHTML = "You: " + playerPoints;
}

var loop = kontra.gameLoop({ // create the main game loop
    render() { // render the game state
        paddle.render();
        ball.render();
        enemy.render();
    },
    update() { // update the game state
        paddle.update();
        ball.update();
        enemy.update()
		fixScore();
    }
});

loop.start(); // start the game