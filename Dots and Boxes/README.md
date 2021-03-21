# Dots And Boxes
This is a version of dots and boxes written in the JavaScript framework p5.js, it uses a minimax algorithm to calculate the next best move. The algorithm is optimized with alpha beta pruning. Currently the search tree searches a depth of 2, which will be increased with memorization.

This game is not complete yet, there is a bug where the AI will take a box as a player after taking a lot of boxes in a row.

To play download this directory and run the html file or go to [Dots And Boxes (supermac30.github.io)](https://supermac30.github.io/Games/DotsAndBoxes/DotsAndBoxes.html).
## Control
Click on where you want the line to be placed.

## What to change when revisiting
- Add iterative deepening and a transposition table
- add a UI
- be able to choose difficulty, depth
