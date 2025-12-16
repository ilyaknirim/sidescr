// js/game-state.js
import { GAME_CONFIG } from './config.js';

export class GameState {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.gameRunning = true;
        this.score = 0;
        this.speed = GAME_CONFIG.INITIAL_SPEED;
        this.frameCount = 0;
        this.character = null;
        this.obstacles = [];
        this.backgroundElements = [];
        this.gameOverTexts = [];
    }
    
    updateScore() {
        this.score += GAME_CONFIG.SCORE_INCREMENT;
    }
    
    increaseSpeed() {
        if (this.speed < GAME_CONFIG.MAX_SPEED) {
            this.speed += GAME_CONFIG.SPEED_INCREMENT;
        }
    }
    
    shouldSpawnObstacle() {
        // Добавляем задержку в начале игры, чтобы препятствия не появлялись сразу
        const minFramesBeforeFirstObstacle = 300; // Около 5 секунд при 60 FPS
        return this.frameCount > minFramesBeforeFirstObstacle &&
               this.frameCount % GAME_CONFIG.OBSTACLE_SPAWN_RATE === 0;
    }
    
    shouldIncreaseSpeed() {
        return this.frameCount % GAME_CONFIG.SPEED_INCREASE_RATE === 0;
    }
    
    incrementFrame() {
        this.frameCount++;
    }
    
    isGameOver() {
        return !this.gameRunning;
    }
}