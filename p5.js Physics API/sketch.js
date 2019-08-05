let g = [0, 9.8]; // gravitational constant
let density = 0.5;
let t = 0.2;

let apply = 400;

class Ball {
  constructor(x, y) {
    this.loc = [x, y];
    this.radius = 20; 
    this.color = 0xFFFFFF;
    this.mass = 1;
    this.cor = 0.89; // coefficient of restitution
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
      if (grounds[collides].loc[1] > this.loc[1] && this.forces[i][1] > 0)
        total += this.forces[i][1];
      else if (grounds[collides].loc[1] < this.loc[1] && this.forces[i][1] < 0)
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
      if (walls[collides].loc[0] > this.loc[0] && this.forces[i][0] < 0){
        total += this.forces[i][0];
      }
      else if (walls[collides].loc[0] < this.loc[0] && this.forces[i][0] > 0)
        total += this.forces[i][0];
    }
    this.forces.push([0, -total]);
  }
  isGroundCollision() {
    // checks if a collision has occured
    for (var i = 0; i < grounds.length; i++){
      var DeltaX = this.loc[0] - Math.max(grounds[i].loc[0], Math.min(this.loc[0], grounds[i].loc[0] + grounds[i].width));
      var DeltaY = this.loc[1] - Math.max(grounds[i].loc[1], Math.min(this.loc[1], grounds[i].loc[1] + grounds[i].height));
      if ((DeltaX * DeltaX + DeltaY * DeltaY) <= (this.radius*this.radius)) {
        return i;
      }
    }
    return -1;
  }
  isWallCollision() {
    // checks if a collision has occured
    for (var i = 0; i < walls.length; i++){
      var DeltaX = this.loc[0] - Math.max(walls[i].loc[0], Math.min(this.loc[0], walls[i].loc[0] + walls[i].width));
      var DeltaY = this.loc[1] - Math.max(walls[i].loc[1], Math.min(this.loc[1], walls[i].loc[1] + walls[i].height));
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
    this.color = 0x000000;
  }
  draw() {
    fill(this.color);
    rect(this.loc[0], this.loc[1], this.width, this.height);
  }
}

let ball = new Ball(100, 200);
let grounds = [new Ground(0, 500, 1000, 50), new Ground(0,0,1000,10)];
let walls = [new Ground(0,0,10,1000), new Ground(0,0,10,1000)]

function setup() {
  createCanvas(550, 450);
  frameRate(60);
  grounds[0].loc[1] = height-50;
  walls[1].loc[0] = width - 10;
}

function draw() {
  background(220);
  ball.update();
  ball.draw();
  for (var i = 0; i < grounds.length; i++){
    grounds[i].draw();
  }
  for (var i = 0; i < walls.length; i++){
    walls[i].draw();
  }
  textSize(16)
  // all units are standard
  var start = 10
  text("x: " + round(ball.loc[0]*100) /100, 20, start + 20);
  text("y: " + -1 * round(ball.loc[1]*100)/100, 20, start + 40);
  text("vx: " + round(ball.velocity[0]*100)/100, 20, start + 60);
  text("vy: " + -1 * round(ball.velocity[1]*100)/100, 20, start + 80);
  text("ax: " + round(ball.avg[0]*100)/100, 20, start + 100);
  text("ay: " + round(ball.avg[1]*100)/100, 20, start + 120);
  text("mass: " + ball.mass, 20, start + 140);
  text("coefficient of restitution: " + ball.cor, 20, start + 160);
  text("force of gravity " + g, 20, start + 180);
  text("density of air: " + density, 20, start + 200);
}

function keyPressed(){
  if (key == "w") {
    ball.hit(0,-apply);
  }
  if (key == "a") {
    ball.hit(-apply, 0);
  }
  if (key == "s") {
    ball.hit(0,apply);
  }
  if (key == "d") {
    ball.hit(apply,0);
  }
}