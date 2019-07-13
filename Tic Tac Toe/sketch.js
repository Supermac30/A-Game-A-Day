let grid = new Grid();
let mode = 0;
let turn = 1;
function setup() {
  createCanvas(300, 350);
  grid.initialise();
}

function draw() {
  background(220);
  grid.buildGrid();
  fill(0,0,0);
  modeButton();
  if (turn == 0) {
    grid.compAdd(minimax(grid.pos, false, 0)[1]);
    turn = ++turn % 2;
  }
  textSize(50);
  if (grid.checkWinner() == 1) {
    text("X wins", 100, 150);
  } else if (grid.checkWinner() == 2) {
    text("O wins", 100, 150);
  } else if (grid.checkWinner() == 3) {
    text("Tie", 100, 150);
  }
}

function modeButton() {
  textSize(20);
  if (mode == 0) {
    text("On Easy mode, click to change", 12, 330);
  }
  if (mode == 1) {
    text("On Hard mode, click to change", 12, 330);
  }
}

function minimax(pos, min, depth) {
  var test = new Grid();
  test.pos = pos;
  var state = test.checkWinner();
  if (state == 1) {
    return [10, pos];
  } else if (state == 2) {
    return [-10, pos];
  } else if (state == 3) {
    return [0, pos];
  }
  if (!min) {
    var answer;
    var posSpace = createPosSpace(pos, 1);
    var largest = [-100, []];
    for (var i = 0; i < posSpace.length; i++) {
      answer = minimax(posSpace[i], true, depth+1)[0] - 0.1 * depth
      if (answer > largest[0]) {
        largest = [answer, posSpace[i]];
      }
    }
    return largest;
  } else {
    var answer;
    var posSpace = createPosSpace(pos, 2);
    var smallest = [100, []];
    for (var i = 0; i < posSpace.length; i++) {
      answer = minimax(posSpace[i], false, depth+1)[0] + 0.1*depth
      if (answer < smallest[0]) {
        smallest = [answer, posSpace[i]];
      }
    }
    return smallest;
  }
}

function createPosSpace(pos, player) {
  var posSpace = [];
  var check = copy2d(pos);
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      if (check[i][j] == 0) {
        check[i][j] = player;
        posSpace.push(copy2d(check));
        check[i][j] = 0;
      }
    }
  }
  return posSpace;
}

function copy2d(pos){
  var copy = [];
  for (var i = 0; i < pos.length; i++) {
    copy.push(pos[i].slice());
  }
  return copy;
}

function mouseClicked() {
  if (turn == 1){
    if (grid.playerAdd()){
      turn = ++turn % 2;
    }
  }
  if (mouseY > 300) {
    mode = ++mode % 2;
    grid = new Grid();
    turn = mode == 1 ? 0:1;
    grid.initialise();
  }
}

function keyPressed() {
  if (key == 'r') {
    grid = new Grid();
    grid.initialise();
    turn = mode == 1 ? 0:1;
  }
}

function Grid(){
  this.pos = [[0, 0, 0],
              [0, 0, 0],
              [0, 0, 0]];
  this.squares = []
  
  this.initialise = function() {
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
      this.squares.push(new Square(j*100, i*100));
      }
    }
    if (mode == 0){
      i = Math.floor(3 * Math.random());
      j = Math.floor(3 * Math.random());
      this.pos[i][j] = 1;
      this.squares[i*3+j].filled = 1;
    }
  }
  
  this.checkWinner = function() {
    for (var i = 0; i < 3; i++){
      if (this.pos[i][1] == 1 && this.pos[i][2] == 1 && this.pos[i][0] == 1){
        return 1;
      } else if (this.pos[i][1] == 2 && this.pos[i][2] == 2 && this.pos[i][0] == 2) {
        return 2;
      } else if (this.pos[1][i] == 1 && this.pos[2][i] == 1 && this.pos[0][i] == 1){
        return 1;
      } else if (this.pos[1][i] == 2 && this.pos[2][i] == 2 && this.pos[0][i] == 2) {
        return 2;
      }
    } 
    if (this.pos[0][0] == 1 && this.pos[1][1] == 1 && this.pos[2][2] == 1){
      return 1;
    } else if (this.pos[0][2] == 1 && this.pos[1][1] == 1 && this.pos[2][0] == 1){
      return 1;
    } else if (this.pos[0][0] == 2 && this.pos[1][1] == 2 && this.pos[2][2] == 2){
      return 2;
    } else if (this.pos[0][2] == 2 && this.pos[1][1] == 2 && this.pos[2][0] == 2){
      return 2;
    }
    var allnot0 = true;
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        if (this.pos[i][j] == 0) {
          allnot0 = false;
          break;
        } 
      }
    }
    if (allnot0) {
      return 3;
    }
  }

  this.buildGrid = function() {
    for (var i = 0; i < 9; i++) {
      this.squares[i].build();
    }
  }
  
  this.playerAdd = function() {
    for (var i = 0; i < 9; i++) {
      if (this.squares[i].isPressed() && this.squares[i].filled == 0) {
        this.pos[Math.floor(i/3)][i%3] = 2;
        this.squares[i].filled = 2;
        return true;
      }
    }
    return false;
  }
  
  this.compAdd = function(pos) {
    this.pos = pos;
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        this.squares[3*i+j].filled = this.pos[i][j];
      }
    }
  }
} 

function Square(x, y){
  this.x = x;
  this.y = y;
  this.filled = 0
  this.build = function() {
    fill(255,255,255);
    square(this.x, this.y, 100);
    textSize(100)
    fill(255,99,71)
    if (this.filled == 1) {
      text("X", this.x + 15, this.y + 90);
    }
    else if (this.filled == 2) {
      text("O", this.x + 15, this.y + 90);
    }
  }
  this.isPressed = function(){
    return mouseX > this.x && mouseX < this.x + 100 && mouseY > this.y && mouseY < this.y + 100;
  }
}