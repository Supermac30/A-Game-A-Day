let linesX = [];
let linesY = [];
let filled = [];
let turn = 0;

function behind() {
  // draws everything behind the scene
  fill(255,255,255);
  for (var i = 25; i < width; i+= 50) {
    for (var j = 25; j < height; j+= 50) {
      circle(i, j, 10);
    }
  }
  textSize(25);
  fill(0);
  for (var i = 50; i < width; i += 50) {
    for (var j = 50; j < height; j += 50) {
      if (filled[i/50 - 1][j/50 - 1] > -1) {
        if (filled[i/50 - 1][j/50 - 1] == 0) {
          text("P", i - 10, j + 8);
        } else {
          text("E", i - 10, j + 8);
        }
      }
    }
  }
}

function lines() {
  // draws the lines
  for (var i = 0; i < linesX.length; i++) {
    for (var j = 0; j < linesX[i].length; j++) {
      if (linesX[i][j]) {
        line(25+50*i, 25+50*j,75+50*i, 25+50*j); 
      }
    }
  }
  for (var i = 0; i < linesY.length; i++) {
    for (var j = 0; j < linesY[i].length; j++) {
      if (linesY[i][j]) {
        line(25+50*i, 25+50*j,25+50*i, 75+50*j); 
      }
    }
  }
}

function setup() {
  createCanvas(400, 400);
  var temp0 = [];
  var temp1 = [];
    for (var j = 0; j < 8; j++) {
      temp0.push(false);
      temp1.push(-1);
    }
  for (var i = 0; i < 7; i++) {
    linesX.push(temp0.slice());
    linesY.push(temp0.slice());
    filled.push(temp1.slice());
  }
  linesY.push(temp0.slice());
}

function draw() {
  background(255);
  behind();
  lines();
  if (gameover(linesX, linesY)) {
    value = evalPos(filled);
    textSize(32);
    fill(100,100,100);
    if (value < 0) {
      text("You win", 100, 200);
    } else if (value > 0) {
      text("You lose", 100, 200);
    } else {
      text("Tie", 100, 200);
    }
  }
  if (turn == 1) {
    var newBoard = minimax(linesX, linesY, filled, 2, true, -2000, 2000);
    if (isDiff2D(filled, newBoard[3])) {
      turn = 1;
    } else {
      turn = 0;
    }
    console.log(turn);
    linesX = newBoard[1];
    linesY = newBoard[2];
    filled = newBoard[3];
  }
}

function gameover(lineX, lineY) {
  for (var i = 0; i < lineX.length; i++) {
    for (var j = 0; j < lineX[i].length; j++) {
      if (!lineX[i][j]) {
        return false;
      }
    }
  }
  for (var i = 0; i < lineY.length; i++) {
    for (var j = 0; j < 7; j++) {
      if (!lineY[i][j]) {
        return false;
      }
    }
  }
  return true;
}

function evalPos(fill) {
  var enemy = 0;
  var player = 0;
  for (var i = 0; i < fill.length; i++) {
    for (var j = 0; j < fill[i].length; j++) {
      if (fill[i][j] == 0) {
        player++;
      } else if (fill[i][j] == 1) {
        enemy++;
      }
    }
  }
  return enemy - player;
}

function copy2D(arr) {
  var newArr = [];
  for (var i = 0; i < arr.length; i++) {
    newArr.push(arr[i].slice());
  }
  return newArr;
}

function addbox(x, y, fill, lineX, lineY, turn) {
  // adds a box if necissary
  if (lineX[x].length <= y+1 || lineY.length <= x+1) {
    return [fill, false];
  }
  if (fill[x][y] == -1 && lineX[x][y] && lineX[x][y+1] && lineY[x][y] && lineY[x+1][y]){
    fill[x][y] = turn;
    return [fill, true];
  }
  return [fill, false];
}

function fixfill(fill, lineX, lineY, turn) {
  for (var i = 0; i < fill.length; i++) {
    for (var j = 0; j < fill[i].length; j++) {
      fill = addbox(i, j, fill, lineX, lineY, turn)[0];
    }
  }
  return fill;
}

function isDiff2D(arr0, arr1) {
  for (var i = 0; i < arr0.length; i++) {
    for (var j = 0; j < arr1.length; j++) {
      if (arr0[i][j] != arr1[i][j]) {
        return true;
      }
    }
  }
  return false;
}

function genPos(lineX, lineY, fill, turn) {
  var pos = [];
  for (var i = 0; i < lineX.length; i++) {
    for (var j = 0; j < lineX[i].length; j++) {
      if (!lineX[i][j]) {
        lineX[i][j] = true;
        var oldFill = copy2D(fill);
        fill = fixfill(fill, lineX, lineY, turn);
        var changed = isDiff2D(fill, oldFill);
        pos.push([copy2D(lineX), copy2D(lineY), copy2D(fill), changed]);
        fill = copy2D(oldFill);
        lineX[i][j] = false;
      }
    }
  }
  for (var i = 0; i < lineY.length; i++) {
    for (var j = 0; j < 7; j++) {
      if (!lineY[i][j]) {
        lineY[i][j] = true;
        var oldFill = copy2D(fill);
        fill = fixfill(fill, lineX, lineY, turn);
        var changed = isDiff2D(fill, oldFill);
        pos.push([copy2D(lineX), copy2D(lineY), copy2D(fill), changed]);
        fill = copy2D(oldFill);
        lineY[i][j] = false;
      }
    }
  }
  return pos;
}

function minimax(lineX, lineY, fill, depth, isMax, alpha, beta) {
  if (gameover(lineX, lineY) || depth == 0) {
    return [evalPos(fill), lineX, lineY, fill];
  }
  if (isMax) {
    var maxEval = [-2000, [], [], []];
    var poss = genPos(lineX, lineY, fill, 1);
    for (var i = 0; i < poss.length; i++) {
      if (poss[i][3]) {
        isMax = !isMax;
      }
      var value = minimax(poss[i][0], poss[i][1], poss[i][2], depth-1, !isMax, alpha, beta)
      if (maxEval[0] < value[0]) {
        maxEval = [value[0], poss[i][0], poss[i][1], poss[i][2]];
      } 
      alpha = Math.max(alpha, value[0]);
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else {
    var minEval = [2000, [], [], []];
    var poss = genPos(lineX, lineY, fill, 0);
    for (var i = 0; i < poss.length; i++) {
      if (poss[i][3]) {
        isMax = !isMax;
      }
      var value = minimax(poss[i][0], poss[i][1], poss[i][2], depth-1, !isMax, alpha, beta)
      if (minEval[0] > value[0]) {
        minEval = [value[0], poss[i][0], poss[i][1], poss[i][2]];
      } 
      beta = Math.min(beta, value[0]);
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
}

function mouseClicked() {
  if (turn == 0) {
    var xloc = mouseX-25;
    var yloc = mouseY-25;
    if (xloc%50 < 10 || 50 - xloc%50 < 10) {
      var x = Math.round(xloc/50);
      var y = Math.floor(yloc/50);
      if (!linesY[x][y]) {
        turn = ++turn%2;
      }
      linesY[x][y] = true;
      
    }
    else if (yloc%50 < 10 || 50 - yloc%50 < 10) {
      var x = Math.floor(xloc/50);
      var y = Math.round(yloc/50);
      if (!linesX[x][y]) {
        turn = ++turn%2;
      }
      linesX[x][y] = true;
    }
    var oldFilled = copy2D(filled);
    filled = fixfill(filled, linesX, linesY, 0)
    if (isDiff2D(oldFilled, filled)) {
      turn = 0;
    }
  }
}