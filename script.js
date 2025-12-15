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
let gameRunning = true;
let score = 0;
let speed = 2;
let gravity = 0.5;
let jumpStrength = -10;
let gameOverTexts = [];

// Procedural generation functions
function randomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomSize(min, max) {
    return Math.random() * (max - min) + min;
}

function randomBool() {
    return Math.random() > 0.5;
}

// Character class
class Character {
    constructor() {
        this.x = 100;
        this.y = canvas.height - 150;
        this.width = randomSize(40, 60);
        this.height = randomSize(50, 70);
        this.velocityY = 0;
        this.onGround = true;
        this.svg = this.generateSVG();
        this.image = new Image();
        this.image.src = 'data:image/svg+xml;base64,' + btoa(this.svg);
    }

    generateSVG() {
        const bodyColor = randomColor();
        const headColor = randomColor();
        const wingColor = randomColor();
        const legColor = randomColor();
        const hasWings = randomBool();
        const hasSpikes = randomBool();
        const eyeCount = Math.floor(Math.random() * 3) + 1; // 1-3 eyes

        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        // Body (ellipse)
        svg += `<ellipse cx="${this.width/2}" cy="${this.height/2 + 10}" rx="${this.width/3}" ry="${this.height/3}" fill="${bodyColor}"/>`;

        // Head (circle)
        svg += `<circle cx="${this.width/2}" cy="${this.height/4}" r="${this.width/6}" fill="${headColor}"/>`;

        // Eyes
        for (let i = 0; i < eyeCount; i++) {
            const eyeX = this.width/2 + (i - (eyeCount-1)/2) * 8;
            svg += `<circle cx="${eyeX}" cy="${this.height/4 - 5}" r="3" fill="#000"/>`;
        }

        // Legs
        svg += `<rect x="${this.width/2 - 5}" y="${this.height/2 + 20}" width="3" height="15" fill="${legColor}"/>`;
        svg += `<rect x="${this.width/2 + 2}" y="${this.height/2 + 20}" width="3" height="15" fill="${legColor}"/>`;

        if (hasWings) {
            // Wings (triangles)
            svg += `<polygon points="${this.width/2 - 15},${this.height/2} ${this.width/2 - 5},${this.height/2 - 10} ${this.width/2 - 5},${this.height/2 + 10}" fill="${wingColor}"/>`;
            svg += `<polygon points="${this.width/2 + 5},${this.height/2} ${this.width/2 + 15},${this.height/2 - 10} ${this.width/2 + 5},${this.height/2 + 10}" fill="${wingColor}"/>`;
        }

        if (hasSpikes) {
            // Spikes on back
            for (let i = 0; i < 3; i++) {
                const spikeX = this.width/2 + (i - 1) * 8;
                svg += `<polygon points="${spikeX-2},${this.height/2 - 5} ${spikeX},${this.height/2 - 15} ${spikeX+2},${this.height/2 - 5}" fill="${randomColor()}"/>`;
            }
        }

        svg += '</svg>';
        return svg;
    }

    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            this.image.onload = () => ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
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
        this.velocityY = jumpStrength;
    }
}

// Obstacle class
class Obstacle {
    constructor(x) {
        this.x = x;
        this.width = randomSize(30, 80);
        this.height = randomSize(40, 120);
        this.type = Math.random() > 0.5 ? 'ground' : 'air'; // Ground or air obstacle
        if (this.type === 'ground') {
            this.y = canvas.height - 100 - this.height;
        } else {
            this.y = randomSize(100, canvas.height - 200 - this.height);
        }
        this.svg = this.generateSVG();
        this.image = new Image();
        this.image.src = 'data:image/svg+xml;base64,' + btoa(this.svg);
    }

