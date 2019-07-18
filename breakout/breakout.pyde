import time
width = 600
height = 800
class Rectangle:
    def create(self):
        fill(self.color)
        rect(self.x, self.y, self.sizex, self.sizey)

class Player(Rectangle):
    def __init__(self):
        self.x = width/10
        self.y = height*9/10
        self.sizex = width/5
        self.sizey = height/20
        self.speed = width/50
        self.color = color(255,255,255)
    def right(self):
        self.x += self.speed
        if self.x > width - self.sizex:
            self.x = width - self.sizex
    def left(self):
        self.x -= self.speed
        if self.x < 0:
            self.x = 0
        
class Enemy(Rectangle):
    def __init__(self, x, y, sizex, sizey, value):
        self.value = value  
        self.x = x
        self.y = y
        self.sizex = sizex
        self.sizey = sizey
        self.color = color(self.value * 10, self.value * 5, self.value * 2) 
        
class Ball:
    def __init__(self):
        self.x = width/2
        self.y = height*3/4
        self.r = width/75
        self.dx = 2
        self.dy = 2
    def create(self):
        circle(self.x, self.y, self.r*2)
    def move(self):
        self.x += self.dx
        self.y += self.dy
        self.checkCollision()
    def bounceV(self):
        self.dy *= -1
    def bounceH(self):
        self.dx *= -1
    def checkCollision(self):
        if self.x - self.r <= 0 or self.x + self.r >= width:
            self.bounceH()
        elif self.y - self.r <= 0:
            self.bounceV()
        elif self.dy > 0 and self.y + self.r > player.y and self.x >= player.x and self.x <= player.x + player.sizex:
            self.bounceV()
        elif self.dy > 0 and (within(player.x - self.x, self.r) or within(self.x - player.x - player.sizex, self.r)) and self.y >= player.y and self.y <= player.y + player.sizey:
            self.bounceH()
            self.bounceV()
        for enemy in enemies:
            if (within(self.y - enemy.y, self.r) or within(enemy.y + enemy.sizey - self.y, self.r)) and self.x >= enemy.x and self.x <= enemy.x + enemy.sizex:
                enemies.remove(enemy)
                self.dx = 100/enemy.value * (-1 if self.dx < 0 else 1)
                self.dy = 100/enemy.value * (-1 if self.dy < 0 else 1)
                self.bounceV()
            elif (within(enemy.x -self.x, self.r) or within(self.x - enemy.x - enemy.sizex, self.r)) and self.y <= enemy.y + enemy.sizey and self.y >= enemy.y:
                enemies.remove(enemy)
                self.dx = 100/enemy.value * (-1 if self.dx < 0 else 1)
                self.dy = 100/enemy.value * (-1 if self.dy < 0 else 1)
                self.bounceH()

class Button():
    def __init__(self, x, y, sizex, sizey, text):
        self.x = x
        self.y = y
        self.sizex = sizex
        self.sizey = sizey
        self.color = color(200,200,200)
        self.textColor = color(0,0,0)
        self.text = text
    def isClicked(self):
        return mouseX > self.x and mouseX < self.x + self.sizex and mouseY > self.y and mouseY < self.y + self.sizey
    def create(self):
        fill(self.color)
        textSize(32)
        rect(self.x, self.y, self.sizex, self.sizey)
        fill(self.textColor)
        text(self.text, self.x + self.sizex/2 - 8*len(self.text), self.y + self.sizey/2 + 10)
        
def within(a,c):
    #helper function
    return a < c and a > -c
                        
player = Player()
ball = Ball()
screen = 0
enemies = []
lives = 3

def setup():
    size(600,800)
    
def draw():    
    if screen == 0:
        menuScreen()
    elif screen == 1:
        gameScreen()
    elif screen == 2:
        gameoverScreen()
    elif screen == 3:
        levelEditorScreen()
    
startDefault = Button(width/4, height/6, width/2, height/7, "Play")
createLevel = Button(width/4, height/3, width/2, height/7, "Create Level")
def menuScreen():
    background(0)
    fill(255,255,255)
    textSize(100)
    text("BreakOut", width/8, height/10)
    startDefault.create()
    createLevel.create()

def mouseClicked():
    global screen
    if screen == 0:
        if startDefault.isClicked():
            gameSetup(False)
            screen = 1
        elif createLevel.isClicked():
            screen = 3
    elif screen == 3:
        if mouseY <= height/2:
            add(mouseX - (mouseX % (width/8)), mouseY - (mouseY % (height/20)))
        if playLevel.isClicked():
            gameSetup(True)
            screen = 1

def gameSetup(custom):
    global enemies, placedEnemies
    if not custom:
        for i in range(height/10, height/2, height/20):
            for j in range(0, width, width/8):
                enemies.append(Enemy(j, i, width/8, height/20, (i//(height/10)) * 10))
    else:
        enemies = list(placedEnemies.values())
    placedEnemies = {}
        
def gameScreen():
    global lives, enemies, ball, screen
    background(0,0,0)
    takeInp()
    player.create()
    ball.create()
    ball.move()
    for enemy in enemies:
        enemy.create()
    if ball.y > height:
        lives -= 1
        ball = Ball()
    if lives < 0:
        screen = 2
    if len(enemies) == 0:
        screen = 0
        lives = 3
        ball = Ball()
    fill (0,255,0)
    textSize(32)
    text("lives: " + str(lives), 0, 32)
   
def gameoverScreen():
    pass
    
placedEnemies = {}
playLevel = Button(width/4, height*2/3, width/2, height/10, "Play Level");
def levelEditorScreen():
    background(100,100,100)
    fill(255,255,255)
    playLevel.create()
    for i in range(0, height/2 + height/20, height/20):
        line(0, i, width, i)
    for i in range(0, width, width/8):
        line(i, 0, i, height/2)
    for enemy in list(placedEnemies.values()):
        enemy.create()

    
def add(x, y):
    if (x, y) in placedEnemies:
        val = placedEnemies.get((x, y)).value - 10
        if val == 0:
            del placedEnemies[(x, y)]
            return
        placedEnemies[(x, y)] = Enemy(x, y, width/8, height/20, val)
    else:
        placedEnemies[(x, y)] = Enemy(x, y, width/8, height/20, 40)
    

            
def takeInp():
    if keyPressed:
        if keyCode == LEFT:
            player.left()
        if keyCode == RIGHT:
            player.right()
