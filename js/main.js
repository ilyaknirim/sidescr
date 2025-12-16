// js/main.js
import { GAME_CONFIG } from './config.js';
import { resizeCanvas } from './utils.js';
import { GameState } from './game-state.js';
import { Character } from './character.js';
import { Obstacle } from './obstacle.js';
import { BackgroundElement } from './background.js';
import { checkAllCollisions } from './collision.js';
import { GameOverManager } from './game-over.js';
import { setupInput } from './input.js';
import { renderGame } from './renderer.js';
import { AudioGenerator } from './audio-generator.js';
import { ParticleSystem } from './particles.js';
import { Random } from './utils.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = new GameState();
        this.gameOverManager = new GameOverManager();
        this.audioGenerator = new AudioGenerator();
        this.particleSystem = new ParticleSystem();
        
        this.backgroundMusicCounter = 0;
        
        this.init();
    }
    
    async init() {
        resizeCanvas(this.canvas);
        window.addEventListener('resize', () => resizeCanvas(this.canvas));
        
        await this.gameOverManager.loadTexts();
        setupInput(this);
        
        document.getElementById('restartButton').addEventListener('click', () => this.reset());
        
        // Добавим кнопку включения/выключения звука
        this.createSoundToggle();
        
        this.reset();
        this.gameLoop();
    }
    
    createSoundToggle() {
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
        `;
        
        soundButton.addEventListener('click', () => {
            const enabled = this.audioGenerator.toggleSound();
            soundButton.innerHTML = enabled ? '🔊' : '🔇';
        });
        
        document.body.appendChild(soundButton);
    }
    
    reset() {
        this.gameState.reset();
        this.gameOverManager.hide();
        this.particleSystem.clear();
        this.initCharacter();
        this.initBackground();
    }
    
    initCharacter() {
        this.gameState.character = new Character();
        this.gameState.character.init(this.canvas.height);
    }
    
    initBackground() {
        this.gameState.backgroundElements = [];
        for (let i = 0; i < GAME_CONFIG.BACKGROUND_ELEMENTS_COUNT; i++) {
            const element = new BackgroundElement();
            element.x = Random.size(0, this.canvas.width);
            element.init(this.canvas.height);
            this.gameState.backgroundElements.push(element);
        }
    }
    
    update() {
        if (this.gameState.isGameOver()) return;
        
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
        
        // Препятствия
        if (this.gameState.shouldSpawnObstacle()) {
            const obstacle = new Obstacle(this.canvas.width);
            obstacle.initPosition(this.canvas.height);
            this.gameState.obstacles.push(obstacle);
        }
        
        // Обновление препятствий
        this.gameState.obstacles = this.gameState.obstacles.filter(obs => !obs.isOffScreen());
        this.gameState.obstacles.forEach(obs => obs.update(this.gameState.speed));
        
        // Фоновые элементы
        this.gameState.backgroundElements.forEach(el => el.update(this.canvas.width));
        
        // Коллизии
        if (checkAllCollisions(this.gameState.character, this.gameState.obstacles)) {
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
        this.backgroundMusicCounter++;
        if (this.backgroundMusicCounter >= GAME_CONFIG.AUDIO.BACKGROUND_MUSIC_INTERVAL) {
            this.backgroundMusicCounter = 0;
            
            // Процедурная генерация нот на основе счета
            const noteIndex = Math.floor(this.gameState.score) % 7;
            const baseFrequency = 261.63; // До
            const frequency = baseFrequency * Math.pow(2, noteIndex / 12);
            
            this.audioGenerator.playNote(frequency, 0.3);
        }
    }
    
    render() {
        // Очистка канваса
        this.ctx.fillStyle = GAME_CONFIG.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Отрисовка фоновых элементов
        this.gameState.backgroundElements.forEach(el => el.draw(this.ctx));
        
        // Земля
        this.ctx.fillStyle = GAME_CONFIG.GROUND_COLOR;
        this.ctx.fillRect(0, this.canvas.height - GAME_CONFIG.GROUND_HEIGHT, 
                         this.canvas.width, GAME_CONFIG.GROUND_HEIGHT);
        
        // Частицы под землей
        this.particleSystem.draw(this.ctx);
        
        // Препятствия
        this.gameState.obstacles.forEach(obs => obs.draw(this.ctx));
        
        // Персонаж
        this.gameState.character.draw(this.ctx);
        
        // Частицы поверх всего
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.particleSystem.draw(this.ctx);
        this.ctx.restore();
        
        // Счет
        this.drawScore();
    }
    
    drawScore() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`Счет: ${Math.floor(this.gameState.score)}`, 20, 20);
        
        // Скорость
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Скорость: ${this.gameState.speed.toFixed(1)}`, 20, 50);
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        if (!this.gameState.isGameOver()) {
            requestAnimationFrame(() => this.gameLoop());
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
    new Game();
});