import pygame
from pygame.locals import *
import sys
import copy
import AI

pygame.init()
pygame.font.init()
pygame.display.set_caption('Pygame Chess')
sd = 400  # Side Length
screen = pygame.display.set_mode((sd, sd))
font = pygame.font.SysFont('Arial', 20)
clock = pygame.time.Clock()


BLACK = (0, 0, 0)
RED = (255, 0, 0)
BROWN = (165, 42, 42)
WHITE = (255, 255, 255)
LIGHTGREY = (240, 240, 240)
DARKGREY = (120, 120, 120)
PURPLE = (255, 0, 255)

bPawn = pygame.image.load("sprites/blackPawn.png")
bKnight = pygame.image.load("sprites/blackKnight.png")
bBishop = pygame.image.load("sprites/blackBishop.png")
bRook = pygame.image.load("sprites/blackRook.png")
bQueen = pygame.image.load("sprites/blackQueen.png")
bKing = pygame.image.load("sprites/blackKing.png")
wPawn = pygame.image.load("sprites/whitePawn.png")
wKnight = pygame.image.load("sprites/whiteKnight.png")
wBishop = pygame.image.load("sprites/whiteBishop.png")
wRook = pygame.image.load("sprites/whiteRook.png")
wQueen = pygame.image.load("sprites/whiteQueen.png")
wKing = pygame.image.load("sprites/whiteKing.png")

mouse = [[0, 0], False]


