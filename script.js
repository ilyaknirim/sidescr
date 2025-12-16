const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.5;
const JUMP_STRENGTH = -10;
const INITIAL_SPEED = 2;
const MAX_SPEED = 8;
const GROUND_HEIGHT = 100;
const DEFAULT_TEXTS = [
    "Ой, кажется, ты столкнулся с препятствием! Попробуй еще раз.",
    "Упс, игра окончена! Но ты был близок к рекорду.",
    "Не расстраивайся, следующий раз повезет больше.",
    "Игра окончена, но опыт получен! Продолжай тренироваться.",
    "Ты справился отлично, но в этот раз не повезло."
];

// Game state
let gameRunning = true;
let score = 0;
let speed = INITIAL_SPEED;
let frameCount = 0;
let gameOverTexts = [];
let character, obstacles, backgroundElements;

// Utility functions
const random = {
    color: () => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    size: (min, max) => Math.random() * (max - min) + min,
    bool: () => Math.random() > 0.5,
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
};

// Canvas setup
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Character class
class Character {
    constructor() {
        this.x = 100;
        this.y = canvas.height - GROUND_HEIGHT - 50;
        this.width = random.size(40, 60);
        this.height = random.size(50, 70);
        this.velocityY = 0;
        this.onGround = true;
        this.svg = this.generateSVG();
        this.image = new Image();
        this.image.src = 'data:image/svg+xml;base64,' + btoa(this.svg);
    }

