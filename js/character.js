// js/character.js
import { GAME_CONFIG } from './config.js';
import { Random, btoa } from './utils.js';

export class Character {
    constructor() {
        this.x = GAME_CONFIG.CHARACTER.START_X;
        this.y = 0; // Устанавливается в initCharacter
        this.width = Random.size(GAME_CONFIG.CHARACTER.MIN_WIDTH, GAME_CONFIG.CHARACTER.MAX_WIDTH);
        this.height = Random.size(GAME_CONFIG.CHARACTER.MIN_HEIGHT, GAME_CONFIG.CHARACTER.MAX_HEIGHT);
        this.velocityY = 0;
        this.onGround = true;
        
        this.generateAppearance();
        this.createImage();
    }
    
    generateAppearance() {
        this.bodyColor = Random.color();
        this.headColor = Random.color();
        this.wingColor = Random.color();
        this.legColor = Random.color();
        this.hasWings = Random.bool(0.3);
        this.hasSpikes = Random.bool(0.4);
        this.eyeCount = Random.int(1, 3);
        this.hasTail = Random.bool(0.5);
        this.hasAntenna = Random.bool(0.3);
        this.mouthType = Random.int(0, 2);
    }
    
    createImage() {
        this.svg = this.generateSVG();
        this.image = new Image();
        this.image.src = 'data:image/svg+xml;base64,' + btoa(this.svg);
    }
    
    generateSVG() {
        // [Оригинальный код генерации SVG остается здесь]
        // Я сократил для примера, но вы можете сохранить полный код
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
        if (this.y + this.height >= canvasHeight - GAME_CONFIG.GROUND_HEIGHT) {
            this.y = canvasHeight - GAME_CONFIG.GROUND_HEIGHT - this.height;
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
        }
    }
    
    draw(ctx) {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}