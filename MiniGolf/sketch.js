let g = [0, 9.8]; // gravitational constant
let density = 0.3;
let t = 0.2;

class Ball {
  constructor(x, y) {
    this.loc = [x, y];
    this.radius = 12; 
    this.color = 0xFFFFFF;
    this.mass = 1;
    this.cor = 0.81 // coefficient of restitution
    this.velocity = [0,0];
    this.forces = [];  // holds all the forces acting on the object 
    this.dragC = 0.5;
  }
  draw() {
    // builds the ball 
    fill(this.color);
    circle(this.loc[0], this.loc[1], this.radius);
  }
  update() {
    this.gravity();  // applies the force of gravity on the ball
    this.drag(); // applies the force of drag
    // F/m = a
    
    var collides = this.isGroundCollision()
    if (collides != -1) {
      this.groundCollision(collides);
    }
    collides = this.isWallCollision()
    if (collides != -1) {
      this.wallCollision(collides);
    }
    this.average();

    this.velocity[0] += this.avg[0]/this.mass * t;
    this.velocity[1] += this.avg[1]/this.mass * t;
    // making time increase in increments of 0.2
    this.loc[0] += this.velocity[0] * t;
    this.loc[1] += this.velocity[1] * t;
    if (this.loc[0] < 0) {
      this.loc[0] = 0
    }
    if (this.loc[0] > width) {
      this.loc[0] = width
    }
    if (this.loc[1] < 0) {
      this.loc[1] = 0;
    }
    
    this.forces = [];
  }
  gravity() {
    this.forces.push([g[0]*this.mass, g[1]*this.mass]);
  }
  drag() {
    var magnitude = density * this.radius * this.radius * 0.5 * Math.PI * this.dragC / 1000;
    var force = [0,0]
    force[0] = -magnitude * this.velocity[0];
    force[1] = -magnitude * this.velocity[1];
    this.forces.push(force);
  }
  average() {
    // finds the average of all the forces, hence the acceleration
    this.avg = [0,0];
    for (var i = 0; i < this.forces.length; i++) {
      this.avg[0] += this.forces[i][0];
      this.avg[1] += this.forces[i][1];
    }

    this.avg[0] /= this.forces.length;
    this.avg[1] /= this.forces.length;
  }
  groundCollision(collides) {
    // assuming all collisions are on flat surfaces for now
    // vf = -k*vi
    this.velocity[0] = this.velocity[0] * this.cor;
    this.velocity[1] = -this.velocity[1] * this.cor;
    var total = 0;
    for (var i = 0; i < this.forces.length; i++) {
      if (levels[cl].grounds[collides].loc[1] > this.loc[1] && this.forces[i][1] > 0)
        total += this.forces[i][1];
      else if (levels[cl].grounds[collides].loc[1] < this.loc[1] && this.forces[i][1] < 0)
        total += this.forces[i][1];
    }
    this.forces.push([0, -total]);
  }
  wallCollision(collides) {
    // assuming all collisions are on flat surfaces for now
    // vf = -k*vi
    this.velocity[0] = -this.velocity[0] * this.cor;
    this.velocity[1] = this.velocity[1] * this.cor;
    var total = 0;
    for (var i = 0; i < this.forces.length; i++) {
      if (levels[cl].walls[collides].loc[0] > this.loc[0] && this.forces[i][0] < 0){
        total += this.forces[i][0];
      }
      else if (levels[cl].walls[collides].loc[0] < this.loc[0] && this.forces[i][0] > 0)
        total += this.forces[i][0];
    }
    this.forces.push([0, -total]);
  }
  isGroundCollision() {
    // checks if a collision has occured
    for (var i = 0; i < levels[cl].grounds.length; i++){
      var DeltaX = this.loc[0] - Math.max(levels[cl].grounds[i].loc[0], Math.min(this.loc[0], levels[cl].grounds[i].loc[0] + levels[cl].grounds[i].width));
      var DeltaY = this.loc[1] - Math.max(levels[cl].grounds[i].loc[1], Math.min(this.loc[1], levels[cl].grounds[i].loc[1] + levels[cl].grounds[i].height));
      if ((DeltaX * DeltaX + DeltaY * DeltaY) <= (this.radius*this.radius)) {
        return i;
      }
    }
    return -1;
  }
  isWallCollision() {
    // checks if a collision has occured
    for (var i = 0; i < levels[cl].walls.length; i++){
      var DeltaX = this.loc[0] - Math.max(levels[cl].walls[i].loc[0], Math.min(this.loc[0], levels[cl].walls[i].loc[0] + levels[cl].walls[i].width));
      var DeltaY = this.loc[1] - Math.max(levels[cl].walls[i].loc[1], Math.min(this.loc[1], levels[cl].walls[i].loc[1] +levels[cl].walls[i].height));
      if ((DeltaX * DeltaX + DeltaY * DeltaY) <= (this.radius*this.radius)) {
        return i;
      }
    }
    return -1;
  }
  hit(x, y) {
    this.forces.push([x, y]);
  }
}

class Ground {
  constructor(x, y, width, height) {
    this.loc = [x, y]  // Top left
    this.width = width;
    this.height = height;
  }
  draw() {
    fill(0, 255, 0);
    stroke(0, 255, 0);
    rect(this.loc[0], this.loc[1], this.width, this.height);
    stroke(0, 0, 0);
  }
}

class Flag {
  constructor(x, y) {
    this.loc = [x, y];
    this.height = 100;
    this.winRange = 30;
  }
  
