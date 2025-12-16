// js/background.js
import { Random, btoa } from './utils.js';
import { GAME_CONFIG } from './config.js';

export class BackgroundElement {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = Random.size(30, 100);
        this.height = Random.size(20, 80);
        this.speed = Random.size(0.5, 1.5);
        this.type = Random.arrayElement(GAME_CONFIG.BG_ELEMENT_TYPES);
        this.color = this.type === 'cloud' ? '#FFFFFF' : Random.color();
        
        this.createImage();
    }
    
    createImage() {
        try {
            this.svg = this.generateSVG();
            this.image = new Image();

            // Добавляем обработчики событий загрузки
            this.image.onload = () => {
                console.log('BackgroundElement image loaded successfully');
            };

            this.image.onerror = (e) => {
                console.warn('Failed to load BackgroundElement image:', e);
                // Создаем запасное изображение
                this.createFallbackImage();
            };

            this.image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(this.svg)));
        } catch (error) {
            console.error('Error creating BackgroundElement image:', error);
            this.createFallbackImage();
        }
    }

    createFallbackImage() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = this.color;

        if (this.type === 'cloud') {
            // Рисуем простое облако
            ctx.beginPath();
            ctx.arc(this.width/3, this.height/2, this.width/3, 0, Math.PI * 2);
            ctx.arc(this.width*2/3, this.height/2, this.width/3, 0, Math.PI * 2);
            ctx.arc(this.width/2, this.height/3, this.width/2.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Рисуем простое дерево
            ctx.fillRect(this.width/2 - this.width/8, this.height/2, this.width/4, this.height/2);
            ctx.beginPath();
            ctx.arc(this.width/2, this.height/3, this.width/2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        this.image = canvas;
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
    
    init(canvasHeight) {
        this.y = Random.size(0, canvasHeight - 200);
    }
    
    update(canvasWidth, canvasHeight) {
        this.x -= this.speed;
        if (this.x + this.width < 0) {
            this.x = canvasWidth + Random.size(50, 200);
            this.y = Random.size(0, canvasHeight - 200);
        }
    }
    
    draw(ctx) {
        if (!ctx) return;

        try {
            if (this.image) {
                if (this.image.complete) {
                    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
                } else {
                    // Рисуем заглушку пока изображение грузится
                    ctx.fillStyle = this.color;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            }
        } catch (error) {
            console.error('Error drawing BackgroundElement:', error);
        }
    }
}