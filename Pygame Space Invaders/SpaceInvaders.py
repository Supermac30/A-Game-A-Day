import pygame
import sys
from pygame.locals import *
clock = pygame.time.Clock()


class Enemy:
    # TODO
    def __init__(self):
        pass


class Bullet:
    def __init__(self, x, y):
        self.x, self.y = x, y
        self.speed = 7
        self.rect = pygame.rect.Rect((x, y, 4, 8))

    def draw(self, surface):
        pygame.draw.rect(surface, WHITE, self.rect)

    def update(self):
        self.y -= self.speed
        self.rect.move_ip(0, -self.speed)


class Player:
    def __init__(self):
        self.x, self.y = 180, 380
        self.cooldown = False
        self.rect = pygame.rect.Rect((self.x, self.y, 20, 20))
        self.bullets = []

    def draw(self, surface):
        pygame.draw.rect(surface, BLUE, self.rect)
        for bullet in self.bullets:
            bullet.draw(surface)

    def input(self):
        keys = pygame.key.get_pressed()
        speed = last_call // 2
        if keys[pygame.K_LEFT]:
            self.rect.move_ip(-speed, 0)
            self.x -= speed
        if keys[pygame.K_RIGHT]:
            self.rect.move_ip(speed, 0)
            self.x += speed
        if keys[pygame.K_SPACE] and not self.cooldown:
            self.shoot()
            self.cooldown = True

    def shoot(self):
        self.bullets.append(Bullet(self.x + 8, self.y))

    def update(self):
        for bullet in self.bullets:
            bullet.update()


pygame.init()
size = width, height = 400, 400
screen = pygame.display.set_mode(size)
player = Player()

last_call = 0

WHITE = (255, 255, 255)
BLUE = (0, 0, 255)
BLACK = (0, 0, 0)

while True:
    for event in pygame.event.get():
        if event.type == QUIT:
            pygame.quit()
            sys.exit()

    screen.fill(BLACK)

    player.input()
    player.draw(screen)
    player.update()
    pygame.display.update()

    if pygame.time.get_ticks() % 10 == 0:
        player.cooldown = False

    last_call = clock.tick(60)
