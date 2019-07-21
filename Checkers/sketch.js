class Board {
  constructor(turn){
    this.pieces = [];
    this.initialise();
    this.turn = turn;
  }
  initialise() {
    //builds the pieces at the right spot in the beginning
    for (var i = 1; i < 4; i++){
      for (var j = i%2 + 1; j < 9; j += 2) {
        this.pieces.push(new Piece(j+""+i, true));
      }
    }
    for (var i = 6; i < 9; i++){
      for (var j = i%2 + 1; j < 9; j += 2) {
        this.pieces.push(new Piece(j+""+i, false));
      }
    }
  }
  
  build() {
    //builds the back of the board
    var counter = 0
    for (var i = 0; i < 400; i+=50) {
      for (var j = 0; j < 400; j += 50) {
        if (++counter % 2 == 0){
          fill(200,200,200);
        } else  {
          fill(255,255,255);
        }
        if (Math.floor(lastClicked/10)*50 == i + 50 && lastClicked%10*50 == j + 50) { // highlights clicked square
          fill(0,255,0);
        }
        square(i,j,50);
      }
      counter++;
    }
    
    //builds the pieces
    for (var i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i] != undefined)
      this.pieces[i].build();
    }
  }
  
  copy(board) {
    //given a Board object makes a copy
    this.pieces = [];
    for (var i = 0; i < board.pieces.length; i++) {
      if (board.pieces[i] != undefined){
        this.pieces.push(new Piece());
        this.pieces[this.pieces.length-1].loc = board.pieces[i].loc;
        this.pieces[this.pieces.length-1].isKing = board.pieces[i].isKing;
        this.pieces[this.pieces.length-1].isBlack = board.pieces[i].isBlack;
      }
    }
  }
  
  isBound(pos) {
    var posx = Math.floor(pos/10);
    var posy = pos%10;
    return posx <= 8 && posx >= 1 && posy <= 8 && posy >= 0;
  }
  
  move(pos0, pos1) {
    var pieceNum = this.findPiece(pos0);
    if (pieceNum != -1 && this.isBound(pos1)) {
      if (1 == this.turn && this.pieces[pieceNum].isBlack || 0 == this.turn && !this.pieces[pieceNum].isBlack) {
        if (this.isValid(pieceNum, pos1)) {
          this.pieces[pieceNum].loc = pos1;
          this.turn = (this.turn + 1) % 2;
          if (this.pieces[pieceNum].loc % 10 == 8 && this.pieces[pieceNum].isBlack) {
            this.pieces[pieceNum].isKing = true;
          } else if (this.pieces[pieceNum].loc % 10 == 1 && !this.pieces[pieceNum].isBlack) {
            this.pieces[pieceNum].isKing = true;
          }
          return true;
        }
      }
    }
    return false;
  }
  
  findPiece(pos){
    for (var i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i] != undefined) {
        if (this.pieces[i].loc == pos) {
          return i;
        }
      } 
    }
    return -1;
  }
  
  isValid(i,pos){
    var loc = this.pieces[i].loc; // to shorten future code
    var x0 = Math.floor(loc/10);
    var x1 = Math.floor(pos/10);
    var y0 = loc%10;
    var y1 = pos%10;
    if (this.pieces[i].isBlack) {
      if (abs(x1 - x0) == 1 && (y1-y0 == 1 || this.pieces[i].isKing && abs(y1-y0) == 1) && this.findPiece(pos) == -1) {
        return true;
      } else { // this means the player is attacking 
        var enemyPosy = y1 - 1;
        if (y0 > y1 && this.pieces[i].isKing) {
          enemyPosy = y1 + 1;
        }
        var enemyPosx = x1 > x0 ? x0+1:x1+1;
        var enemyPiece = this.findPiece(enemyPosx+""+enemyPosy);
        if (enemyPiece != -1 && !this.pieces[enemyPiece].isBlack) {
          if (abs(x1 - x0) == 2 && (y1-y0 == 2 || this.pieces[i].isKing && abs(y1-y0) == 2) && this.findPiece(pos) == -1) {
            // deletes enemy player
            this.pieces[enemyPiece] = undefined;
            return true;
          }
        }
      }
    } else {
      if (abs(x1 - x0) == 1 && (y1-y0 == -1 || this.pieces[i].isKing && abs(y1-y0) == 1) && this.findPiece(pos) == -1) {
        return true;
      } else {
        var enemyPosy = y1 + 1;
        if (y1 > y0 && this.pieces[i].isKing) {
          enemyPosy = y1 - 1;
        }
        var enemyPosx = x1 > x0 ? x0+1:x1+1;
        var enemyPiece = this.findPiece(enemyPosx+""+enemyPosy);
        if (enemyPiece != -1 && this.pieces[enemyPiece].isBlack) {
          if (abs(x1 - x0) == 2 && (y1-y0 == -2 || this.pieces[i].isKing && abs(y1-y0) == 2) && this.findPiece(pos) == -1) {
            // deletes enemy player
            this.pieces[enemyPiece] = undefined;
            return true;
          }
        }
      }
    }
    return false;
  }
  
  isGameOver() {
    // 0 is no, 1 is white, 2 is black
    var white = false;
    var black = false;
    for (var i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i] != undefined) {
        if (this.pieces[i].isBlack) {
          black = true;
        } else {
          white = true;
        }
        if (white && black) {
          return 0;
        }
      }
    }
    if (white) {
      return 1;
    }
    return 2;
  }
  
  rate() {
    // rates the board from black's pooint of view
    var numWhite = 0;
    var numBlack = 0;
    for (var i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i] != undefined){
        if (this.pieces[i].isBlack) {
          numBlack++;
          if (this.pieces[i].isKing) {
            numBlack++;
          }
        } else {
          numWhite++;
          if (this.pieces[i].isKing) {
            numWhite++;
          }
        }
      }
    }
    return numBlack - numWhite;
  }
}

