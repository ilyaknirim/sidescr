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

        // Анимационные параметры
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.isJumping = false;
        this.jumpAnimationProgress = 0;
        this.isRunning = false;
        this.runAnimationProgress = 0;

        // Направление взгляда (боком)
        this.facingRight = true;

        this.baseColor = baseColor || Random.color();
        this.generateAppearance();
        this.createImage();
    }

    generateAppearance() {
        this.bodyColor = this.baseColor;
        this.headColor = this.adjustColor(this.baseColor, 20);
        this.bellyColor = this.adjustColor(this.baseColor, -10);
        this.legColor = this.adjustColor(this.baseColor, -30);
        this.eyeColor = this.adjustColor(this.baseColor, -40);

        // Тип животного
        this.animalType = Random.int(0, 3); // 0: лиса, 1: кролик, 2: кошка, 3: енот

        // Дополнительные параметры
        this.hasTail = true;
        this.tailType = Random.int(0, 2); // 0: пушистый, 1: длинный, 2: короткий
        this.earType = Random.int(0, 2); // 0: острые, 1: круглые, 2: висячие
        this.hasSpots = Random.bool(0.3);
        this.spotColor = this.adjustColor(this.baseColor, -15);
    }

    adjustColor(color, percent) {
        // Улучшенная функция корректировки цвета
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#FFD166',
            '#FF8C42', '#74B9FF', '#A29BFE', '#FD79A8',
            '#E17055', '#00B894', '#00CEC9', '#FDCB6E'
        ];
        return colors[(colors.indexOf(color) + 1) % colors.length];
    }

    createImage() {
        try {
            // Сначала создаем запасное изображение
            this.createFallbackImage();

            // Создаем изображения для разных состояний анимации
            this.createAnimationFrames();
        } catch (error) {
            console.error('Critical error creating character image:', error);
            // Гарантируем, что у нас есть хотя бы запасное изображение
            if (!this.image) {
                this.createFallbackImage();
            }
        }
    }

    createAnimationFrames() {
        // Создаем изображения для разных кадров анимации
        this.idleImage = this.createCharacterImage('idle');
        this.runImages = [];
        this.jumpImages = [];

        // Создаем кадры для бега (4 кадра)
        for (let i = 0; i < 4; i++) {
            this.runImages.push(this.createCharacterImage('run', i));
        }

        // Создаем кадры для прыжка (3 кадра)
        for (let i = 0; i < 3; i++) {
            this.jumpImages.push(this.createCharacterImage('jump', i));
        }

        // Устанавливаем текущее изображение
        this.image = this.idleImage;
    }

    createCharacterImage(animationType, frame = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');

        // Рисуем персонажа в зависимости от типа анимации и кадра
        this.drawCharacter(ctx, animationType, frame);

        return canvas;
    }

    drawCharacter(ctx, animationType, frame) {
        // Сохраняем состояние контекста
        ctx.save();

        // Если персонаж смотрит влево, отражаем по горизонтали
        if (!this.facingRight) {
            ctx.scale(-1, 1);
            ctx.translate(-this.width, 0);
        }

        // Рисуем тело
        this.drawBody(ctx, animationType, frame);

        // Рисуем голову
        this.drawHead(ctx, animationType, frame);

        // Рисуем хвост
        this.drawTail(ctx, animationType, frame);

        // Восстанавливаем состояние контекста
        ctx.restore();
    }

    drawBody(ctx, animationType, frame) {
        // Положение и форма тела в зависимости от типа животного
        let bodyX, bodyY, bodyWidth, bodyHeight;

        switch(this.animalType) {
            case 0: // Лиса
                bodyX = this.width * 0.25;
                bodyY = this.height * 0.4;
                bodyWidth = this.width * 0.5;
                bodyHeight = this.height * 0.4;
                break;
            case 1: // Кролик
                bodyX = this.width * 0.3;
                bodyY = this.height * 0.5;
                bodyWidth = this.width * 0.4;
                bodyHeight = this.height * 0.3;
                break;
            case 2: // Кошка
                bodyX = this.width * 0.25;
                bodyY = this.height * 0.45;
                bodyWidth = this.width * 0.5;
                bodyHeight = this.height * 0.35;
                break;
            case 3: // Енот
            default:
                bodyX = this.width * 0.25;
                bodyY = this.height * 0.4;
                bodyWidth = this.width * 0.5;
                bodyHeight = this.height * 0.4;
                break;
        }

        // Анимация тела
        let bodyOffsetY = 0;
        if (animationType === 'run') {
            // Анимация бега
            bodyOffsetY = Math.sin(frame * Math.PI / 2) * 3;
        } else if (animationType === 'jump') {
            // Анимация прыжка
            if (frame === 0) {
                bodyOffsetY = 5; // Приседание перед прыжком
            } else if (frame === 1) {
                bodyOffsetY = -10; // В полете
            } else {
                bodyOffsetY = 5; // Приземление
            }
        }

        // Рисуем тело
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.ellipse(bodyX + bodyWidth/2, bodyY + bodyHeight/2 + bodyOffsetY, 
                    bodyWidth/2, bodyHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Рисуем животик
        ctx.fillStyle = this.bellyColor;
        ctx.beginPath();
        ctx.ellipse(bodyX + bodyWidth/2, bodyY + bodyHeight/2 + bodyOffsetY + 5, 
                    bodyWidth/2.5, bodyHeight/2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Рисуем пятна, если есть
        if (this.hasSpots) {
            ctx.fillStyle = this.spotColor;
            for (let i = 0; i < 3; i++) {
                const spotX = bodyX + Random.size(bodyWidth * 0.2, bodyWidth * 0.8);
                const spotY = bodyY + Random.size(bodyHeight * 0.2, bodyHeight * 0.8) + bodyOffsetY;
                const spotSize = Random.size(3, 6);
                ctx.beginPath();
                ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Рисуем ноги
        this.drawLegs(ctx, bodyX, bodyY, bodyWidth, bodyHeight, animationType, frame);
    }

    drawLegs(ctx, bodyX, bodyY, bodyWidth, bodyHeight, animationType, frame) {
        const legWidth = this.width * 0.08;
        const legHeight = this.height * 0.25;
        const legSpacing = bodyWidth * 0.25;

        // Позиции ног
        const frontLegX = bodyX + bodyWidth * 0.7;
        const backLegX = bodyX + bodyWidth * 0.3;
        const legY = bodyY + bodyHeight - 5;

        // Анимация ног
        let frontLegAngle = 0;
        let backLegAngle = 0;

        if (animationType === 'run') {
            // Анимация бега
            frontLegAngle = Math.sin(frame * Math.PI / 2) * 0.3;
            backLegAngle = Math.sin((frame + 2) * Math.PI / 2) * 0.3;
        } else if (animationType === 'jump') {
            // Анимация прыжка
            if (frame === 0) {
                frontLegAngle = 0.3;  // Приседание
                backLegAngle = -0.3;
            } else if (frame === 1) {
                frontLegAngle = -0.4; // В полете
                backLegAngle = -0.4;
            } else {
                frontLegAngle = 0.3;  // Приземление
                backLegAngle = -0.3;
            }
        }

        // Рисуем переднюю ногу
        ctx.save();
        ctx.translate(frontLegX, legY);
        ctx.rotate(frontLegAngle);
        ctx.fillStyle = this.legColor;
        ctx.fillRect(-legWidth/2, 0, legWidth, legHeight);

        // Лапа
        ctx.beginPath();
        ctx.ellipse(0, legHeight, legWidth * 0.8, legWidth * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Рисуем заднюю ногу
        ctx.save();
        ctx.translate(backLegX, legY);
        ctx.rotate(backLegAngle);
        ctx.fillStyle = this.legColor;
        ctx.fillRect(-legWidth/2, 0, legWidth, legHeight);

        // Лапа
        ctx.beginPath();
        ctx.ellipse(0, legHeight, legWidth * 0.8, legWidth * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawHead(ctx, animationType, frame) {
        // Положение и размер головы в зависимости от типа животного
        let headX, headY, headWidth, headHeight;

        switch(this.animalType) {
            case 0: // Лиса
                headX = this.width * 0.6;
                headY = this.height * 0.25;
                headWidth = this.width * 0.35;
                headHeight = this.height * 0.35;
                break;
            case 1: // Кролик
                headX = this.width * 0.55;
                headY = this.height * 0.2;
                headWidth = this.width * 0.3;
                headHeight = this.height * 0.3;
                break;
            case 2: // Кошка
                headX = this.width * 0.6;
                headY = this.height * 0.25;
                headWidth = this.width * 0.35;
                headHeight = this.height * 0.35;
                break;
            case 3: // Енот
            default:
                headX = this.width * 0.55;
                headY = this.height * 0.25;
                headWidth = this.width * 0.35;
                headHeight = this.height * 0.35;
                break;
        }

        // Анимация головы
        let headOffsetY = 0;
        let headRotation = 0;

        if (animationType === 'run') {
            // Небольшое движение головы при беге
            headOffsetY = Math.sin(frame * Math.PI / 2) * 2;
            headRotation = Math.sin(frame * Math.PI / 2) * 0.05;
        } else if (animationType === 'jump') {
            // Движение головы при прыжке
            if (frame === 0) {
                headRotation = -0.1; // Наклон вниз при приседании
            } else if (frame === 1) {
                headRotation = 0.1;  // Наклон вверх в полете
            } else {
                headRotation = -0.1; // Наклон вниз при приземлении
            }
        }

        // Рисуем голову
        ctx.save();
        ctx.translate(headX + headWidth/2, headY + headHeight/2 + headOffsetY);
        ctx.rotate(headRotation);

        ctx.fillStyle = this.headColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, headWidth/2, headHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Рисуем мордочку
        ctx.fillStyle = this.bellyColor;
        ctx.beginPath();
        ctx.ellipse(headWidth * 0.1, headHeight * 0.1, headWidth * 0.3, headHeight * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Рисуем уши
        this.drawEars(ctx, headWidth, headHeight);

        // Рисуем глаза
        this.drawEyes(ctx, headWidth, headHeight);

        // Рисуем нос и рот
        this.drawMouth(ctx, headWidth, headHeight);

        ctx.restore();
    }

    drawEars(ctx, headWidth, headHeight) {
        // Размеры и позиции ушей в зависимости от типа
        let earWidth, earHeight, earX, earY;

        switch(this.earType) {
            case 0: // Острые
                earWidth = headWidth * 0.2;
                earHeight = headHeight * 0.4;
                earX = headWidth * 0.1;
                earY = -headHeight * 0.3;
                break;
            case 1: // Круглые
                earWidth = headWidth * 0.25;
                earHeight = headWidth * 0.25;
                earX = headWidth * 0.05;
                earY = -headHeight * 0.2;
                break;
            case 2: // Висячие
            default:
                earWidth = headWidth * 0.2;
                earHeight = headHeight * 0.3;
                earX = headWidth * 0.1;
                earY = -headHeight * 0.1;
                break;
        }

        // Левое ухо
        ctx.fillStyle = this.headColor;
        ctx.beginPath();
        if (this.earType === 0) { // Острые
            ctx.moveTo(-headWidth * 0.2 + earX, earY);
            ctx.lineTo(-headWidth * 0.2 + earX - earWidth/2, earY + earHeight);
            ctx.lineTo(-headWidth * 0.2 + earX + earWidth/2, earY + earHeight);
        } else { // Круглые или висячие
            ctx.ellipse(-headWidth * 0.2 + earX, earY, earWidth/2, earHeight/2, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // Внутренняя часть левого уха
        ctx.fillStyle = this.adjustColor(this.headColor, -10);
        if (this.earType === 0) { // Острые
            ctx.beginPath();
            ctx.moveTo(-headWidth * 0.2 + earX, earY + earHeight * 0.2);
            ctx.lineTo(-headWidth * 0.2 + earX - earWidth/4, earY + earHeight * 0.8);
            ctx.lineTo(-headWidth * 0.2 + earX + earWidth/4, earY + earHeight * 0.8);
        } else { // Круглые или висячие
            ctx.beginPath();
            ctx.ellipse(-headWidth * 0.2 + earX, earY, earWidth/3, earHeight/3, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // Правое ухо
        ctx.fillStyle = this.headColor;
        ctx.beginPath();
        if (this.earType === 0) { // Острые
            ctx.moveTo(headWidth * 0.2 - earX, earY);
            ctx.lineTo(headWidth * 0.2 - earX - earWidth/2, earY + earHeight);
            ctx.lineTo(headWidth * 0.2 - earX + earWidth/2, earY + earHeight);
        } else { // Круглые или висячие
            ctx.ellipse(headWidth * 0.2 - earX, earY, earWidth/2, earHeight/2, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // Внутренняя часть правого уха
        ctx.fillStyle = this.adjustColor(this.headColor, -10);
        if (this.earType === 0) { // Острые
            ctx.beginPath();
            ctx.moveTo(headWidth * 0.2 - earX, earY + earHeight * 0.2);
            ctx.lineTo(headWidth * 0.2 - earX - earWidth/4, earY + earHeight * 0.8);
            ctx.lineTo(headWidth * 0.2 - earX + earWidth/4, earY + earHeight * 0.8);
        } else { // Круглые или висячие
            ctx.beginPath();
            ctx.ellipse(headWidth * 0.2 - earX, earY, earWidth/3, earHeight/3, 0, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    drawEyes(ctx, headWidth, headHeight) {
        const eyeWidth = headWidth * 0.08;
        const eyeHeight = headWidth * 0.1;
        const eyeY = -headHeight * 0.05;
        const eyeSpacing = headWidth * 0.15;

        // Левый глаз
        ctx.fillStyle = this.eyeColor;
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // Зрачок левого глаза
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing, eyeY, eyeWidth * 0.5, eyeHeight * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Блик левого глаза
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing - eyeWidth * 0.2, eyeY - eyeHeight * 0.2, eyeWidth * 0.2, eyeHeight * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Правый глаз
        ctx.fillStyle = this.eyeColor;
        ctx.beginPath();
        ctx.ellipse(eyeSpacing, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // Зрачок правого глаза
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(eyeSpacing, eyeY, eyeWidth * 0.5, eyeHeight * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Блик правого глаза
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(eyeSpacing + eyeWidth * 0.2, eyeY - eyeHeight * 0.2, eyeWidth * 0.2, eyeHeight * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMouth(ctx, headWidth, headHeight) {
        // Нос
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, headHeight * 0.1, headWidth * 0.03, headWidth * 0.02, 0, 0, Math.PI * 2);
        ctx.fill();

        // Рот
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, headHeight * 0.12);
        ctx.lineTo(-headWidth * 0.05, headHeight * 0.18);
        ctx.moveTo(0, headHeight * 0.12);
        ctx.lineTo(headWidth * 0.05, headHeight * 0.18);
        ctx.stroke();
    }

    drawTail(ctx, animationType, frame) {
        // Позиция и размер хвоста в зависимости от типа
        let tailX, tailY, tailWidth, tailHeight;

        switch(this.animalType) {
            case 0: // Лиса
                tailX = this.width * 0.1;
                tailY = this.height * 0.5;
                tailWidth = this.width * 0.4;
                tailHeight = this.width * 0.15;
                break;
            case 1: // Кролик
                tailX = this.width * 0.15;
                tailY = this.height * 0.6;
                tailWidth = this.width * 0.15;
                tailHeight = this.width * 0.15;
                break;
            case 2: // Кошка
                tailX = this.width * 0.1;
                tailY = this.height * 0.5;
                tailWidth = this.width * 0.3;
                tailHeight = this.width * 0.1;
                break;
            case 3: // Енот
            default:
                tailX = this.width * 0.1;
                tailY = this.height * 0.5;
                tailWidth = this.width * 0.35;
                tailHeight = this.width * 0.12;
                break;
        }

        // Анимация хвоста
        let tailAngle = 0;

        if (animationType === 'run') {
            // Хвост двигается при беге
            tailAngle = Math.sin(frame * Math.PI / 2) * 0.2;
        } else if (animationType === 'jump') {
            // Хвост поднимается при прыжке
            if (frame === 1) {
                tailAngle = -0.3;
            }
        }

        // Рисуем хвост
        ctx.save();
        ctx.translate(tailX, tailY);
        ctx.rotate(tailAngle);

        ctx.fillStyle = this.bodyColor;

        switch(this.tailType) {
            case 0: // Пушистый
                ctx.beginPath();
                ctx.ellipse(0, 0, tailWidth, tailHeight, 0, 0, Math.PI * 2);
                ctx.fill();

                // Кончик хвоста другого цвета
                ctx.fillStyle = this.adjustColor(this.bodyColor, 20);
                ctx.beginPath();
                ctx.ellipse(tailWidth * 0.7, 0, tailWidth * 0.3, tailHeight * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 1: // Длинный
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(tailWidth * 0.5, -tailHeight, tailWidth, 0);
                ctx.quadraticCurveTo(tailWidth * 0.5, tailHeight, 0, 0);
                ctx.fill();
                break;

            case 2: // Короткий
            default:
                ctx.beginPath();
                ctx.ellipse(0, 0, tailWidth * 0.6, tailHeight, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        ctx.restore();
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

    init(canvasHeight) {
        this.y = canvasHeight - GAME_CONFIG.GROUND_HEIGHT - this.height;
    }

    update() {
        this.velocityY += GAME_CONFIG.GRAVITY;
        this.y += this.velocityY;

        // Обновляем состояние анимации
        this.updateAnimation();
    }

    updateAnimation() {
        // Определяем состояние анимации
        const wasJumping = this.isJumping;
        this.isJumping = !this.onGround;

        // Если только что начали прыжок
        if (!wasJumping && this.isJumping) {
            this.jumpAnimationProgress = 0;
        }

        // Если только что приземлились
        if (wasJumping && !this.isJumping) {
            this.jumpAnimationProgress = 2; // Кадр приземления
        }

        // Обновляем прогресс анимации
        if (this.isJumping) {
            // Анимация прыжка
            this.jumpAnimationProgress += this.animationSpeed;
            if (this.jumpAnimationProgress >= 3) {
                this.jumpAnimationProgress = 2; // Остаемся на кадре приземления
            }

            // Устанавливаем соответствующий кадр
            const frame = Math.floor(this.jumpAnimationProgress);
            this.image = this.jumpImages[frame];
        } else if (Math.abs(this.velocityY) < 0.1) {
            // Анимация бега (на земле)
            this.runAnimationProgress += this.animationSpeed;
            if (this.runAnimationProgress >= 4) {
                this.runAnimationProgress = 0;
            }

            // Устанавливаем соответствующий кадр
            const frame = Math.floor(this.runAnimationProgress);
            this.image = this.runImages[frame];
        } else {
            // Покой (idle)
            this.image = this.idleImage;
        }
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
            this.jumpAnimationProgress = 0;
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
