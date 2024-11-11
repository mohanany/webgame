const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 400;

let score = 0;
let gameOver = false;
let gameTime = 0; // Track the time
let level = 1;
let obstacleSpawnRate = 2000; // milliseconds
let speedBoost = false;
let health = 100; // New health system
const player = { x: 300, y: 200, size: 20, speed: 5, hasShield: false, shieldDuration: 3000 };
const shadow = { x: 0, y: 0, speed: 1.5 };
const obstacles = [];
const powerUps = [];
const enemies = [];
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.getElementById('restartButton').addEventListener('click', restartGame);

function movePlayer() {
    if (gameOver) return;

    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.size) player.x += player.speed;
}

function increaseLevel() {
    if (score % 1000 === 0) {
        level++;
        shadow.speed += 0.5;
        obstacleSpawnRate = Math.max(500, obstacleSpawnRate - 200);
    }
}

function checkGameGoal() {
    if (gameTime >= 60000) { // Win condition after 1 minute
        alert('You Win! You survived for 1 minute.');
        gameOver = true;
    }
}

function restartGame() {
    player.x = 300;
    player.y = 200;
    score = 0;
    gameTime = 0;
    health = 100; // Reset health
    gameOver = false;
    shadow.x = 0;
    shadow.y = 0;
    shadow.speed = 1.5;
    obstacles.length = 0;
    powerUps.length = 0;
    enemies.length = 0;
    document.getElementById('restartButton').style.display = 'none';
    gameLoop();
}

function gameLoop() {
    if (gameOver) return;

    gameTime += 1000 / 60;

    checkGameGoal();
    movePlayer();
    increaseLevel();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    score++;
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('timer').innerText = `Time: ${Math.floor(gameTime / 1000)}s`;

    let dx = player.x - shadow.x;
    let dy = player.y - shadow.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    shadow.x += (dx / distance) * shadow.speed;
    shadow.y += (dy / distance) * shadow.speed;

    drawPlayer();
    drawShadow();
    drawObstacles();
    drawPowerUps();
    drawEnemies();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

function drawPlayer() {
    ctx.fillStyle = player.hasShield ? 'cyan' : 'green';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawShadow() {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(shadow.x, shadow.y, 30, 0, Math.PI * 2);
    ctx.fill();
}

function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);
    });
}

function drawPowerUps() {
    ctx.fillStyle = 'yellow';
    powerUps.forEach(powerUp => {
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function checkCollisions() {
    if (!player.hasShield && Math.hypot(player.x - shadow.x, player.y - shadow.y) < 30) {
        gameOverCondition();
    }

    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.size &&
            player.x + player.size > obstacle.x &&
            player.y < obstacle.y + obstacle.size &&
            player.y + player.size > obstacle.y) {
            health -= 10;
            if (health <= 0) gameOverCondition();
        }
    });

    enemies.forEach(enemy => {
        if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < enemy.size) {
            health -= 20;
            if (health <= 0) gameOverCondition();
        }
    });

    powerUps.forEach((powerUp, index) => {
        if (Math.hypot(player.x - powerUp.x, player.y - powerUp.y) < 15) {
            activateShield();
            speedBoost = true;
            setTimeout(() => { speedBoost = false; }, 5000); // Speed boost duration
            powerUps.splice(index, 1);
        }
    });
}

function activateShield() {
    player.hasShield = true;
    setTimeout(() => {
        player.hasShield = false;
    }, player.shieldDuration);
}

function gameOverCondition() {
    alert('Game Over! You lost all health.');
    gameOver = true;
    document.getElementById('restartButton').style.display = 'block';
}

setInterval(() => {
    const size = 30;
    obstacles.push({
        x: Math.random() * (canvas.width - size),
        y: Math.random() * (canvas.height - size),
        size: size
    });
}, obstacleSpawnRate);

setInterval(() => {
    powerUps.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 10
    });
}, 10000);

setInterval(() => {
    enemies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 15
    });
}, 5000);

gameLoop();