    generateSVG() {
        const objectTypes = ['tree', 'rock', 'cloud', 'house', 'car', 'animal'];
        const objectType = objectTypes[Math.floor(Math.random() * objectTypes.length)];

        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        const color1 = randomColor();
        const color2 = randomColor();
        const color3 = randomColor();

        switch (objectType) {
            case 'tree':
                // Unusual tree: with fruits or flowers
                svg += `<rect x="${this.width/2 - 5}" y="${this.height - 20}" width="10" height="20" fill="#8B4513"/>`;
                svg += `<ellipse cx="${this.width/2}" cy="${this.height/2}" rx="${this.width/2}" ry="${this.height/2}" fill="${color1}"/>`;
                // Add unusual elements: eyes or mouth
                svg += `<circle cx="${this.width/2 - 5}" cy="${this.height/2 - 10}" r="3" fill="#000"/>`;
                svg += `<circle cx="${this.width/2 + 5}" cy="${this.height/2 - 10}" r="3" fill="#000"/>`;
                svg += `<ellipse cx="${this.width/2}" cy="${this.height/2 + 5}" rx="4" ry="2" fill="#000"/>`;
                break;
            case 'rock':
                // Unusual rock: with crystals or faces
                svg += `<ellipse cx="${this.width/2}" cy="${this.height/2}" rx="${this.width/2}" ry="${this.height/2}" fill="${color1}"/>`;
                // Add crystals
                for (let i = 0; i < 3; i++) {
                    const cx = this.width/2 + (Math.random() - 0.5) * this.width/2;
                    const cy = this.height/2 + (Math.random() - 0.5) * this.height/2;
                    svg += `<polygon points="${cx-3},${cy+5} ${cx},${cy-5} ${cx+3},${cy+5}" fill="${color2}"/>`;
                }
                break;
            case 'cloud':
                // Unusual cloud: with faces or lightning
                svg += `<ellipse cx="${this.width/3}" cy="${this.height/2}" rx="${this.width/3}" ry="${this.height/3}" fill="${color1}"/>`;
                svg += `<ellipse cx="${this.width/2}" cy="${this.height/2}" rx="${this.width/3}" ry="${this.height/3}" fill="${color1}"/>`;
                svg += `<ellipse cx="${2*this.width/3}" cy="${this.height/2}" rx="${this.width/3}" ry="${this.height/3}" fill="${color1}"/>`;
                // Add face
                svg += `<circle cx="${this.width/2 - 10}" cy="${this.height/2 - 5}" r="2" fill="#000"/>`;
                svg += `<circle cx="${this.width/2 + 10}" cy="${this.height/2 - 5}" r="2" fill="#000"/>`;
                svg += `<ellipse cx="${this.width/2}" cy="${this.height/2 + 5}" rx="3" ry="1" fill="#000"/>`;
                break;
            case 'house':
                // Unusual house: floating or with weird features
                svg += `<rect x="${this.width/4}" y="${this.height/2}" width="${this.width/2}" height="${this.height/2}" fill="${color1}"/>`;
                svg += `<polygon points="${this.width/4},${this.height/2} ${this.width/2},${this.height/4} ${3*this.width/4},${this.height/2}" fill="${color2}"/>`;
                // Add windows with eyes
                svg += `<rect x="${this.width/3}" y="${this.height/2 + 10}" width="8" height="8" fill="#87CEEB"/>`;
                svg += `<circle cx="${this.width/3 + 2}" cy="${this.height/2 + 12}" r="1" fill="#000"/>`;
                svg += `<circle cx="${this.width/3 + 6}" cy="${this.height/2 + 12}" r="1" fill="#000"/>`;
                svg += `<rect x="${this.width/2 + 5}" y="${this.height/2 + 10}" width="8" height="8" fill="#87CEEB"/>`;
                svg += `<circle cx="${this.width/2 + 7}" cy="${this.height/2 + 12}" r="1" fill="#000"/>`;
                svg += `<circle cx="${this.width/2 + 11}" cy="${this.height/2 + 12}" r="1" fill="#000"/>`;
                break;
            case 'car':
                // Unusual car: with animal features
                svg += `<rect x="${this.width/6}" y="${this.height/2}" width="${2*this.width/3}" height="${this.height/3}" fill="${color1}"/>`;
                svg += `<ellipse cx="${this.width/6}" cy="${this.height - 10}" rx="8" ry="5" fill="#000"/>`;
                svg += `<ellipse cx="${5*this.width/6}" cy="${this.height - 10}" rx="8" ry="5" fill="#000"/>`;
                // Add headlights with eyes
                svg += `<circle cx="${this.width/6 - 5}" cy="${this.height/2 + 5}" r="3" fill="#FFFF00"/>`;
                svg += `<circle cx="${5*this.width/6 + 5}" cy="${this.height/2 + 5}" r="3" fill="#FFFF00"/>`;
                svg += `<circle cx="${this.width/6 - 5}" cy="${this.height/2 + 5}" r="1" fill="#000"/>`;
                svg += `<circle cx="${5*this.width/6 + 5}" cy="${this.height/2 + 5}" r="1" fill="#000"/>`;
                break;
            case 'animal':
                // Unusual animal: mix of features
                svg += `<ellipse cx="${this.width/2}" cy="${this.height/2}" rx="${this.width/3}" ry="${this.height/3}" fill="${color1}"/>`;
                svg += `<circle cx="${this.width/2}" cy="${this.height/4}" r="${this.width/8}" fill="${color2}"/>`;
                // Legs
                svg += `<rect x="${this.width/2 - 8}" y="${this.height/2 + 10}" width="3" height="15" fill="${color3}"/>`;
                svg += `<rect x="${this.width/2 - 3}" y="${this.height/2 + 10}" width="3" height="15" fill="${color3}"/>`;
                svg += `<rect x="${this.width/2 + 2}" y="${this.height/2 + 10}" width="3" height="15" fill="${color3}"/>`;
                svg += `<rect x="${this.width/2 + 7}" y="${this.height/2 + 10}" width="3" height="15" fill="${color3}"/>`;
                // Eyes
                svg += `<circle cx="${this.width/2 - 5}" cy="${this.height/4 - 3}" r="2" fill="#000"/>`;
                svg += `<circle cx="${this.width/2 + 5}" cy="${this.height/4 - 3}" r="2" fill="#000"/>`;
                break;
        }

        svg += '</svg>';
        return svg;
    }

    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            this.image.onload = () => ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
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
    new BackgroundLayer(0.2, '#87CEEB', canvas.height), // Sky
    new BackgroundLayer(1, '#228B22', 50),   // Distant hills
    new BackgroundLayer(0.5, '#98FB98', 100) // Grass
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
            showGameOver();
        }
    }
}

// Show game over modal
function showGameOver() {
    const randomText = gameOverTexts[Math.floor(Math.random() * gameOverTexts.length)];
    document.getElementById('gameOverText').textContent = randomText;
    document.getElementById('gameOverScore').textContent = 'Score: ' + Math.floor(score);
    document.getElementById('gameOverModal').style.display = 'flex';

    // Text-to-speech
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(randomText);
        window.speechSynthesis.speak(utterance);
    }
}

// Reset game
function resetGame() {
    character = new Character();
    obstacles = [];
    score = 0;
    speed = 2;
    gameRunning = true;
    document.getElementById('gameOverModal').style.display = 'none';
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

// Mouse controls for PC testing
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (!gameRunning) {
        gameRunning = true;
    }
    character.jump();
});

// Load game over texts
fetch('texts.txt')
    .then(response => response.text())
    .then(text => {
        gameOverTexts = text.split('\n').filter(line => line.trim() !== '');
    })
    .catch(error => console.error('Error loading texts:', error));

// Restart button event
document.getElementById('restartButton').addEventListener('click', resetGame);

// Start game
gameLoop();
