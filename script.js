const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
let gameRunning = false;
let score = 0;
let speed = 2;
let gravity = 0.5;
let jumpStrength = -10;

// Procedural generation functions
function randomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomSize(min, max) {
    return Math.random() * (max - min) + min;
}

// Character class
class Character {
    constructor() {
        this.x = 100;
        this.y = canvas.height - 150;
        this.width = randomSize(30, 50);
        this.height = randomSize(40, 60);
        this.color = randomColor();
        this.velocityY = 0;
        this.onGround = true;
        this.wings = Math.random() > 0.5; // Randomly has wings or not
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if (this.wings) {
            // Draw wings
            ctx.fillStyle = randomColor();
            ctx.fillRect(this.x - 10, this.y + 5, 15, this.height - 10);
            ctx.fillRect(this.x + this.width - 5, this.y + 5, 15, this.height - 10);
        }
    }

    update() {
        this.velocityY += gravity;
        this.y += this.velocityY;

        if (this.y + this.height >= canvas.height - 100) {
            this.y = canvas.height - 100 - this.height;
            this.velocityY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }
    }

    jump() {
        if (this.onGround || this.wings) {
            this.velocityY = jumpStrength;
        }
    }
}

// Obstacle class
class Obstacle {
    constructor(x) {
        this.x = x;
        this.y = canvas.height - 100 - randomSize(20, 80);
        this.width = randomSize(20, 60);
        this.height = randomSize(30, 100);
        this.color = randomColor();
        this.type = Math.random() > 0.5 ? 'ground' : 'air'; // Ground or air obstacle
        if (this.type === 'air') {
            this.y = randomSize(100, canvas.height - 200);
        }
        // Make it unusual: random shape
        this.shape = Math.floor(Math.random() * 3); // 0: rect, 1: circle, 2: triangle
    }

    draw() {
        ctx.fillStyle = this.color;
        if (this.shape === 0) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.shape === 1) {
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width/2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    update() {
        this.x -= speed;
    }
}

// Background layers for parallax
class BackgroundLayer {
    constructor(speed, color, height) {
        this.speed = speed;
        this.color = color;
        this.height = height;
        this.x = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, canvas.height - this.height, canvas.width, this.height);
        ctx.fillRect(this.x + canvas.width, canvas.height - this.height, canvas.width, this.height);
    }

    update() {
        this.x -= this.speed;
        if (this.x <= -canvas.width) {
            this.x = 0;
        }
    }
}

// Game objects
let character = new Character();
let obstacles = [];
let backgroundLayers = [
    new BackgroundLayer(0.5, '#98FB98', 100), // Grass
    new BackgroundLayer(1, '#228B22', 50),   // Distant hills
    new BackgroundLayer(0.2, '#87CEEB', canvas.height) // Sky (but parallax)
];

// Generate obstacles
function generateObstacle() {
    if (Math.random() < 0.02) { // Low probability
        obstacles.push(new Obstacle(canvas.width));
    }
}

// Collision detection
function checkCollision() {
    for (let obs of obstacles) {
        if (character.x < obs.x + obs.width &&
            character.x + character.width > obs.x &&
            character.y < obs.y + obs.height &&
            character.y + character.height > obs.y) {
            gameRunning = false;
            alert('Game Over! Score: ' + score);
            resetGame();
        }
    }
}

// Reset game
function resetGame() {
    character = new Character();
    obstacles = [];
    score = 0;
    speed = 2;
}

// Update game
function update() {
    if (!gameRunning) return;

    backgroundLayers.forEach(layer => layer.update());
    character.update();
    obstacles.forEach(obs => obs.update());
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

    generateObstacle();
    checkCollision();

    score += 0.1;
    speed += 0.001; // Gradually increase speed
}

// Draw game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    backgroundLayers.forEach(layer => layer.draw());
    character.draw();
    obstacles.forEach(obs => obs.draw());

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + Math.floor(score), 10, 30);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Touch controls
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameRunning) {
        gameRunning = true;
    }
    character.jump();
});

// Start game
gameLoop();
