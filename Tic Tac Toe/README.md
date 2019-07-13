# Tic-Tac-Toe
This is a version of TicTacToe written in the javascript framework p5.js. Creating this game taught me how to build an AI with a minimax algorithm.

A possibility tree is created and a recursive algorithm looks through it for the best possible move. This algorithm can be less computationally expensive if alpha beta pruning is implemented and if symmetrical TicTacToe boards aren't checked more than once. 

I found that playing the same game over and over with the AI putting the X at the top left corner is boring so I started the game on easy mode where the first move
is completely random.

Created on 12th July 2019. I lagged behind for a couple of days. I will make up for that.
## controls
Click to place a circle on the board. Press 'r' to restart. Click on the button below to make the first move random or calculated, easy or hard mode.

## What to change when revisiting:
- Add a two player option
- Optimise the minimax algorithm
- Fix a bug where a tie is chosen instead of a win when on hard mode and placing the circle in the middle middle, then top right
