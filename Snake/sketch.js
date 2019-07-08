let bw = 20;
let speed = 5;
let screen = 0;
let takeInp = true;
let snake = new Snake();
let food = new Food();

function setup() {
  createCanvas(400, 400);
  food.initialise();
}

function drawGrid() {
  fill(0, 0, 0);
  for (let i = 0; i < width; i += bw) {
    line(0, i, width, i);
  }
  for (let i = 0; i < height; i += bw) {
    line(i, 0, i, height);
  }
}

function draw() {
  background(220);
  fill(0,0,255);
  textSize(20);
  text("points: " + snake.length,0,20);
  switch (screen) {
    case 0:
      game();
      break;
    case 1:
      gameOver();
      break;
  }
}

function inp() {
  if (takeInp) {
    if (keyCode == UP_ARROW && snake.dir[1] != 1) {
      snake.dir = [0, -1];
      takeInp = false;
    }
    if (keyCode == DOWN_ARROW && snake.dir[1] != -1) {
      snake.dir = [0, 1];
      takeInp = false;
    }
    if (keyCode == LEFT_ARROW && snake.dir[0] != 1) {
      snake.dir = [-1, 0];
      takeInp = false;
    }
    if (keyCode == RIGHT_ARROW && snake.dir[0] != -1) {
      snake.dir = [1, 0];
      takeInp = false;
    }
  }
  if (key == "r") {
    screen = 0;
  }
}

function game() {
  if (frameCount % speed == 0) {
    snake.move();
    snake.eat();
    if (snake.isDead()) {
      snake = new Snake();
      screen = 1;
    }
    takeInp = true;
  }
  drawGrid();
  inp();
  snake.buildSnake();
  food.buildFood();
}

function gameOver() {
  inp();
  fill(0, 0, 0);
  rect(0, 0, 1000, 100);
  fill(0, 0, 255);
  textSize(15);
  text("Game Over. Press r to restart", 100, 50);
}

function Snake() {
  this.body = [[0, 1, [0, 0]]];
  this.length = 0;
  this.dir = [0, 0];
  
  this.buildSnake = function() {
    for (let i = 0; i < this.body.length; i++) {
      rect(this.body[i][0] * bw, this.body[i][1] * bw, bw, bw);
    }

  }
  
  this.move = function() {
    for (let i = 0; i < this.body.length; i++) {
      this.body[i][0] += this.body[i][2][0];
      this.body[i][1] += this.body[i][2][1];
    }
    for (let i = this.body.length - 1; i > 0; i--) {
      this.body[i][2] = this.body[i - 1][2];
    }
    this.body[0][2] = this.dir;
  }

  this.didEat = function() {
    if (food.posx == this.body[0][0] && food.posy == this.body[0][1]) {
      return true;
    }
  }

  this.eat = function() {
    if (this.didEat()) {
      var newposx = this.body[this.length][0] - this.body[this.length][2][0];
      var newposy = this.body[this.length][1] - this.body[this.length][2][1];
      this.body.push([newposx, newposy, this.body[this.length][2]]);
      food.initialise();
      this.length++;
    }
  }

  this.isDead = function() {
    this.unique = new Map();
    for (let i = 0; i < this.body.length; i++) {
      if (this.unique.has(this.body[i][0] + " " + this.body[i][1])) {
        return true;
      } else {
        this.unique.set(this.body[i][0] + " " + this.body[i][1]);
      }

      if (this.body[0][0] < 0 || this.body[0][0] >= width / bw) {
        return true;
      }
      if (this.body[0][1] < 0 || this.body[0][1] >= height / bw) {
        return true;
      }
    }
    return false;
  }
}

function Food() {
  this.posx = 0;
  this.posy = 0;
  this.initialise = function() {
    this.posy = Math.floor(random(0, height / bw));
    this.posx = Math.floor(random(0, width / bw));
  }
  this.buildFood = function() {
    fill(0, 230, 0);
    rect(this.posx * bw, this.posy * bw, bw, bw);
  }
}