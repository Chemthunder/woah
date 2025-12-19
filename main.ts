// registry
namespace SpriteKind {
    export let Particle = SpriteKind.create();
    export let Empty = SpriteKind.create();
    export let GuiElement = SpriteKind.create();
    export let VisualEffect = SpriteKind.create();
}
let gameTicks = 50;
let ticks = 0;
let isDashing = false;
let gameActive = true;
let playerSpriteImage = img`
    1 1 1 1 1
    1 . . . 1
    1 . . . 1
    1 . . . 1
    1 1 1 1 1
`
let lifeSpriteImage = img`
    . 1 1 1 2 .
    . 1 1 1 1 .
    . 1 2 2 1 .
    . 1 2 1 1 .
    . 1 1 1 1 .
    . 2 1 1 1 .
`
let dashParImage = img`
    1 1 1
    1 1 1
    1 1 1
`
let enemySpriteImage = img`
    2 2 2 2 2 2
    2 . . . . 2
    2 . . . . 2
    2 . . . . 2
    2 . . . . 2
    2 2 2 2 2 2
`
let timerImg = img`
    .
`

// anim frames
let dash1 = img`
    1 . 1
    . 1 .
    1 . 1
`
let dash2 = img`
    . 1 .
    1 . 1
    . 1 .
`

let playerMoving = img`
    . . . . .
    . 1 1 1 .
    . 1 1 1 .
    . 1 1 1 .
    . . . . .
`
let playerStoppedMoving = img`
    1 1 1 1 1
    1 . . . 1
    1 . . . 1
    1 . . . 1
    1 1 1 1 1
`

// ticking
forever(function () {
    if (gameTicks != 0) {
        gameTicks--;
    } else {
        resetAndSpawn();
    }

    if (gameActive) {
        ticks++;

    }
    timer.sayText(ticks, 90, false, 1, 15);
});


// sprites
let player = sprites.create(playerSpriteImage, SpriteKind.Player);
let timer = sprites.create(timerImg, SpriteKind.GuiElement)


// constants
info.setBackgroundColor(15);
info.setBorderColor(1);
info.setFontColor(1);
info.setLifeImage(lifeSpriteImage);
info.setLife(3);
controller.moveSprite(player, 100, 100);
player.setFlag(SpriteFlag.StayInScreen, true);

timer.setPosition(screen.width / 2, screen.height - 100);

timer.z = 1
player.z = 2
// functions
function dash() {
    controller.moveSprite(player, 200, 200);
    scene.cameraShake(4, 100);
    isDashing = true;
    info.changeScoreBy(-2);
    for (let i = 0; i < 15; i++) {
        let dashParticle = sprites.create(dashParImage, SpriteKind.Particle);
        dashParticle.setPosition(player.x + randint(-2, 2), player.y + randint(-2, 2));
        dashParticle.vx = randint(-75, 75)
        dashParticle.vy = randint(-75, 75);
        dashParticle.setFlag(SpriteFlag.AutoDestroy, true);
        dashParticle.setFlag(SpriteFlag.Ghost, true);
        animation.runImageAnimation(dashParticle, [
            dash1,
            dash2
        ], 50, true);
        pause(25);
    }

    pause(50);
    controller.moveSprite(player, 100, 100);
    isDashing = false;
}

function resetAndSpawn() {
    if (gameActive) {
        gameTicks = randint(10, 300);

        let enemy = sprites.create(enemySpriteImage, SpriteKind.Enemy);
        enemy.setPosition(player.x + randint(-100, 100), player.y + randint(-100, 100));
        enemy.follow(player, randint(10, 99));
        enemy.setFlag(SpriteFlag.GhostThroughSprites, false);
        info.changeScoreBy(1);
        enemy.z = 2
    }
}

// events
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (info.score() > 1) {
        dash();
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite: Sprite, otherSprite: Sprite) {
    if (!isDashing) {
        info.changeLifeBy(-1);
        scene.cameraShake(1, 250);
        sprites.destroy(otherSprite, effects.ashes, randint(150, 200));
    } else {
        sprites.destroy(otherSprite, effects.disintegrate, 150);
        info.changeLifeBy(1)
    }
})

info.onLifeZero(function () {
    controller.moveSprite(player, 0, 0);
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy);

    pause(250);
    sprites.destroy(player, effects.ashes, 100);
    gameActive = false;
    info.setScore(0);

})

info.onScore(1, function () {
    gameActive = false;
    controller.moveSprite(player, 0, 0)
    player.vx = 0;
    player.vy = 0;
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy, effects.disintegrate);

    animation.runMovementAnimation(
        player,
        animation.animationPresets(animation.flyToCenter),
        2000, false);

    animation.stopAnimation(animation.AnimationTypes.All, timer)
    animation.runMovementAnimation(timer,
        animation.animationPresets(animation.easeDown),
        2000, false)

    
})


// player anims
if (gameActive = true) {
    characterAnimations.loopFrames(
        player,
        [
            playerMoving
        ],
        10,
        characterAnimations.rule(Predicate.Moving));

    characterAnimations.loopFrames(
        player,
        [
            playerStoppedMoving
        ],
        10,
        characterAnimations.rule(Predicate.NotMoving));
}
animation.runMovementAnimation(timer,
    animation.animationPresets(animation.bobbing), 2000, true)