    generateSVG() {
        const bodyColor = random.color();
        const headColor = random.color();
        const wingColor = random.color();
        const legColor = random.color();
        const hasWings = random.bool();
        const hasSpikes = random.bool();
        const eyeCount = random.int(1, 3);
        const hasTail = random.bool();
        const hasAntenna = random.bool();
        const mouthType = random.int(0, 2);

        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        // Shadow
        svg += `<ellipse cx="${this.width/2}" cy="${this.height - 5}" rx="${this.width/3}" ry="3" fill="#00000030"/>`;

        // Body
        svg += `<ellipse cx="${this.width/2}" cy="${this.height/2 + 10}" rx="${this.width/2.5}" ry="${this.height/3}" fill="${bodyColor}" stroke="#00000020" stroke-width="1"/>`;
        svg += `<ellipse cx="${this.width/2}" cy="${this.height/2 + 15}" rx="${this.width/4}" ry="${this.height/5}" fill="${bodyColor}CC" stroke="#00000010" stroke-width="0.5"/>`;

        // Head
        svg += `<circle cx="${this.width/2}" cy="${this.height/4}" r="${this.width/5}" fill="${headColor}" stroke="#00000020" stroke-width="1"/>`;

        // Cheeks
        if (random.bool()) {
            svg += `<circle cx="${this.width/2 - this.width/6}" cy="${this.height/4 + 2}" r="${this.width/12}" fill="#FF6B6B50"/>`;
            svg += `<circle cx="${this.width/2 + this.width/6}" cy="${this.height/4 + 2}" r="${this.width/12}" fill="#FF6B6B50"/>`;
        }

        // Eyes
        for (let i = 0; i < eyeCount; i++) {
            const eyeX = this.width/2 + (i - (eyeCount-1)/2) * 8;
            svg += `<circle cx="${eyeX}" cy="${this.height/4 - 5}" r="4" fill="#FFFFFF" stroke="#00000050" stroke-width="0.5"/>`;
            svg += `<circle cx="${eyeX}" cy="${this.height/4 - 5}" r="2" fill="#000000"/>`;
            svg += `<circle cx="${eyeX + 0.5}" cy="${this.height/4 - 5.5}" r="0.8" fill="#FFFFFF"/>`;
        }

        // Mouth
        if (mouthType === 0) {
            svg += `<path d="M ${this.width/2 - 5} ${this.height/4 + 5} Q ${this.width/2} ${this.height/4 + 8} ${this.width/2 + 5} ${this.height/4 + 5}" stroke="#00000070" stroke-width="1" fill="none"/>`;
        } else if (mouthType === 1) {
            svg += `<ellipse cx="${this.width/2}" cy="${this.height/4 + 7}" rx="4" ry="3" fill="#00000070"/>`;
        } else {
            svg += `<line x1="${this.width/2 - 4}" y1="${this.height/4 + 6}" x2="${this.width/2 + 4}" y2="${this.height/4 + 6}" stroke="#00000070" stroke-width="1"/>`;
        }

        // Legs
        svg += `<rect x="${this.width/2 - 7}" y="${this.height/2 + 20}" width="4" height="15" rx="2" fill="${legColor}" stroke="#00000020" stroke-width="0.5"/>`;
        svg += `<ellipse cx="${this.width/2 - 5}" cy="${this.height/2 + 35}" rx="3" ry="2" fill="${legColor}" stroke="#00000020" stroke-width="0.5"/>`;
        svg += `<rect x="${this.width/2 + 3}" y="${this.height/2 + 20}" width="4" height="15" rx="2" fill="${legColor}" stroke="#00000020" stroke-width="0.5"/>`;
        svg += `<ellipse cx="${this.width/2 + 5}" cy="${this.height/2 + 35}" rx="3" ry="2" fill="${legColor}" stroke="#00000020" stroke-width="0.5"/>`;

        // Arms
        if (random.bool()) {
            svg += `<rect x="${this.width/2 - this.width/2.5}" y="${this.height/2 + 5}" width="3" height="12" rx="1.5" fill="${bodyColor}" stroke="#00000020" stroke-width="0.5"/>`;
            svg += `<circle cx="${this.width/2 - this.width/2.5 + 1.5}" cy="${this.height/2 + 18}" r="2" fill="${bodyColor}" stroke="#00000020" stroke-width="0.5"/>`;
            svg += `<rect x="${this.width/2 + this.width/2.5 - 3}" y="${this.height/2 + 5}" width="3" height="12" rx="1.5" fill="${bodyColor}" stroke="#00000020" stroke-width="0.5"/>`;
            svg += `<circle cx="${this.width/2 + this.width/2.5 - 1.5}" cy="${this.height/2 + 18}" r="2" fill="${bodyColor}" stroke="#00000020" stroke-width="0.5"/>`;
        }

        // Wings
        if (hasWings) {
            svg += `<path d="M ${this.width/2 - 15} ${this.height/2} Q ${this.width/2 - 25} ${this.height/2 - 5} ${this.width/2 - 15} ${this.height/2 - 10} Q ${this.width/2 - 10} ${this.height/2 - 5} ${this.width/2 - 5} ${this.height/2}" fill="${wingColor}" stroke="#00000020" stroke-width="0.5"/>`;
            svg += `<path d="M ${this.width/2 + 15} ${this.height/2} Q ${this.width/2 + 25} ${this.height/2 - 5} ${this.width/2 + 15} ${this.height/2 - 10} Q ${this.width/2 + 10} ${this.height/2 - 5} ${this.width/2 + 5} ${this.height/2}" fill="${wingColor}" stroke="#00000020" stroke-width="0.5"/>`;
        }

        // Tail
        if (hasTail) {
            const tailType = random.int(0, 2);
            if (tailType === 0) {
                svg += `<rect x="${this.width/2 + this.width/3}" y="${this.height/2 + 5}" width="15" height="5" rx="2.5" fill="${bodyColor}" stroke="#00000020" stroke-width="0.5"/>`;
            } else if (tailType === 1) {
                svg += `<path d="M ${this.width/2 + this.width/3} ${this.height/2 + 7} Q ${this.width/2 + this.width/3 + 10} ${this.height/2 + 2} ${this.width/2 + this.width/3 + 15} ${this.height/2 + 7}" stroke="${bodyColor}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
            } else {
                for (let i = 0; i < 5; i++) {
                    const tailY = this.height/2 + 5 + (i - 2) * 2;
                    const tailLength = 10 + Math.random() * 5;
                    svg += `<line x1="${this.width/2 + this.width/3}" y1="${tailY}" x2="${this.width/2 + this.width/3 + tailLength}" y2="${tailY + (Math.random() - 0.5) * 4}" stroke="${bodyColor}" stroke-width="2" stroke-linecap="round"/>`;
                }
            }
        }

        // Spikes
        if (hasSpikes) {
            for (let i = 0; i < 3; i++) {
                const spikeX = this.width/2 + (i - 1) * 8;
                svg += `<path d="M ${spikeX-2} ${this.height/2 - 5} L ${spikeX} ${this.height/2 - 15} L ${spikeX+2} ${this.height/2 - 5} Z" fill="${random.color()}" stroke="#00000030" stroke-width="0.5"/>`;
            }
        }

        // Antenna
        if (hasAntenna) {
            const antennaCount = random.int(1, 2);
            for (let i = 0; i < antennaCount; i++) {
                const antennaX = this.width/2 + (i - (antennaCount-1)/2) * 6;
                svg += `<line x1="${antennaX}" y1="${this.height/4 - this.width/6}" x2="${antennaX}" y2="${this.height/4 - this.width/6 - 8}" stroke="#00000050" stroke-width="1.5" stroke-linecap="round"/>`;
                svg += `<circle cx="${antennaX}" cy="${this.height/4 - this.width/6 - 8}" r="2" fill="${random.color()}" stroke="#00000030" stroke-width="0.5"/>`;
            }
        }

        svg += '</svg>';
        return svg;
    }

    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.velocityY += GRAVITY;
        this.y += this.velocityY;

        if (this.y + this.height >= canvas.height - GROUND_HEIGHT) {
            this.y = canvas.height - GROUND_HEIGHT - this.height;
            this.velocityY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }
    }

    jump() {
        this.velocityY = JUMP_STRENGTH;
    }
}

// Obstacle class
class Obstacle {
    constructor(x) {
        this.x = x;
        this.width = random.size(30, 80);
        this.height = random.size(40, 120);
        this.type = random.bool() ? 'ground' : 'air';
        this.y = this.type === 'ground' ? 
            canvas.height - GROUND_HEIGHT - this.height : 
            random.size(100, canvas.height - 200 - this.height);
        this.svg = this.generateSVG();
        this.image = new Image();
        this.image.src = 'data:image/svg+xml;base64,' + btoa(this.svg);
    }

    generateSVG() {
        const types = ['tree', 'rock', 'cloud', 'house', 'car', 'animal', 'mushroom', 'flower'];
        const type = types[random.int(0, types.length - 1)];
        const color = random.color();

        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        switch(type) {
            case 'tree':
                svg += `<rect x="${this.width/2 - this.width/6}" y="${this.height/2}" width="${this.width/3}" height="${this.height/2}" fill="#8B4513" stroke="#00000030" stroke-width="1"/>`;
                svg += `<circle cx="${this.width/2}" cy="${this.height/3}" r="${this.width/2.5}" fill="#228B22" stroke="#00000030" stroke-width="1"/>`;
                break;
            case 'rock':
                svg += `<ellipse cx="${this.width/2}" cy="${this.height/2}" rx="${this.width/2}" ry="${this.height/2}" fill="#808080" stroke="#00000030" stroke-width="1"/>`;
                svg += `<line x1="${this.width/3}" y1="${this.height/3}" x2="${this.width/2}" y2="${this.height/1.5}" stroke="#606060" stroke-width="1"/>`;
                svg += `<line x1="${this.width/1.5}" y1="${this.height/3}" x2="${this.width/2}" y2="${this.height/1.5}" stroke="#606060" stroke-width="1"/>`;
                break;
            case 'cloud':
                svg += `<circle cx="${this.width/3}" cy="${this.height/2}" r="${this.width/3}" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1"/>`;
                svg += `<circle cx="${this.width/1.5}" cy="${this.height/2}" r="${this.width/3}" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1"/>`;
                svg += `<circle cx="${this.width/2}" cy="${this.height/2.5}" r="${this.width/2.5}" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1"/>`;
                break;
            case 'house':
                svg += `<rect x="${this.width/6}" y="${this.height/2}" width="${this.width*2/3}" height="${this.height/2}" fill="${color}" stroke="#00000030" stroke-width="1"/>`;
                svg += `<path d="M ${this.width/6} ${this.height/2} L ${this.width/2} ${this.height/4} L ${this.width*5/6} ${this.height/2} Z" fill="#8B0000" stroke="#00000030" stroke-width="1"/>`;
                svg += `<rect x="${this.width/2 - this.width/8}" y="${this.height/2 + this.height/8}" width="${this.width/4}" height="${this.width/4}" fill="#87CEEB" stroke="#00000030" stroke-width="1"/>`;
                svg += `<rect x="${this.width/2 - this.width/12}" y="${this.height/2 + this.height/3}" width="${this.width/6}" height="${this.height/6}" fill="#654321" stroke="#00000030" stroke-width="1"/>`;
                break;
            case 'car':
                svg += `<rect x="${this.width/6}" y="${this.height/2.5}" width="${this.width*2/3}" height="${this.height/3}" fill="${color}" stroke="#00000030" stroke-width="1"/>`;
                svg += `<rect x="${this.width/3}" y="${this.height/4}" width="${this.width/3}" height="${this.height/6}" fill="#87CEEB" stroke="#00000030" stroke-width="1"/>`;
                svg += `<circle cx="${this.width/3}" cy="${this.height*5/6}" r="${this.height/10}" fill="#000000" stroke="#333333" stroke-width="1"/>`;
                svg += `<circle cx="${this.width*2/3}" cy="${this.height*5/6}" r="${this.height/10}" fill="#000000" stroke="#333333" stroke-width="1"/>`;
                break;
            case 'animal':
                svg += `<ellipse cx="${this.width/2}" cy="${this.height/2}" rx="${this.width/2.5}" ry="${this.height/3}" fill="${color}" stroke="#00000030" stroke-width="1"/>`;
                svg += `<circle cx="${this.width/4}" cy="${this.height/2.5}" r="${this.width/5}" fill="${color}" stroke="#00000030" stroke-width="1"/>`;
                svg += `<rect x="${this.width/3}" y="${this.height/2 + this.height/6}" width="${this.width/10}" height="${this.height/4}" fill="${color}" stroke="#00000030" stroke-width="1"/>`;
                svg += `<rect x="${this.width/2}" y="${this.height/2 + this.height/6}" width="${this.width/10}" height="${this.height/4}" fill="${color}" stroke="#00000030" stroke-width="1"/>`;
                svg += `<path d="M ${this.width*3/4} ${this.height/2} Q ${this.width*5/6} ${this.height/2.5} ${this.width*9/10} ${this.height/2}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
                break;
            case 'mushroom':
                svg += `<rect x="${this.width/2 - this.width/8}" y="${this.height/2}" width="${this.width/4}" height="${this.height/2}" fill="#F5DEB3" stroke="#00000030" stroke-width="1"/>`;
                svg += `<path d="M ${this.width/6} ${this.height/2} Q ${this.width/2} ${this.height/4} ${this.width*5/6} ${this.height/2} Z" fill="#FF4500" stroke="#00000030" stroke-width="1"/>`;
                for (let i = 0; i < 5; i++) {
                    const spotX = this.width/3 + Math.random() * this.width/3;
                    const spotY = this.height/3 + Math.random() * this.height/6;
                    const spotSize = this.width/20 + Math.random() * this.width/20;
                    svg += `<circle cx="${spotX}" cy="${spotY}" r="${spotSize}" fill="#FFFFFF" stroke="#00000010" stroke-width="0.5"/>`;
                }
                break;
            case 'flower':
                svg += `<rect x="${this.width/2 - this.width/20}" y="${this.height/2}" width="${this.width/10}" height="${this.height/2}" fill="#228B22" stroke="#00000030" stroke-width="1"/>`;
                svg += `<ellipse cx="${this.width/3}" cy="${this.height*2/3}" rx="${this.width/8}" ry="${this.height/12}" fill="#228B22" stroke="#00000030" stroke-width="1"/>`;
                svg += `<ellipse cx="${this.width*2/3}" cy="${this.height*2/3}" rx="${this.width/8}" ry="${this.height/12}" fill="#228B22" stroke="#00000030" stroke-width="1"/>`;
                for (let i = 0; i < 6; i++) {
                    const angle = (i * 60) * Math.PI / 180;
                    const petalX = this.width/2 + Math.cos(angle) * this.width/4;
                    const petalY = this.height/3 + Math.sin(angle) * this.height/6;
                    svg += `<circle cx="${petalX}" cy="${petalY}" r="${this.width/6}" fill="${color}" stroke="#00000030" stroke-width="1"/>`;
                }
                svg += `<circle cx="${this.width/2}" cy="${this.height/3}" r="${this.width/8}" fill="#FFFF00" stroke="#00000030" stroke-width="1"/>`;
                break;
        }

        svg += '</svg>';
        return svg;
    }

    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.x -= speed;
    }
}

// BackgroundElement class
class BackgroundElement {
    constructor() {
        this.x = canvas.width + random.size(50, 200);
        this.y = random.size(0, canvas.height - 200);
        this.width = random.size(30, 100);
        this.height = random.size(20, 80);
        this.speed = random.size(0.5, 1.5);
        this.type = random.bool() ? 'cloud' : 'tree';
        this.color = this.type === 'cloud' ? '#FFFFFF' : random.color();
        this.svg = this.generateSVG();
        this.image = new Image();
        this.image.src = 'data:image/svg+xml;base64,' + btoa(this.svg);
    }

    generateSVG() {
        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        if (this.type === 'cloud') {
            svg += `<circle cx="${this.width/3}" cy="${this.height/2}" r="${this.width/3}" fill="${this.color}" stroke="#E0E0E0" stroke-width="1" opacity="0.8"/>`;
            svg += `<circle cx="${this.width*2/3}" cy="${this.height/2}" r="${this.width/3}" fill="${this.color}" stroke="#E0E0E0" stroke-width="1" opacity="0.8"/>`;
            svg += `<circle cx="${this.width/2}" cy="${this.height/3}" r="${this.width/2.5}" fill="${this.color}" stroke="#E0E0E0" stroke-width="1" opacity="0.8"/>`;
        } else {
            svg += `<rect x="${this.width/2 - this.width/8}" y="${this.height/2}" width="${this.width/4}" height="${this.height/2}" fill="#8B4513" stroke="#00000030" stroke-width="1"/>`;
            svg += `<circle cx="${this.width/2}" cy="${this.height/3}" r="${this.width/2.5}" fill="${this.color}" stroke="#00000030" stroke-width="1" opacity="0.8"/>`;
        }

        svg += '</svg>';
        return svg;
    }

    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.x -= this.speed;
        if (this.x + this.width < 0) {
            this.x = canvas.width + random.size(50, 200);
            this.y = random.size(0, canvas.height - 200);
        }
    }
}

// Game initialization
function initGame() {
    character = new Character();
    obstacles = [];
    backgroundElements = [];
    
    for (let i = 0; i < 5; i++) {
        const element = new BackgroundElement();
        element.x = random.size(0, canvas.width);
        backgroundElements.push(element);
    }
}

// Collision detection
function checkCollision(character, obstacle) {
    return character.x < obstacle.x + obstacle.width &&
           character.x + character.width > obstacle.x &&
           character.y < obstacle.y + obstacle.height &&
           character.y + character.height > obstacle.y;
}

// Load game over texts
async function loadGameOverTexts() {
    try {
        const response = await fetch('texts.txt');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const text = await response.text();
        gameOverTexts = text.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
        
        if (gameOverTexts.length === 0) {
            throw new Error('File is empty');
        }
        
        console.log(`Loaded ${gameOverTexts.length} game over texts`);
        return true;
    } catch (error) {
        console.error('Error loading texts:', error);
        gameOverTexts = [...DEFAULT_TEXTS];
        console.log('Using default texts');
        return false;
    }
}

// Show game over
function showGameOver() {
    // Ensure we have texts loaded
    if (gameOverTexts.length === 0) {
        console.warn('No texts loaded, using defaults');
        gameOverTexts = [...DEFAULT_TEXTS];
    }
    
    const randomIndex = Math.floor(Math.random() * gameOverTexts.length);
    const randomText = gameOverTexts[randomIndex];
    
    console.log(`Selected text #${randomIndex}: "${randomText}"`);
    
    document.getElementById('gameOverText').textContent = randomText;
    document.getElementById('gameOverScore').textContent = 'Счет: ' + Math.floor(score);
    document.getElementById('gameOverModal').style.display = 'flex';
    
    // Text-to-speech
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(randomText);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        window.speechSynthesis.speak(utterance);
    }
}

// Reset game
function resetGame() {
    gameRunning = true;
    score = 0;
    speed = INITIAL_SPEED;
    frameCount = 0;
    initGame();
    document.getElementById('gameOverModal').style.display = 'none';
    gameLoop();
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8FBC8F';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    
    // Background elements
    backgroundElements.forEach(element => {
        element.update();
        element.draw();
    });
    
    // Character
    character.update();
    character.draw();
    
    // Create new obstacles
    frameCount++;
    if (frameCount % 100 === 0) {
        obstacles.push(new Obstacle(canvas.width));
    }
    
    // Update and draw obstacles
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
    obstacles.forEach(obs => {
        obs.update();
        obs.draw();
        
        if (checkCollision(character, obs)) {
            gameRunning = false;
            showGameOver();
        }
    });
    
    // Update score
    score += 0.01;
    
    // Increase difficulty
    if (frameCount % 500 === 0 && speed < MAX_SPEED) {
        speed += 0.5;
    }
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameRunning) {
        e.preventDefault();
        character.jump();
    }
});

canvas.addEventListener('click', (e) => {
    e.preventDefault();
    character.jump();
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    character.jump();
});

document.getElementById('restartButton').addEventListener('click', resetGame);

// Initialize and start game
async function startGame() {
    await loadGameOverTexts();
    initGame();
    gameLoop();
}

startGame();