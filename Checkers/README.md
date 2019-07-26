# Checkers
This is the classic board game checkers written in the javascript framework p5.js. I used a minimax algorithm to create the AI. 

I have improved this algorithm with alpha-beta pruning, the Ai creates a search tree of depth 8, thinking 5 moves ahead (0 being the first move).

To play download this directory and run the index.html file in your browser, or visit https://funonabun.tk/Games/Checkers/Checkers.html.

## Controls
Click on the piece to move. You play as white.

## What to change when revisiting:
- Make the minimax algorithm much faster (iterative deepening, transposition tables)
- Be able to choose difficulty
