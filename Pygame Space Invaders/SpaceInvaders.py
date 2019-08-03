import pygame
import sys
from pygame.locals import *
clock = pygame.time.Clock()
pygame.font.init()
pygame.init()
my_font = pygame.font.SysFont('Arial', 20)


class Block:
    def __init__(self, x, y):
        self.rect = pygame.rect.Rect((x, y, 10, 10))
        self.color = [255,255,255]

    def is_hit(self):
        for enemyColumn in enemies:
            for enemy in enemyColumn:
                for bullet in enemy.bullets:
                    if self.rect[0] < bullet.rect[0] < self.rect[0] + 10 and self.rect[1] < bullet.rect[1] < self.rect[1] + 10:
                        enemy.bullets.remove(bullet)
                        return True
        for bullet in player.bullets:
            if self.rect[0] - 10 < bullet.rect[0] < self.rect[0] + 10 and self.rect[1] - 10 < bullet.rect[1] < self.rect[1] + 10:
                player.bullets.remove(bullet)
                return True

    def draw(self, surface):
        pygame.draw.rect(surface, self.color, self.rect)


class Shield:
    def __init__(self, x, y):
        self.parts = [[0, 0, 0, 1, 0, 0, 0],
                      [0, 0, 1, 1, 1, 0, 0],
                      [0, 1, 1, 0, 1, 1, 0],
                      [1, 1, 0, 0, 0, 1, 1],
                      [1, 0, 0, 0, 0, 0, 1]]

        self.blocks = []
        for i in range(len(self.parts)):
            for j in range(len(self.parts[i])):
                if self.parts[i][j] == 1:
                    self.blocks.append(Block(x + 10*j, y + 10*i))

    def draw(self, surface):
        for block in self.blocks:
            block.draw(surface)

    def update(self):
        for block in self.blocks:
            if block.is_hit():
                if block.color[0] == 0:
                    self.blocks.remove(block)
                else:
                    for i in range(3):
                        block.color[i] -= 51


class Enemy:
    def __init__(self, x, y, loc, is_bottom):
        self.loc = loc
        self.is_bottom = is_bottom
        self.direction = 1  # 1 right, -1 left
        self.rect = pygame.rect.Rect((x, y, 40, 20))
        self.bullets = []

    def draw(self, surface):
        pygame.draw.rect(surface, GREEN, self.rect)
        for bullet in self.bullets:
            bullet.draw(surface)

    def shoot(self):
        self.bullets.append(Bullet(self.rect[0] + 18, self.rect[1] + 20, True))
        self.bullets[-1].speed = 10

    def is_hit(self):
        for bullet in player.bullets:
            if self.rect[0] < bullet.rect[0] < self.rect[0] + 40 and self.rect[1] < bullet.rect[1] < self.rect[1] + 20:
                try:
                    enemies[self.loc[1]-1][self.loc[0]].is_bottom = True
                except IndexError:
                    pass
                del enemies[self.loc[1]][self.loc[0]]
                for enemy in enemies[self.loc[1]][self.loc[0]:]:
                    enemy.loc[0] -= 1
                player.bullets.remove(bullet)

    def move_horizontal(self):
        self.rect.move_ip(0, 30)

    def update(self):
        if pygame.time.get_ticks() % 100 == 0 and self.is_bottom:
            self.shoot()
        for bullet in self.bullets:
            bullet.update()
        self.is_hit()