class Game:
    def __init__(self, brain0=None, brain1=None):
        self.isOver = False
        self.gameType = 1  # 0 is debug, 1 ai plays against human, 2 is ai plays against ai
        if brain0 and not brain1:
            self.brain = brain0
            self.brain.game = self
        if brain0 and brain1:
            self.brain0 = brain0
            self.brain0.game = self
            self.brain1 = brain1
            self.brain1.game = self
        """
            Positive if white, negative if black
            0 - Empty
            1 - Pawn
            2 - Knight
            3 - Bishop
            4 - Rook
            5 - Queen
            6 - King
        """
        self.board = [[-4, -2, -3, -5, -6, -3, -2, -4],
                      [-1, -1, -1, -1, -1, -1, -1, -1],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [1, 1, 1, 1, 1, 1, 1, 1],
                      [4, 2, 3, 5, 6, 3, 2, 4]]

        self.turn = 1  # 1 is white, 0 is black
        self.result = -1 # -1 is ongoing, 0 is stalemate, 2 is white checkmates, 1 is black checkmates

        self.hasChosen = [False, (0, 0)]
        self.change = True

        self.bEnPassant = [0] * 8
        self.wEnPassant = [0] * 8
        self.passantCapture = [False, [0, 0]]

        self.bHasCastled = False
        self.wHasCastled = False
        self.bKingHasMoved = False
        self.wKingHasMoved = False
        self.bRookHasMoved = [False, False]
        self.wRookHasMoved = [False, False]
        # 0 is False, 1 is left, and 2 is right
        self.bCastle = 0
        self.wCastle = 0

    def play(self):
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.MOUSEBUTTONUP:
                if event.button == 1:
                    mouse[1] = True
                mouse[0] = event.pos

        if self.gameType == 0:
            self.debug()
        elif self.gameType == 1:
            self.playAIHuman()
        else:
            self.playAIAI()

        if self.change:
            self.drawBoard(screen)
            self.change = False

        pygame.display.update()

        if self.result == 0:
            print("stalemate")
        elif self.result == 2:
            print("White wins")
        elif self.result == 1:
            print("Black wins")

    def debug(self):
        if mouse[1]:
            self.change = True
            if self.hasChosen[0]:
                self.move(self.hasChosen[1], [int(loc / (sd / 8)) for loc in mouse[0]])
                self.hasChosen[0] = False
                mouse[1] = False
            else:
                self.hasChosen[0] = True
                self.hasChosen[1] = [int(loc / (sd / 8)) for loc in mouse[0]]
                mouse[1] = False
            self.promote()

    def playAIHuman(self):
        if self.turn == 0:
            move = self.brain.move()
            self.move(move[0], move[1])
            self.change = True
            self.promote()
        elif self.turn == 1:
            if mouse[1]:
                self.change = True
                if self.hasChosen[0]:
                    self.move(self.hasChosen[1], [int(loc / (sd / 8)) for loc in mouse[0]])
                    self.hasChosen[0] = False
                    mouse[1] = False
                else:
                    self.hasChosen[0] = True
                    self.hasChosen[1] = [int(loc / (sd / 8)) for loc in mouse[0]]
                    mouse[1] = False
            self.promote()

    def playAIAI(self):
        if self.result != -1 or self.isCheckMate() != -1:  # avoids a weird bug
            self.gameType = 0
            return
        if self.turn == 0:
            move = self.brain0.move()
        elif self.turn == 1:
            move = self.brain1.move()
        self.move(move[0], move[1])
        self.change = True
        self.promote()

    def promote(self):
        for i in range(8):
            if self.board[0][i] == 1:
                self.board[0][i] = 5
            if self.board[7][i] == -1:
                self.board[7][i] = -5

    def drawBoard(self, surface):
        isBlack = False
        for i in range(8):
            isBlack = not isBlack
            for j in range(8):
                isBlack = not isBlack
                color = DARKGREY if isBlack else LIGHTGREY
                if self.hasChosen[0] and [i, j] == self.hasChosen[1]:
                    color = PURPLE
                pygame.draw.rect(surface, color, pygame.Rect(i * (sd / 8), j * (sd / 8), sd / 8, sd / 8))

        for i in range(8):
            for j in range(8):
                if self.board[i][j] == 0:
                    continue
                screen.blit(self.pieceSprite(self.board[i][j]), [j * sd / 8, i * sd / 8])

    @staticmethod
    def pieceSprite(pt):
        if abs(pt) == 1:
            return bPawn if pt < 0 else wPawn
        if abs(pt) == 2:
            return bKnight if pt < 0 else wKnight
        if abs(pt) == 3:
            return bBishop if pt < 0 else wBishop
        if abs(pt) == 4:
            return bRook if pt < 0 else wRook
        if abs(pt) == 5:
            return bQueen if pt < 0 else wQueen
        return bKing if pt < 0 else wKing

    def move(self, oldLoc, newLoc):
        if self.isValid(oldLoc, newLoc, self.turn, mustCapture=False, inPlay=True):
            self.board[newLoc[1]][newLoc[0]] = self.board[oldLoc[1]][oldLoc[0]]
            self.board[oldLoc[1]][oldLoc[0]] = 0
            self.turn = (self.turn + 1) % 2
        for i in range(8):
            if self.wEnPassant[i] != 0:
                self.wEnPassant[i] += 1
                self.wEnPassant[i] %= 3
        for i in range(8):
            if self.bEnPassant[i] != 0:
                self.bEnPassant[i] += 1
                self.bEnPassant[i] %= 3

        if self.passantCapture[0]:
            self.board[self.passantCapture[1][0]][self.passantCapture[1][1]] = 0
        if self.bCastle > 0:
            self.bHasCastled = True
            if self.bCastle == 1:
                self.board[0][0] = 0
                self.board[0][3] = -4
            else:
                self.board[0][7] = 0
                self.board[0][5] = -4
            self.bCastle = 0
        if self.wCastle > 0:
            self.wHasCastled = True
            if self.wCastle == 1:
                self.board[7][0] = 0
                self.board[7][3] = 4
            else:
                self.board[7][7] = 0
                self.board[7][5] = 4
            self.wCastle = 0
        c = self.isCheckMate()
        if c != -1:
            self.result = c
            self.gameType = 0

    def isValid(self, oldLoc, newLoc, turn, mustCapture=False, inPlay=True):
        pt = self.board[oldLoc[1]][oldLoc[0]]
        endt = self.board[newLoc[1]][newLoc[0]]
        if pt == 0 or (turn == 0 and pt > 0) or (turn == 1 and pt < 0) or endt * pt > 0:
            # if you are trying to move an empty spot or
            # if you are trying to move an enemy piece or attack your own piece
            return False
        if abs(pt) == 1:
            return self.isValidPawn(oldLoc, newLoc, pt == -1, mustCapture, inPlay) and self.createsSelfCheck(oldLoc, newLoc)
        if abs(pt) == 2:
            return self.isValidKnight(oldLoc, newLoc) and self.createsSelfCheck(oldLoc, newLoc)
        if abs(pt) == 3:
            return self.isValidBishop(oldLoc, newLoc) and self.createsSelfCheck(oldLoc, newLoc)
        if abs(pt) == 4:
            return self.isValidRook(oldLoc, newLoc, inPlay) and self.createsSelfCheck(oldLoc, newLoc)
        if abs(pt) == 5:
            return self.isValidQueen(oldLoc, newLoc) and self.createsSelfCheck(oldLoc, newLoc)
        return self.isValidKing(oldLoc, newLoc, inPlay) and self.createsSelfCheck(oldLoc, newLoc)

    def createsSelfCheck(self, oldLoc, newLoc):
        # check if the move results in a check
        newBoard = copy.deepcopy(self.board)
        newBoard[newLoc[1]][newLoc[0]] = newBoard[oldLoc[1]][oldLoc[0]]
        newBoard[oldLoc[1]][oldLoc[0]] = 0
        if self.createNewGame(newBoard).isCheckNoLoc(newBoard[newLoc[1]][newLoc[0]] < 0):
            return False
        return True

    def createNewGame(self, newBoard):
        newGame = Game()
        newGame.board = newBoard
        newGame.turn = self.turn
        newGame.bRookHasMoved = self.bRookHasMoved[:]
        newGame.wRookHasMoved = self.wRookHasMoved[:]
        newGame.wKingHasMoved = self.wKingHasMoved
        newGame.bKingHasMoved = self.bKingHasMoved
        newGame.bHasCastled = self.bHasCastled
        newGame.wHasCastled = self.wHasCastled
        newGame.wEnPassant = self.wEnPassant[:]
        newGame.bEnPassant = self.bEnPassant[:]
        return newGame

    def isValidPawn(self, oldLoc, newLoc, isBlack, mustCapture, inPlay):
        if isBlack:
            if newLoc == [oldLoc[0] - 1, oldLoc[1] + 1] or newLoc == [oldLoc[0] + 1, oldLoc[1] + 1]:
                if mustCapture or self.board[newLoc[1]][newLoc[0]] > 0:
                    return True
                if oldLoc[1] == 5:
                    if newLoc == [oldLoc[0] - 1, oldLoc[1] + 1] and self.wEnPassant[oldLoc[0] - 1] > 0:
                        if inPlay:
                            self.passantCapture = [True, [oldLoc[1], oldLoc[0] - 1]]
                        return True
                    if newLoc == [oldLoc[0] + 1, oldLoc[1] + 1] and self.wEnPassant[oldLoc[0] + 1] > 0:
                        if inPlay:
                            self.passantCapture = [True, [oldLoc[1], oldLoc[0] + 1]]
                        return True
            if not mustCapture and newLoc[0] == oldLoc[0]:
                if newLoc[1] - oldLoc[1] == 2 and oldLoc[1] == 1:
                    if self.board[2][oldLoc[0]] == 0:
                        if inPlay:
                            self.bEnPassant[oldLoc[0]] = 1
                        return self.board[newLoc[1]][newLoc[0]] == 0
                if newLoc[1] - oldLoc[1] == 1:
                    return self.board[newLoc[1]][newLoc[0]] == 0
                return False
        else:
            if newLoc == [oldLoc[0] - 1, oldLoc[1] - 1] or newLoc == [oldLoc[0] + 1, oldLoc[1] - 1]:
                if mustCapture or self.board[newLoc[1]][newLoc[0]] < 0:
                    return True
                if oldLoc[1] == 3:
                    if newLoc == [oldLoc[0] - 1, oldLoc[1] - 1] and self.bEnPassant[oldLoc[0] - 1] > 0:
                        if inPlay:
                            self.passantCapture = [True, [oldLoc[1], oldLoc[0] - 1]]
                        return True
                    if newLoc == [oldLoc[0] + 1, oldLoc[1] - 1] and self.bEnPassant[oldLoc[0] + 1] > 0:
                        if inPlay:
                            self.passantCapture = [True, [oldLoc[1], oldLoc[0] + 1]]
                        return True

            if not mustCapture and newLoc[0] == oldLoc[0]:
                if oldLoc[1] - newLoc[1] == 2 and oldLoc[1] == 6:
                    if self.board[5][oldLoc[0]] == 0:
                        if inPlay:
                            self.wEnPassant[oldLoc[0]] = 1
                        return self.board[newLoc[1]][newLoc[0]] == 0
                if oldLoc[1] - newLoc[1] == 1:
                    return self.board[newLoc[1]][newLoc[0]] == 0
                return False
        return False

    def isValidKnight(self, oldLoc, newLoc):
        # a bit lazy but it does the job
        possLocs = [[oldLoc[0] + 1, oldLoc[1] + 2],
                    [oldLoc[0] + 1, oldLoc[1] - 2],
                    [oldLoc[0] - 1, oldLoc[1] + 2],
                    [oldLoc[0] - 1, oldLoc[1] - 2],
                    [oldLoc[0] + 2, oldLoc[1] + 1],
                    [oldLoc[0] + 2, oldLoc[1] - 1],
                    [oldLoc[0] - 2, oldLoc[1] + 1],
                    [oldLoc[0] - 2, oldLoc[1] - 1]]
        return newLoc in possLocs

    def isValidBishop(self, oldLoc, newLoc):
        if abs(oldLoc[0] - newLoc[0]) == abs(oldLoc[1] - newLoc[1]):
            if newLoc[0] < oldLoc[0] and newLoc[1] < oldLoc[1]:
                for i in range(1, abs(newLoc[0] - oldLoc[0])):
                    if self.board[newLoc[1] + i][newLoc[0] + i] != 0:
                        return False
            if newLoc[0] > oldLoc[0] and newLoc[1] < oldLoc[1]:
                for i in range(1, abs(newLoc[0] - oldLoc[0])):
                    if self.board[newLoc[1] + i][newLoc[0] - i] != 0:
                        return False
            if newLoc[0] < oldLoc[0] and newLoc[1] > oldLoc[1]:
                for i in range(1, abs(newLoc[0] - oldLoc[0])):
                    if self.board[newLoc[1] - i][newLoc[0] + i] != 0:
                        return False
            if newLoc[0] > oldLoc[0] and newLoc[1] > oldLoc[1]:
                for i in range(1, abs(newLoc[0] - oldLoc[0])):
                    if self.board[newLoc[1] - i][newLoc[0] - i] != 0:
                        return False
            return True
        return False

    def isValidRook(self, oldLoc, newLoc, inPlay):
        if oldLoc[0] == newLoc[0]:
            if newLoc[1] > oldLoc[1]:
                for i in range(1, newLoc[1] - oldLoc[1]):
                    if self.board[newLoc[1] - i][newLoc[0]] != 0:
                        return False
            else:
                for i in range(1, oldLoc[1] - newLoc[1]):
                    if self.board[newLoc[1] + i][newLoc[0]] != 0:
                        return False

            if self.board[oldLoc[1]][oldLoc[1]] < 0:
                if oldLoc[0] == 0:
                    self.bRookHasMoved[0] = (True and inPlay) or self.bRookHasMoved[0]
                else:
                    self.bRookHasMoved[1] = (True and inPlay) or self.bRookHasMoved[1]
            else:
                if oldLoc[0] == 0:
                    self.wRookHasMoved[0] = (True and inPlay) or self.wRookHasMoved[0]
                else:
                    self.wRookHasMoved[1] = (True and inPlay) or self.wRookHasMoved[1]

            return True
        if oldLoc[1] == newLoc[1]:
            if newLoc[0] > oldLoc[0]:
                for i in range(1, newLoc[0] - oldLoc[0]):
                    if self.board[oldLoc[1]][newLoc[0] - i] != 0:
                        return False
            else:
                for i in range(1, oldLoc[0] - newLoc[0]):
                    if self.board[oldLoc[1]][newLoc[0] + i] != 0:
                        return False

            if self.board[oldLoc[1]][oldLoc[1]] < 0:
                if oldLoc[0] == 0:
                    self.bRookHasMoved[0] = (True and inPlay) or self.bRookHasMoved[0]
                else:
                    self.bRookHasMoved[1] = (True and inPlay) or self.bRookHasMoved[1]
            else:
                if oldLoc[0] == 0:
                    self.wRookHasMoved[0] = (True and inPlay) or self.wRookHasMoved[0]
                else:
                    self.wRookHasMoved[1] = (True and inPlay) or self.wRookHasMoved[1]
            return True
        return False

    def isValidQueen(self, oldLoc, newLoc):
        return self.isValidBishop(oldLoc, newLoc) or self.isValidRook(oldLoc, newLoc, False)

    def isValidKing(self, oldLoc, newLoc, inPlay):
        # check if the player chose to castle, then return true if valid
        if oldLoc == [4, 0] and newLoc == [2, 0]:
            return self.canCastle(oldLoc, True, inPlay)
        if oldLoc == [4, 0] and newLoc == [6, 0]:
            return self.canCastle(oldLoc, False, inPlay)
        if oldLoc == [4, 7] and newLoc == [2, 7]:
            return self.canCastle(oldLoc, True, inPlay)
        if oldLoc == [4, 7] and newLoc == [6, 7]:
            return self.canCastle(oldLoc, False, inPlay)

        if (abs(oldLoc[0] - newLoc[0]) == 1 or oldLoc[0] == newLoc[0]) and (abs(oldLoc[1] - newLoc[1]) == 1 or oldLoc[1] == newLoc[1]):
            if self.board[oldLoc[1]][oldLoc[0]] < 0:
                self.bKingHasMoved = (True and inPlay) or self.bKingHasMoved
            else:
                self.wKingHasMoved = (True and inPlay) or self.wKingHasMoved
            return True
        return False

    def isCheckNoLoc(self, isBlack):
        return self.isCheck(self.kingPos(isBlack)[::-1], isBlack)

    def isCheck(self, loc, isBlack):
        # checks if a king is under attack if at location loc
        for i in range(8):
            for j in range(8):
                if abs(self.board[j][i]) == 6 or self.board[j][i]*(-1 if isBlack else 1) > 0:
                    continue
                if self.isValid([i, j], loc, (self.turn+1) % 2, mustCapture=True, inPlay=False):
                    return True

        for i in range(-1, 2):
            for j in range(-1, 2):
                if 7 >= loc[1] + i >= 0 and 7 >= loc[0] + j >= 0:
                    if self.board[loc[1]+i][loc[0]+j] == 6 * (1 if isBlack else -1):
                        return True
        return False

    def canCastle(self, loc, isLeft, inPlay):
        if loc[1] == 0:
            if self.isCheck(loc, True) or self.bKingHasMoved:
                return False
            if isLeft:
                if self.bRookHasMoved[0] or self.board[0][0] != -4:
                    return False
                for i in range(1, 4):
                    if self.board[0][i] != 0 or self.isCheck([i, 0], True):
                        return False
                if inPlay:
                    self.bCastle = 1
            else:
                if self.bRookHasMoved[1] or self.board[0][7] != -4:
                    return False
                for i in range(5, 7):
                    if self.board[0][i] != 0 or self.isCheck([i, 0], True):
                        return False
                if inPlay:
                    self.bCastle = 2
        else:
            if self.isCheck(loc, False) or self.wKingHasMoved:
                return False
            if isLeft:
                if self.wRookHasMoved[0] or self.board[7][0] != 4:
                    return False
                for i in range(1, 4):
                    if self.board[7][i] != 0 or self.isCheck([i, 7], False):
                        return False
                if inPlay:
                    self.wCastle = 1
            else:
                if self.wRookHasMoved[1] or self.board[7][7] != 4:
                    return False
                for i in range(5, 7):
                    if self.board[7][i] != 0 or self.isCheck([i, 7], False):
                        return False
                if inPlay:
                    self.wCastle = 2
        return True

    def kingPos(self, isBlack):
        for i in range(8):
            for j in range(8):
                if self.board[j][i] == (-1 if isBlack else 1) * 6:
                    return [j, i]
        return [-1, -1]

    def isCheckMate(self, checkFuture=True):
        for c, loc in enumerate([self.kingPos(False), self.kingPos(True)]):
            found = False
            for i in range(-1, 2):
                for j in range(-1, 2):
                    if (i == 0 and j == 0) or (7 >= loc[1] + i >= 0 and 7 >= loc[0] + j >= 0 and self.board[loc[0]+j][loc[1]+i] * (-1 if c == 0 else 1) >= 0):
                        if not self.isCheck([loc[1] + i, loc[0] + j], c == 1):
                            found = True
                            break
                if found:
                    break
            if checkFuture:
                if c != self.turn and len(list(self.possibleMoves())) != 0:
                    continue
            if found:
                continue
            if not self.isCheck([loc[1], loc[0]], c == 1):
                return 0
            return c + 1
        found = False
        for i in range(8):
            for j in range(8):
                if abs(self.board[i][j]) != 6 and self.board[i][j] != 0:
                    found = True
        if not found:
            self.result = 0
        return -1

    def possibleMoves(self):
        for i in range(8):
            for j in range(8):
                if (self.board[i][j] > 0 and self.turn == 1) or (self.board[i][j] < 0 and self.turn == 0):
                    for k in range(8):
                        for l in range(8):
                            if self.isValid([j, i], [l, k], self.turn, mustCapture=False, inPlay=False):
                                newBoard = copy.deepcopy(self.board)
                                newBoard[k][l] = newBoard[i][j]
                                newBoard[i][j] = 0
                                yield (self.createNewGame(newBoard), [j, i], [l, k])


brain0 = AI.Minimax(2)
brain1 = AI.Minimax(1)
game = Game(brain0, None)
while not game.isOver:
    game.play()
    clock.tick(50)
