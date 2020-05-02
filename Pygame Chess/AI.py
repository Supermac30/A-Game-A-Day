from random import randint
import math


class Minimax:
    def __init__(self, lookAhead):
        self.lookAhead = lookAhead
        self.game = None
        self.memory = {}

    def move(self):
        best = self.minimax([self.game, [0, 0], [0, 0]], self.lookAhead, -float('inf'), float('inf'), self.game.turn == 1)
        return [best[1], best[2]]

    def minimax(self, game, depth, alpha, beta, isMax):
        if self.flatten(game[0].board) in self.memory:
            return self.memory.get(self.flatten(game[0].board))
        c = game[0].isCheckMate()
        if c == 0 or c == 1:
            return [c*100, game[1], game[2]]
        elif c == 2:
            return [-100, game[1], game[2]]

        if depth == 0:
            return [sum([sum(line) for line in game[0].board]), game[1], game[2]]

        games = list(game[0].possibleMoves())
        if len(games) == 0:
            return [0, [0, 0], [0, 0]]
        games[0][0].turn += 1
        games[0][0].turn %= 2
        best = [0, self.minimax(games[0], depth-1, alpha, beta, not isMax)]
        if isMax:
            for i, poss in enumerate(games[1:]):
                poss[0].turn += 1
                poss[0].turn %= 2
                val = self.minimax(poss, depth-1, alpha, beta, not isMax)
                alpha = max(alpha, val[0])
                if val[0] > best[1][0]:
                    best = [i+1, val]
                if beta <= alpha:
                    break
        else:
            for i, poss in enumerate(games[1:]):
                poss[0].turn += 1
                poss[0].turn %= 2
                val = self.minimax(poss, depth-1, alpha, beta, not isMax)
                beta = min(beta, val[0])
                if val[0] < best[1][0]:
                    best = [i+1, val]
                if beta <= alpha:
                    break
        self.memory[self.flatten(game[0].board)] = [best[1][0], games[best[0]][1], games[best[0]][2]]
        return [best[1][0], games[best[0]][1], games[best[0]][2]]

    @staticmethod
    def flatten(arr):
        newArray = []
        for line in arr:
            newArray.extend(line)
        return tuple(newArray)


class Node:
    def __init__(self, value):
        self.value = value
        self.rating = [0, 0]
        self.children = []

class Idiot:
    # plays a random move
    def __init__(self):
        self.game = None

    def move(self):
        games = list(self.game.possibleMoves())
        rand = randint(0, len(games)-1)
        return [games[rand][1], games[rand][2]]


class Greedy:
    # takes the best move with only a one step look ahead
    def __init__(self):
        self.game = None

    def move(self):
        games = list(self.game.possibleMoves())
        init = randint(0, len(games)-1)
        best = [sum([sum(line) for line in games[init][0].board]) * (-1 if self.game.turn == 1 else 1), init]
        for i, poss in enumerate(games):
            total = sum([sum(line) for line in poss[0].board]) * (-1 if self.game.turn == 1 else 1)
            if total < best[0]:
                best[0] = total
                best[1] = i
        return [games[best[1]][1], games[best[1]][2]]
