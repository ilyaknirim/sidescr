// js/obstacle.js
import { GAME_CONFIG } from './config.js';
import { Random, btoa } from './utils.js';

export class Obstacle {
    constructor(canvasWidth, baseColor) {
        // Создаем препятствие за пределами экрана с запасом
        this.x = canvasWidth + 200;
        this.width = Random.size(GAME_CONFIG.OBSTACLE.MIN_WIDTH, GAME_CONFIG.OBSTACLE.MAX_WIDTH);
        this.height = Random.size(GAME_CONFIG.OBSTACLE.MIN_HEIGHT, GAME_CONFIG.OBSTACLE.MAX_HEIGHT);
        this.type = Random.bool() ? 'ground' : 'air';
        this.y = 0;
        this.obstacleType = Random.arrayElement(GAME_CONFIG.OBSTACLE.TYPES);
        this.baseColor = baseColor || Random.color();

        this.createImage();
    }
    
    createImage() {
        try {
            this.svg = this.generateSVG();
            this.image = new Image();
            this.image.onload = () => {
                console.log(`Obstacle image loaded: ${this.obstacleType}`);
            };
            this.image.onerror = (e) => {
                console.error('Failed to load obstacle image:', e);
                this.createFallbackImage();
            };
            this.image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(this.svg)));
        } catch (error) {
            console.error('Error creating obstacle image:', error);
            this.createFallbackImage();
        }
    }
    
    createFallbackImage() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = this.baseColor;
        
        if (this.obstacleType === 'tree') {
            // Ствол
            ctx.fillRect(this.width/2 - 5, this.height/2, 10, this.height/2);
            // Крона
            ctx.beginPath();
            ctx.arc(this.width/2, this.height/3, this.width/3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        this.image = canvas;
    }
    
    generateSVG() {
        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // [Здесь должна быть генерация SVG как в оригинале]
        // Для примера простой прямоугольник
        svg += `<rect width="${this.width}" height="${this.height}" fill="${this.baseColor}" stroke="#00000030" stroke-width="1"/>`;
        
        svg += '</svg>';
        return svg;
    }
    
    initPosition(canvasHeight) {
        if (this.type === 'ground') {
            this.y = canvasHeight - GAME_CONFIG.GROUND_HEIGHT - this.height;
        } else {
            this.y = Random.size(100, canvasHeight - 200 - this.height);
        }
    }
    
    update(gameSpeed) {
        this.x -= gameSpeed;
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    draw(ctx) {
        if (!ctx) return;
        
        try {
            if (this.image) {
                if (this.image.complete) {
                    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
                } else {
                    // Заглушка
                    ctx.fillStyle = this.baseColor;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            }
        } catch (error) {
            console.error('Error drawing obstacle:', error);
        }
    }
}