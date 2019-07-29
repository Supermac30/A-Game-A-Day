let bw = 20;
let speed = 5;
let screen = 0;
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
  if (lastPressed == 0 || keyCode == UP_ARROW && snake.dir[1] != 1) {
    snake.dir = [0, -1];
  }
  else if (lastPressed == 1 || keyCode == DOWN_ARROW && snake.dir[1] != -1) {
    snake.dir = [0, 1];
  }
  else if (lastPressed == 2 || keyCode == LEFT_ARROW && snake.dir[0] != 1) {
    snake.dir = [-1, 0];
  }
  else if (lastPressed == 3 || keyCode == RIGHT_ARROW && snake.dir[0] != -1) {
    snake.dir = [1, 0];
  }

  if (key == "r") {
    screen = 0;
    lastPressed = -1;
    snake = new Snake();
  }
}

var lastPressed = -1; //0 - up  1 - down  2 - left  3 - right
function mouseClicked() {
  if (mouseX > fp[0] + 20  && snake.dir[0] != 1) {
    lastPressed = 3;
  }
  else if (mouseX < fp[0] - 20 && snake.dir[0] != -1) {
    lastPressed = 2;
  }
  else if (mouseY > fp[1] + 20 && snake.dir[1] != 1) {
    lastPressed = 1;
  }
  else if (mouseY < fp[1] - 20 && snake.dir[1] != -1) {
    lastPressed = 0;
  }
}

function game() {
  if (frameCount % speed == 0) {
    snake.move();
    snake.eat();
    if (snake.isDead()) {
      screen = 1;
    }
  }
  drawGrid();
  inp();
  snake.buildSnake();
  food.buildFood();
}

var fp = [] // holds the x,y loc of the first location pressed
function mousePressed() {
  fp = [mouseX, mouseY];
}

function gameOver() {
  inp();
  fill(0, 0, 0);
  rect(0, 0, 1000, 100);
  fill(0, 0, 255);
  textSize(15);
  text("Game Over. Press R to restart.\nYou ended with " + snake.length + " points.", 100, 50);
}

function Snake() {
  this.body = [[10, 10, [0, 0]]];
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