  draw() {
    fill(0, 0, 0);
    line(this.loc[0], this.loc[1], this.loc[0], this.loc[1] - this.height);
    fill(255,0,0);
    triangle(this.loc[0], this.loc[1] - this.height, this.loc[0], this.loc[1] - this.height + 30, this.loc[0] - 30, this.loc[1] - this.height + 15);
    fill(255, 255, 255);
    rect(this.loc[0] - this.winRange, this.loc[1], this.winRange*2, 10);
  }
  
  isWinner(ballX, ballY) {
    return Math.abs(ballX-this.loc[0]) < this.winRange && this.loc[1] - ballY < this.height && this.loc[1] > ballY;
  }
}

class Level {
  constructor(ball, grounds, walls, flag, par) {
    this.ball = ball;
    this.grounds = grounds;
    this.walls = walls;
    this.flag = flag;
    this.par = par;
    this.hits = 0;
  }
  loop() {
    background(0,255,255);
    this.ball.update();
    this.ball.draw();
    for (var i = 0; i < this.grounds.length; i++) {
      this.grounds[i].draw();
    }
    for (var i = 0; i < this.walls.length; i++) {
      this.walls[i].draw();
    }
    this.flag.draw();
    this.behind();
    if (clickTime == 0) {
      var point = this.direction(30);
    } else {
      var length = (new Date() - clickTime)/4
      var point = this.direction(length < maxForce/5 ? length:maxForce/5);
    }
    line(this.ball.loc[0], this.ball.loc[1], this.ball.loc[0] + point[0], this.ball.loc[1] + point[1]);
    if (this.flag.isWinner(this.ball.loc[0], this.ball.loc[1])) {
      console.log("YAY");
      cl++;
      points += this.par - this.hits;
    }
  }
  
  direction(length) {
    var deltaX = Math.abs(this.ball.loc[0] - mouseX);
    var deltaY = Math.abs(this.ball.loc[1] - mouseY);
    var x = length * Math.cos(Math.atan(deltaY/deltaX)) * (mouseX >= this.ball.loc[0] ? 1:-1);
    var y = length * Math.sin(Math.atan(deltaY/deltaX)) * (mouseY <= this.ball.loc[1] ? -1:1);
    return [x, y];
  }
  
  pressed() {
    clickTime = new Date();
  }
  
  released() {
    var speed = new Date() - clickTime;
    clickTime = 0;
    this.hits++;
    var point = this.direction(speed < maxForce ? speed:maxForce);
    this.ball.hit(point[0], point[1]);
  }
  
  behind() {
    // draws what is always behind every level
    textSize(20);
    fill(0, 0, 0);
    text("hits: " + this.hits + "  par: " + this.par + "  points: " + points, 20, 20);
  }
}

var clickTime = 0;
var maxForce = 1000;
var testLevel = new Level(new Ball(50, 300),
                          [new Ground(0, 0, 0, 10), new Ground(0, 450, 400, 10)],
                          [new Ground(0,0,10,600)],
                          new Flag(40, 590, false),
                          2
                          );
levels = [testLevel];
cl = 4;
points = 0

function setup() {
  createCanvas(700, 600);
  testLevel.grounds[0].loc[1] = height - 10;
  testLevel.grounds[0].width = width;
  levels[1] = new Level(new Ball(10, height - 40),
                        [new Ground(0, height-10, width, 10),
                        new Ground(width/4, height - 90, width/2, 90),
                        new Ground(3*width/8, height - 170, width/4, 170)],
                        [new Ground(width/4, height-90, 1, 90),
                        new Ground(3*width/4, height-90, 1, 90),
                        new Ground(3*width/8, height-170, 1, 170),
                        new Ground(5*width/8, height-170, 1, 170)],
                        new Flag(width - 40, 590),
                        3);
  levels[2] = new Level(new Ball(10, 40),
                        [new Ground(0, height-10, width, 10),
                        new Ground(0, 60, 80, 1),
                        new Ground(200, 500, 100, 1),
                        new Ground(450, 360, 100, 1)],
                        [new Ground(0, 61, 80, 539),
                        new Ground(200, 0, 100, 500),
                        new Ground(450, 362, 100, 529)],
                        new Flag(width - 40, 590),
                        4);
  levels[3] = new Level(new Ball(10, height - 40),
                        [new Ground(0, height-10, width, 10),
                         new Ground(width/4, height-150, width/2, 20),
                         new Ground(0, 330, 120, 20),
                         new Ground(width-120, 330, 120, 20),
                         new Ground(width/4, 198, width/2, 20)],
                        [new Ground(width/2 - 25, 200, 50, height-211), 
                         new Ground(width/4-2, height-150, 1, 20),
                         new Ground(3*width/4+1, height-150, 1, 20),
                         new Ground(120, 330, 1, 20),
                         new Ground(width-122, 330, 1, 20),
                         new Ground(width/4 - 1, 198, 1, 20),
                         new Ground(3*width/4, 198, 1, 20)],
                        new Flag(width - 40, 590),
                        6);
}

function draw() {
  if (cl < 4) {
    levels[cl].loop();
  } else {
    endScreen();
  }
}

function endScreen() {
  background(100, 100, 100);
  textSize(32);  
  fill(255,255,255);
  text("You Scored " + points + " points", 200, 200);
  fill(0,0,0);
  rect(90, 450, 527, 80);
  fill(255,255,255);
  text("click here to try and beat your score", 100, 500);
}

function mouseClicked() {
  if (cl >= 4) {
    if (mouseX > 90 && mouseX < 617 && mouseY > 450 && mouseY < 530) {
      points = 0;
      cl = 0;
    }
  }
}

function mousePressed() {
  if (cl < 4) {
    levels[cl].pressed();
  }
}

function mouseReleased() {
  if (cl < 4) {
    levels[cl].released();
  }
}