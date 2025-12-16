// js/particles.js
import { Random } from './utils.js';
import { GAME_CONFIG } from './config.js';

export class Particle {
    constructor(x, y, type = 'default') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.lifetime = Random.size(20, 60);
        this.maxLifetime = this.lifetime;
        
        // Параметры в зависимости от типа
        switch(type) {
            case 'jump':
                this.initJumpParticle();
                break;
            case 'collision':
                this.initCollisionParticle();
                break;
            case 'trail':
                this.initTrailParticle();
                break;
            case 'score':
                this.initScoreParticle();
                break;
            default:
                this.initDefaultParticle();
        }
    }
    
    initJumpParticle() {
        this.size = Random.size(3, 8);
        this.color = Random.color();
        this.velocityX = Random.size(-2, 2);
        this.velocityY = Random.size(-8, -4);
        this.gravity = 0.3;
        this.fade = 0.95;
        this.shape = Math.random() > 0.5 ? 'circle' : 'star';
    }
    
    initCollisionParticle() {
        this.size = Random.size(5, 15);
        this.color = '#FF6B6B';
        this.velocityX = Random.size(-10, 10);
        this.velocityY = Random.size(-15, -5);
        this.gravity = 0.5;
        this.fade = 0.9;
        this.shape = 'fragment';
    }
    
    initTrailParticle() {
        this.size = Random.size(2, 5);
        this.color = `${Random.color()}80`; // 50% прозрачность
        this.velocityX = Random.size(-1, 1);
        this.velocityY = Random.size(-0.5, 0.5);
        this.gravity = 0.1;
        this.fade = 0.8;
        this.shape = 'circle';
    }
    
    initScoreParticle() {
        this.size = Random.size(8, 12);
        this.color = '#F7DC6F';
        this.velocityX = Random.size(-1, 1);
        this.velocityY = Random.size(-3, -1);
        this.gravity = 0.1;
        this.fade = 0.85;
        this.shape = 'diamond';
        this.text = '+1';
    }
    
    initDefaultParticle() {
        this.size = Random.size(2, 6);
        this.color = Random.color();
        this.velocityX = Random.size(-3, 3);
        this.velocityY = Random.size(-5, -2);
        this.gravity = 0.2;
        this.fade = 0.92;
        this.shape = 'circle';
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        
        // Замедление по X
        this.velocityX *= 0.98;
        
        this.lifetime--;
        this.size *= 0.97;
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        const alpha = this.lifetime / this.maxLifetime;
        ctx.save();
        
        // Позиция и прозрачность
        ctx.globalAlpha = alpha;
        
        // Отрисовка в зависимости от формы
        switch(this.shape) {
            case 'circle':
                this.drawCircle(ctx);
                break;
            case 'star':
                this.drawStar(ctx);
                break;
            case 'fragment':
                this.drawFragment(ctx);
                break;
            case 'diamond':
                this.drawDiamond(ctx);
                break;
        }
        
        ctx.restore();
    }
    
    drawCircle(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Свечение
        if (Math.random() > 0.7) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    drawStar(ctx) {
        ctx.fillStyle = this.color;
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size * 0.5;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / spikes;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
    
    drawFragment(ctx) {
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.lifetime * 0.1);
        
        ctx.beginPath();
        ctx.moveTo(-this.size, -this.size);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    drawDiamond(ctx) {
        ctx.fillStyle = this.color;
        
        // Ромб
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x + this.size, this.y);
        ctx.lineTo(this.x, this.y + this.size);
        ctx.lineTo(this.x - this.size, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Текст
        if (this.text) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${this.size * 1.5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x, this.y);
        }
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.emitters = [];
    }
    
    createEmitter(x, y, type, count = 10, duration = 30) {
        this.emitters.push({
            x, y, type, count,
            duration, currentTime: 0
        });
    }
    
    emitParticles(x, y, type, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, type));
        }
    }
    
    createJumpParticles(x, y) {
        this.emitParticles(x, y, 'jump', 15);
    }
    
    createCollisionParticles(x, y) {
        this.emitParticles(x, y, 'collision', 30);
    }
    
    createTrailParticles(x, y) {
        if (Math.random() > 0.7) {
            this.emitParticles(x, y, 'trail', 3);
        }
    }
    
    createScoreParticles(x, y, score = 1) {
        for (let i = 0; i < 5; i++) {
            const particle = new Particle(x, y, 'score');
            particle.text = `+${score}`;
            this.particles.push(particle);
        }
    }
    
    update() {
        // Обновление эмиттеров
        this.emitters = this.emitters.filter(emitter => {
            emitter.currentTime++;
            if (emitter.currentTime <= emitter.duration) {
                // Спавн частиц каждый кадр
                for (let i = 0; i < Math.floor(emitter.count / emitter.duration); i++) {
                    // Проверка лимита частиц
                    if (this.particles.length >= GAME_CONFIG.PARTICLES.MAX_PARTICLES) {
                        break;
                    }
                    this.particles.push(new Particle(
                        emitter.x + Random.size(-10, 10),
                        emitter.y + Random.size(-10, 10),
                        emitter.type
                    ));
                }
                return true;
            }
            return false;
        });

        // Обновление частиц
        this.particles = this.particles.filter(particle => particle.update());

        // Дополнительная проверка лимита (на случай если частицы добавляются другими способами)
        if (this.particles.length > GAME_CONFIG.PARTICLES.MAX_PARTICLES) {
            this.particles = this.particles.slice(0, GAME_CONFIG.PARTICLES.MAX_PARTICLES);
        }
    }
    
    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
    
    clear() {
        this.particles = [];
        this.emitters = [];
    }
}