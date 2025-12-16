// js/character.js
import { GAME_CONFIG } from './config.js';
import { Random, btoa } from './utils.js';

export class Character {
    constructor(baseColor) {
        this.x = GAME_CONFIG.CHARACTER.START_X;
        this.y = 0;
        this.width = Random.size(GAME_CONFIG.CHARACTER.MIN_WIDTH, GAME_CONFIG.CHARACTER.MAX_WIDTH);
        this.height = Random.size(GAME_CONFIG.CHARACTER.MIN_HEIGHT, GAME_CONFIG.CHARACTER.MAX_HEIGHT);
        this.velocityY = 0;
        this.onGround = true;
        
        this.baseColor = baseColor || Random.color();
        this.generateAppearance();
        this.createImage();
    }
    
    generateAppearance() {
        this.bodyColor = this.baseColor;
        this.headColor = this.adjustColor(this.baseColor, 20);
        this.wingColor = this.adjustColor(this.baseColor, 40);
        this.legColor = this.adjustColor(this.baseColor, -30);
        this.hasWings = Random.bool(0.3);
        this.hasSpikes = Random.bool(0.4);
        this.eyeCount = Random.int(1, 3);
        this.hasTail = Random.bool(0.5);
        this.hasAntenna = Random.bool(0.3);
        this.mouthType = Random.int(0, 2);
    }
    
    adjustColor(color, percent) {
        // Упрощенная функция корректировки цвета
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#FFD166'
        ];
        return colors[(colors.indexOf(color) + 1) % colors.length];
    }
    
    createImage() {
        try {
            this.svg = this.generateSVG();
            this.image = new Image();
            this.image.onload = () => {
                console.log('Character image loaded');
            };
            this.image.onerror = (e) => {
                console.error('Failed to load character image:', e);
                this.createFallbackImage();
            };
            // Encode SVG to base64, handling Unicode characters
            this.image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(this.svg)));
        } catch (error) {
            console.error('Error creating character image:', error);
            this.createFallbackImage();
        }
    }
    
    createFallbackImage() {
        // Создаем простой прямоугольник как запасной вариант
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = this.bodyColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.fillStyle = this.headColor;
        ctx.beginPath();
        ctx.arc(this.width/2, this.height/4, this.width/5, 0, Math.PI * 2);
        ctx.fill();
        
        this.image = canvas;
    }
    
    generateSVG() {
        // [Сокращенная версия генерации SVG, аналогичная оригиналу]
        // Для экономии места оставляем только ключевые части
        let svg = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Тело
        svg += `<ellipse cx="${this.width/2}" cy="${this.height/2 + 10}" rx="${this.width/2.5}" ry="${this.height/3}" fill="${this.bodyColor}" stroke="#00000020" stroke-width="1"/>`;
        
        // Голова
        svg += `<circle cx="${this.width/2}" cy="${this.height/4}" r="${this.width/5}" fill="${this.headColor}" stroke="#00000020" stroke-width="1"/>`;
        
        // ... остальная генерация
        
        svg += '</svg>';
        return svg;
    }
    
    init(canvasHeight) {
        this.y = canvasHeight - GAME_CONFIG.GROUND_HEIGHT - this.height;
    }
    
    update() {
        this.velocityY += GAME_CONFIG.GRAVITY;
        this.y += this.velocityY;
    }
    
    checkGround(canvasHeight) {
        const groundY = canvasHeight - GAME_CONFIG.GROUND_HEIGHT;
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.velocityY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }
    }
    
    jump() {
        if (this.onGround) {
            this.velocityY = GAME_CONFIG.JUMP_STRENGTH;
            this.onGround = false;
            return true;
        }
        return false;
    }
    
    draw(ctx) {
        if (!ctx) {
            console.error('No context to draw character');
            return;
        }
        
        try {
            if (this.image) {
                if (this.image.complete) {
                    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
                } else {
                    // Рисуем заглушку пока изображение грузится
                    ctx.fillStyle = this.bodyColor;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            }
        } catch (error) {
            console.error('Error drawing character:', error);
        }
    }
}