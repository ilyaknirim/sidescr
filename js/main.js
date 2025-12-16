// js/main.js
import { GAME_CONFIG } from './config.js';
import { resizeCanvas } from './utils.js';
import { GameState } from './game-state.js';
import { Character } from './character_improved.js';
import { Obstacle } from './obstacle.js';
import { BackgroundElement } from './background.js';
import { checkAllCollisions } from './collision.js';
import { GameOverManager } from './game-over.js';
import { setupInput } from './input.js';
import { AudioGenerator } from './audio-generator.js';
import { ParticleSystem } from './particles.js';
import { ColorPalette } from './color-palette.js';
import { Random } from './utils.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.gameState = new GameState();
        this.gameOverManager = new GameOverManager();
        this.audioGenerator = new AudioGenerator();
        this.particleSystem = new ParticleSystem();
        this.colorPalette = new ColorPalette();
        
        this.backgroundMusicCounter = 0;
        this.colors = null;
        
        this.init();
    }
    
    async init() {
        console.log('Инициализация игры...');
        
        // Инициализация канваса
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Генерация цветовой палитры
        this.generateColors();
        
        // Загрузка мотивационных фраз
        await this.gameOverManager.loadTexts();
        
        // Настройка управления
        setupInput(this);
        
        // Кнопка рестарта
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.reset());
        } else {
            console.error('Restart button not found!');
        }
        
        // Создание UI элементов
        this.createUI();
        
        // Начало игры
        this.reset();
        this.gameLoop();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        console.log(`Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
    }
    
    generateColors() {
        this.colors = this.colorPalette.getAllColors();
        console.log('Цветовая палитра:', this.colors);
    }
    
    createUI() {
        // Кнопка звука
        if (!document.getElementById('soundToggle')) {
            const soundButton = document.createElement('button');
            soundButton.id = 'soundToggle';
            soundButton.innerHTML = '🔊';
            soundButton.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: rgba(255, 255, 255, 0.9);
                font-size: 24px;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            `;
            
            soundButton.addEventListener('click', () => {
                const enabled = this.audioGenerator.toggleSound();
                soundButton.innerHTML = enabled ? '🔊' : '🔇';
            });
            
            document.body.appendChild(soundButton);
        }
        
        // Кнопка смены палитры
        if (!document.getElementById('paletteButton')) {
            const paletteButton = document.createElement('button');
            paletteButton.id = 'paletteButton';
            paletteButton.innerHTML = '🎨';
            paletteButton.title = 'Сменить палитру';
            paletteButton.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: rgba(255, 255, 255, 0.9);
                font-size: 24px;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            `;
            
            paletteButton.addEventListener('click', () => {
                this.colorPalette.getRandomPalette();
                this.generateColors();
                paletteButton.style.transform = 'rotate(180deg)';
                setTimeout(() => {
                    paletteButton.style.transform = 'rotate(0deg)';
                }, 300);
            });
            
            document.body.appendChild(paletteButton);
        }
    }
    
    reset() {
        console.log('Сброс игры...');
        this.gameState.reset();
        this.gameOverManager.hide();
        this.particleSystem.clear();
        
        // Новая цветовая палитра
        this.generateColors();
        
        // Инициализация элементов
        this.gameState.character = new Character(this.colors.character);
        this.gameState.character.init(this.canvas.height);
        
        this.gameState.backgroundElements = [];
        for (let i = 0; i < GAME_CONFIG.BACKGROUND_ELEMENTS_COUNT; i++) {
            const element = new BackgroundElement(this.colors.bgElement);
            element.x = Random.size(0, this.canvas.width);
            element.init(this.canvas.height);
            this.gameState.backgroundElements.push(element);
        }
        
        this.gameState.gameRunning = true;
    }
    
    update() {
        if (!this.gameState.gameRunning) return;
        
        this.gameState.incrementFrame();
        this.gameState.updateScore();
        
        // Фоновая музыка
        this.updateBackgroundMusic();
        
        // Персонаж
        const character = this.gameState.character;
        const prevY = character.y;
        character.update();
        character.checkGround(this.canvas.height);
        
        // Частицы следа при падении
        if (character.velocityY > 0 && !character.onGround) {
            this.particleSystem.createTrailParticles(
                character.x + character.width / 2,
                character.y + character.height
            );
        }
        
        // Создание препятствий
        if (this.gameState.shouldSpawnObstacle()) {
            const obstacle = new Obstacle(this.canvas.width, this.colors.obstacle);
            obstacle.initPosition(this.canvas.height);
            this.gameState.obstacles.push(obstacle);
        }
        
        // Обновление препятствий
        this.gameState.obstacles = this.gameState.obstacles.filter(obs => !obs.isOffScreen());
        this.gameState.obstacles.forEach(obs => obs.update(this.gameState.speed));
        
        // Обновление фона
        this.gameState.backgroundElements.forEach(el => el.update(this.canvas.width, this.canvas.height));
        
        // Проверка коллизий
        if (checkAllCollisions(character, this.gameState.obstacles)) {
            this.gameState.gameRunning = false;
            this.audioGenerator.playCollision();
            
            // Частицы при столкновении
            this.particleSystem.createCollisionParticles(
                character.x + character.width / 2,
                character.y + character.height / 2
            );
            
            this.gameOverManager.show(this.gameState.score);
        }
        
        // Частицы при приземлении
        if (character.onGround && prevY !== character.y) {
            this.particleSystem.createJumpParticles(
                character.x + character.width / 2,
                character.y + character.height
            );
        }
        
        // Увеличение сложности
        if (this.gameState.shouldIncreaseSpeed()) {
            this.gameState.increaseSpeed();
        }
        
        // Обновление системы частиц
        this.particleSystem.update();
    }
    
    updateBackgroundMusic() {
        if (!this.audioGenerator.isAudioEnabled) return;
        
        this.backgroundMusicCounter++;
        if (this.backgroundMusicCounter >= GAME_CONFIG.AUDIO.BACKGROUND_MUSIC_INTERVAL) {
            this.backgroundMusicCounter = 0;
            
            const noteIndex = Math.floor(this.gameState.score) % 7;
            const baseFrequency = 261.63;
            const frequency = baseFrequency * Math.pow(2, noteIndex / 12);
            
            this.audioGenerator.playNote(frequency, 0.3);
        }
    }
    
    render() {
        // Очистка канваса
        if (!this.ctx) {
            console.error('Canvas context is not available!');
            return;
        }
        
        // Фон с градиентом
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, this.colors.background);
        gradient.addColorStop(1, this.colorPalette.getRandomColor(this.colorPalette.currentPalette.background));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Отрисовка фоновых элементов
        this.gameState.backgroundElements.forEach(el => el.draw(this.ctx));
        
        // Земля с текстурой
        this.ctx.fillStyle = this.colors.ground;
        this.ctx.fillRect(0, this.canvas.height - GAME_CONFIG.GROUND_HEIGHT, 
                         this.canvas.width, GAME_CONFIG.GROUND_HEIGHT);
        
        // Текстура земли
        this.drawGroundTexture();
        
        // Частицы
        this.particleSystem.draw(this.ctx);
        
        // Препятствия
        this.gameState.obstacles.forEach(obs => obs.draw(this.ctx));
        
        // Персонаж
        this.gameState.character.draw(this.ctx);
        
        // Счет
        this.drawScore();
        
        // Отладка
        this.drawDebugInfo();
    }
    
    drawGroundTexture() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.2;
        
        for (let i = 0; i < this.canvas.width; i += 20) {
            const height = Math.sin(i * 0.01 + Date.now() * 0.001) * 5 + 10;
            this.ctx.fillStyle = i % 40 === 0 ? '#00000020' : '#FFFFFF20';
            this.ctx.fillRect(i, this.canvas.height - GAME_CONFIG.GROUND_HEIGHT, 
                           20, height);
        }
        
        this.ctx.restore();
    }
    
    drawScore() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        // Тень текста
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.fillText(`🏆 ${Math.floor(this.gameState.score)}`, 20, 20);
        
        // Скорость
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`⚡ ${this.gameState.speed.toFixed(1)}`, 20, 60);
        
        this.ctx.shadowBlur = 0;
    }
    
    drawDebugInfo() {
        if (window.location.hash === '#debug') {
            this.ctx.fillStyle = '#00000080';
            this.ctx.fillRect(10, this.canvas.height - 100, 200, 90);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px monospace';
            this.ctx.textAlign = 'left';
            
            const debugInfo = [
                `Частицы: ${this.particleSystem.particles.length}`,
                `Препятствия: ${this.gameState.obstacles.length}`,
                `Кадр: ${this.gameState.frameCount}`,
                `Y: ${this.gameState.character.y.toFixed(1)}`,
                `VY: ${this.gameState.character.velocityY.toFixed(1)}`
            ];
            
            debugInfo.forEach((text, i) => {
                this.ctx.fillText(text, 15, this.canvas.height - 80 + i * 15);
            });
        }
    }
    
    gameLoop() {
        try {
            this.update();
            this.render();
            
            if (this.gameState.gameRunning) {
                requestAnimationFrame(() => this.gameLoop());
            }
        } catch (error) {
            console.error('Error in game loop:', error);
            this.gameState.gameRunning = false;
        }
    }
    
    jump() {
        if (this.gameState.gameRunning) {
            this.gameState.character.jump();
            this.audioGenerator.playJump();
            
            // Частицы при прыжке
            this.particleSystem.createJumpParticles(
                this.gameState.character.x + this.gameState.character.width / 2,
                this.gameState.character.y + this.gameState.character.height
            );
        }
    }
}

// Запуск игры
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, запуск игры...');
    new Game();
});

// Отладка
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});