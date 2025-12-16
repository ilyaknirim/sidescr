// js/obstacle.js
import { GAME_CONFIG } from './config.js';
import { Random, btoa } from './utils.js';

export class Obstacle {
    constructor(canvasWidth) {
        this.x = canvasWidth;
        this.width = Random.size(GAME_CONFIG.OBSTACLE.MIN_WIDTH, GAME_CONFIG.OBSTACLE.MAX_WIDTH);
        this.height = Random.size(GAME_CONFIG.OBSTACLE.MIN_HEIGHT, GAME_CONFIG.OBSTACLE.MAX_HEIGHT);
        this.type = Random.bool() ? 'ground' : 'air';
        this.y = 0; // Устанавливается в initPosition
        this.obstacleType = Random.arrayElement(GAME_CONFIG.OBSTACLE.TYPES);
        
        this.createImage();
    }
    
    initPosition(canvasHeight) {
        if (this.type === 'ground') {
            this.y = canvasHeight - GAME_CONFIG.GROUND_HEIGHT - this.height;
        } else {
            this.y = Random.size(100, canvasHeight - 200 - this.height);
        }
    }
    
    createImage() {
        this.svg = this.generateSVG();
        this.image = new Image();
        this.image.src = 'data:image/svg+xml;base64,' + btoa(this.svg);
    }
    
    generateSVG() {
        // [Оригинальный код генерации SVG остается здесь]
        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Генерация в зависимости от типа
        switch(this.obstacleType) {
            case 'tree':
                // ... генерация дерева
                break;
            // ... остальные типы
        }
        
        svg += '</svg>';
        return svg;
    }
    
    update(gameSpeed) {
        this.x -= gameSpeed;
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    draw(ctx) {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}