class Bullet:
    def __init__(self, x, y, is_hostile):
        self.rect = pygame.rect.Rect((x, y, 4, 8))
        self.is_hostile = is_hostile
        self.speed = 1

    def draw(self, surface):
        pygame.draw.rect(surface, WHITE, self.rect)

    def update(self):
        speed = ((last_call * 3) // 5) / self.speed
        if self.is_hostile:
            self.rect.move_ip(0, speed)
        else:
            self.rect.move_ip(0, -speed)


class Player:
    def __init__(self):
        self.cool_down = False
        self.lives = 3
        self.rect = pygame.rect.Rect((180, 380, 40, 20))
        self.bullets = []

    def draw(self, surface):
        pygame.draw.rect(surface, BLUE, self.rect)
        for bullet in self.bullets:
            bullet.draw(surface)

    def input(self):
        keys = pygame.key.get_pressed()
        speed = last_call // 2
        if keys[pygame.K_LEFT] and self.rect[0] > 0:
            self.rect.move_ip(-speed, 0)
        if keys[pygame.K_RIGHT] and self.rect[0] < 360:
            self.rect.move_ip(speed, 0)
        if keys[pygame.K_SPACE] and not self.cool_down:
            self.shoot()
            self.cool_down = True

    def shoot(self):
        self.bullets.append(Bullet(self.rect[0] + 18, self.rect[1], False))

    def update(self):
        global game_over
        for bullet in self.bullets:
            bullet.update()
            if bullet.rect[1] < 0:
                self.bullets.remove(bullet)

        for enemyColumn in enemies:
            for enemy in enemyColumn:
                for bullet in enemy.bullets:
                    if self.rect[0] < bullet.rect[0] < self.rect[0] + 40 and self.rect[1] < bullet.rect[1] < self.rect[1] + 20:
                        self.lives -= 1
                        enemy.bullets.remove(bullet)

        if self.lives <= 0:
            game_over = True


size = width, height = 400, 400
screen = pygame.display.set_mode(size)
player = Player()
shields = []
enemies = []
direction = 1  # 1 right, -1 left
last_call = 0
game_over = False
win = False

WHITE = (255, 255, 255)
BLUE = (0, 0, 255)
GREEN = (0, 255, 0)
BLACK = (0, 0, 0)

# initialise enemies
for i in range(0, 200, 40):
    enemies.append([])
    for j in range(30, 350, 50):
        enemies[-1].append(Enemy(j, i, [((j-5)//50), (i//40)], i == 160))

# initialise shields
for i in range(15, 400, 100):
    shields.append(Shield(i, 300))

while not game_over and not win:
    for event in pygame.event.get():
        if event.type == QUIT:
            pygame.quit()
            sys.exit()

    screen.fill(BLACK)

    text_surface = my_font.render('lives: ' + str(player.lives), False, WHITE)
    player.input()
    player.draw(screen)
    player.update()

    for shield in shields:
        shield.draw(screen)
        shield.update()

    move_down = pygame.time.get_ticks() % 50 == 0
    for enemyColumn in enemies:
        for enemy in enemyColumn:
            if enemy is not None:
                if enemy.rect[0] > 360 and direction == 1 or enemy.rect[0] < 0 and direction == -1:
                    direction *= -1

    for enemyColumn in enemies:
        for enemy in enemyColumn:
            if enemy is not None:
                enemy.draw(screen)
                enemy.update()
                enemy.rect.move_ip(direction, 0)
                if move_down:
                    enemy.rect.move_ip(0, 1)

    win = True
    for enemyColumn in enemies:
        if len(enemyColumn) != 0:
            win = False

    screen.blit(text_surface, (0, 0))
    pygame.display.update()

    if pygame.time.get_ticks() % 10 == 0:
        player.cool_down = False

    last_call = clock.tick(60)

while game_over:
    for event in pygame.event.get():
        if event.type == QUIT:
            pygame.quit()
            sys.exit()
    screen.fill(BLACK)

    text_surface = my_font.render('Game Over', False, WHITE)
    screen.blit(text_surface, (100, 200))
    pygame.display.update()

while win:
    for event in pygame.event.get():
        if event.type == QUIT:
            pygame.quit()
            sys.exit()
    screen.fill(BLACK)

    text_surface = my_font.render('Yay', False, WHITE)
    screen.blit(text_surface, (100, 200))
    pygame.display.update()

