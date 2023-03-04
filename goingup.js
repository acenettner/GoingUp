var canvas = document.getElementById('c');
var ctx = canvas.getContext('2d');
var lastTime = 0;
const GAME_WIDTH = 256;
const GAME_HEIGHT = 256;
const PLAYER_WIDTH = 16;
const PLAYER_HEIGHT = 16;
const PLAYER_SPEED = 3;
const PLATFORM_WIDTH = 64;
const PLATFORM_HEIGHT = 8;
var playerSpeed = 0;
var jumpForce = 8;
var jumpTime = 0;
var displacement = 0.5 * jumpTime * jumpTime;
var jumping = false;
var falling = false;
var grounded = true;
var platformed = false;
var movR = 0;
var movL = 0;
var score = 0;
var paused = false;
var pauseReady = true;
var gameOver = false;
var player = {
    x: (GAME_WIDTH / 2) - (PLAYER_WIDTH / 2),
    y: GAME_HEIGHT - PLAYER_HEIGHT,
    w: PLAYER_WIDTH,
    h: PLAYER_HEIGHT
}
var p1 = {
    x: GAME_WIDTH/2 - PLATFORM_WIDTH/2,
    y: 0,
    w: PLATFORM_WIDTH,
    h: PLATFORM_HEIGHT
}
var p2 = {
    x: GAME_WIDTH/2- PLATFORM_WIDTH/2,
    y: 136,
    w: PLATFORM_WIDTH,
    h: PLATFORM_HEIGHT
}
var platforms = [p1, p2];
draw();

// updates all game objects on screen
function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = 'azure';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = 'tan';

    // Bound player
    if (movR > 0 && player.x >= GAME_WIDTH - PLAYER_WIDTH) {
        movR = 0;
    }
    if (movL < 0 && player.x <= 0) {
        movL = 0;
    }
    player.x += movR + movL;

    ctx.fillRect(player.x, player.y, player.w, player.h);
    for (var i = 0; i < platforms.length; i++) {
        platforms[i].y += 1;
        ctx.fillRect(platforms[i].x, platforms[i].y, platforms[i].w, platforms[i].h);
        if (platforms[i].y >= GAME_HEIGHT) {
            platforms[i].x = Math.floor(Math.random() * 8 + 4) * 16 - PLAYER_WIDTH;
            platforms[i].y = -PLAYER_HEIGHT;
        }
    }
}

function reset() {
    document.getElementById('gotext').innerHTML = '';
    gameOver = false;
    paused = false;
    score = 0;
    grounded = true;
    movR = 0;
    movL = 0;
    player.x = GAME_WIDTH/2- player.w/2;
    player.y = GAME_HEIGHT - player.h;
    p1.x = GAME_WIDTH/2- PLATFORM_WIDTH/2;
    p2.x = GAME_WIDTH/2- PLATFORM_WIDTH/2;
    p1.y = 0;
    p2.y = 136;
}

function input() {
    // Move player, jump
    document.addEventListener("keydown", (event)=> {
        playerSpeed = 0;
        if (event.key == 'ArrowRight') {
            movR = PLAYER_SPEED;
        }
        if (event.key == 'ArrowLeft') {
            movL = -PLAYER_SPEED;
        }
        if ((platformed || grounded) && event.key == ' ') {
            jumping = true;
            grounded = false;
            platformed = false;
        }

        if (event.key == 'Enter') {
            if (pauseReady && !gameOver) {
                paused = !paused;
                pauseReady = false;
            } else if (gameOver) {
                pauseReady = false;
                reset();
            }
        }
    })

    // Stops player when key is no longer pressed
    document.addEventListener("keyup", (event)=> {
        if (event.key == 'ArrowRight') {
            movR = 0;
        }
        if (event.key == 'ArrowLeft') {
            movL = 0;
        }
        if (event.key == 'Enter') {
            pauseReady = true;
        }
    })
}

function Jump(time) {
    time /= 100;
    jumpTime += time;
    displacement = 0.5 * jumpTime * jumpTime;
    player.y += (-jumpForce + displacement);
    if (jumpForce < displacement) {
        falling = true;
        jumping = false;
    }
}

function Fall(time) {
    time /= 100;
    jumpTime += time;
    displacement = 0.5 * jumpTime * jumpTime;
    player.y += (-jumpForce + displacement);
    if (player.y >= GAME_HEIGHT - PLAYER_HEIGHT) {
        jumpTime = 0;
        falling = false;
        player.y = GAME_HEIGHT - PLAYER_HEIGHT;
    }
}

// Allows player to land on platforms
function collisionPlatform() {
    for (var i = 0; i < platforms.length; i++) {

        // If the player collides with a platform, stop them from falling through
        if (falling && (collisionCheck(player, platforms[i])) && (player.y + player.h - platforms[i].y) > 0.05) {
            player.y = platforms[i].y - player.h * 0.75;
            platformed = true;
            falling = false;
            jumpTime = 0;
        }

        // If the player is on the current platform, keep them there
        if (platformed && collisionCheck(player, platforms[i])) {
            player.y = platforms[i].y - player.h * 0.75;
            platformed = true;
        }

        // If the player walks off the platform, make them fall
        if (platformed && Math.abs(player.y + player.h - platforms[i].y) < 6 && (player.x + player.w < platforms[i].x  || player.x > platforms[i].x + platforms[i].w)) {
            falling = true;
            platformed = false;
            jumpTime = 4;
        }
    }
}

// Checks for collisions between two objects
function collisionCheck(ob1, ob2) {
    // If the equations below are > 0, we know the second object (after minus) is between the first object's position and width
    var x1 = ob1.x + ob1.w - ob2.x;
    var x2 = ob2.x + ob2.w - ob1.x;
    var y1 = ob1.y + ob1.h - ob2.y;
    var y2 = ob2.y + ob2.h - ob1.y;
    if (((x1 > 0 && x1 <= ob1.w) || (x2 > 0 && x2 <= ob2.w))
        && ((y1 > 0 && y1 <= ob1.h)|| (y2 > 0 && y2 <= ob2.h))) 
    {
        return true;
    }
}

function gameLoop(timestamp) {
    var deltaTime = timestamp - lastTime; //Use this when time is needed for other functions
    lastTime = timestamp;
    input();
    if (!paused && !gameOver) {
        if (!grounded) {
            score += deltaTime / 100;
            document.getElementById('score').innerHTML = 'Score: ' + Math.trunc(score);
        }
        if (jumping) {
            Jump(deltaTime);
        } else if (falling) {
            Fall(deltaTime);
        }
        draw();
        collisionPlatform();
        if (!grounded && player.y >= GAME_HEIGHT - PLAYER_HEIGHT) {
            gameOver = true;
            document.getElementById('gotext').innerHTML = 'Game Over!<br>Press Enter to restart';
        }
    }
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);