class Piece {
  constructor(loc, black) {
    this.loc = loc;
    this.isBlack = black;
    this.radius = 40;
    this.isKing = false;
  }
  
  build() {
    if (this.isBlack) {
      fill(0,0,0);
    } else {
      fill(255,255,255);
    }
    circle(Math.floor(this.loc/10)*50 - 25, (this.loc%10)*50 - 25, this.radius);
    if (this.isKing) {
      fill(67,67,67);
      circle(Math.floor(this.loc/10)*50 - 25, (this.loc%10)*50 - 25, this.radius/2.5);
    }
  }

}

var board = new Board(1);
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  board.build();
  if (board.turn == 1) {
    coolAI();
  }
  state = board.isGameOver();
  textSize(50);
  fill(255,0,0);
  if (state == 1) {
    text("White Wins", 60, height/2);
  } else if (state == 2) {
    text("Black Wins", 60, height/2);
  }
}

function coolAI() {
  board = minimax(board, false, 4)[1];
}

var lastClicked = "0";
var temp = "";
function mouseClicked() {
  if (board.turn == 0){
    let x = ((mouseX - (mouseX%50))/50) + 1;
    let y = ((mouseY - (mouseY%50))/50) + 1;
    if (lastClicked == 0) {
      lastClicked = x+""+y
    } else {
      board.move(lastClicked, x+""+y);
      lastClicked = "0";
    }
  }
}

function minimax(curBoard, isMin, depth) {
  var branches = posBoards(curBoard, curBoard.turn);
  var bestBranch = [0, 0]; // [rating, board object]
  if (depth == 0 || curBoard.isGameOver()) { 
    if (!isMin) {
      bestBranch[0] = -13;
      for (var i = 0; i < branches.length; i++) {
        if (branches[i].rate() > bestBranch[0]) {
          bestBranch[0] = branches[i].rate();
          bestBranch[1] = branches[i];
        }
      }
    } else {
      bestBranch[0] = 13;
      for (var i = 0; i < branches.length; i++) {
        if (branches[i].rate() < bestBranch[0]) {
          bestBranch[0] = branches[i].rate();
          bestBranch[1] = branches[i]
        }
      }
    }
  } else {
    if (!isMin){      
      bestBranch[0] = -13;
      for (var i = 0; i < branches.length; i++) {
        var vertex = minimax(branches[i], !isMin, depth-1);
        if (vertex[0] > bestBranch[0]) {
          bestBranch[0] = vertex[0];
          bestBranch[1] = branches[i];
        }
      }
    } else {
      bestBranch[0] = 13;
      for (var i = 0; i < branches.length; i++) {
        var vertex = minimax(branches[i], !isMin, depth-1);
        if (vertex[0] < bestBranch[0]) {
          bestBranch[0] = vertex[0];
          bestBranch[1] = branches[i];
        }
      }
    }
  }
  return bestBranch;
}

function posBoards(state, turn){
  var boards = []
  for (var i = 0; i < state.pieces.length; i++) {
    if (state.pieces[i] != undefined) {
      var loc = state.pieces[i].loc;
      var locx = Math.floor(loc/10);
      var locy = loc%10;
      var newState = new Board(1);
      newState.copy(state);
      
      if (state.pieces[i].isBlack && turn == 1) {
        if (newState.move(loc, (locx+1)+""+(locy+1))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
        if (newState.move(loc, (locx-1)+""+(locy+1))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
        if (newState.move(loc, (locx+1)+""+(locy-1))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
        if (newState.move(loc, (locx-1)+""+(locy-1))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
        // checks if the black piece can eat
        if (newState.move(loc, (locx+2)+""+(locy+2))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
        if (newState.move(loc, (locx-2)+""+(locy+2))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
        if (newState.move(loc, (locx+2)+""+(locy-2))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
        if (newState.move(loc, (locx-2)+""+(locy-2))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
      } else if (!state.pieces[i].isBlack && turn == 0){
        newState.turn = 0;
        if (newState.move(loc, (locx+1)+""+(locy+1))) {
          boards.push(newState);
          var newState = new Board(0);
          newState.copy(state);
        }
        if (newState.move(loc, (locx-1)+""+(locy+1))) {
          boards.push(newState);
          var newState = new Board(0);
          newState.copy(state);
        }
        if (newState.move(loc, (locx+1)+""+(locy-1))) {
          boards.push(newState);
          var newState = new Board(0);
          newState.copy(state);
        }
        if (newState.move(loc, (locx-1)+""+(locy-1))) {
          boards.push(newState);
          var newState = new Board(0);
          newState.copy(state);
        }
        
        // checks if the white piece can eat
        if (newState.move(loc, (locx+2)+""+(locy+2))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
        if (newState.move(loc, (locx-2)+""+(locy+2))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
        if (newState.move(loc, (locx+2)+""+(locy-2))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
        if (newState.move(loc, (locx-2)+""+(locy-2))) {
          boards.push(newState);
          var newState = new Board(1);
          newState.copy(state);
        }
      }
    }
  }
  return boards
}