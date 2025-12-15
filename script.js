document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы DOM
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const gameArea = document.getElementById('game-area');
    const player = document.getElementById('player');
    
    // Проверка наличия всех необходимых элементов
    if (!startScreen || !gameScreen || !gameOverScreen || !startButton || 
        !restartButton || !scoreElement || !finalScoreElement || 
        !gameArea || !player) {
        console.error("Ошибка: не удалось найти один или несколько необходимых элементов DOM");
        return;
    }
    
    // Элементы параллакс-фона
    const layer1 = document.getElementById('layer-1');
    const layer2 = document.getElementById('layer-2');
    const layer3 = document.getElementById('layer-3');
    
    // Элементы земли
    const ground1 = document.getElementById('ground-1');
    const ground2 = document.getElementById('ground-2');
    
    // Проверка наличия всех элементов фона и земли
    if (!layer1 || !layer2 || !layer3 || !ground1 || !ground2) {
        console.error("Ошибка: не удалось найти элементы фона или земли");
    }

    // Игровые переменные
    let isJumping = false;
    let score = 0;
    let gameSpeed = 5;
    let gravity = 0.5;
    let jumpPower = -12;
    let playerBottom = 100; // Начальная позиция игрока от низа
    let obstacles = [];
    let clouds = [];
    let gameRunning = false;
    let animationId;
    let obstacleTimer;
    let cloudTimer;
    let scoreTimer;
    let difficultyTimer;
    
    // Позиции фоновых слоев
    let layer1Position = 0;
    let layer2Position = 0;
    let layer3Position = 0;
    let ground1Position = 0;
    let ground2Position = 0;

    // Случайные параметры для генерации мира
    let obstacleTypes = ['ground', 'air'];
    let obstacleFrequency = 2000; // Начальная частота появления препятствий
    let minObstacleFrequency = 800; // Минимальная частота
    let cloudFrequency = 3000;

    // Старая земля заменена на параллакс-элементы в HTML

    // Функция создания облаков
    function createCloud() {
        const cloud = document.createElement('div');
        const cloudType = Math.random() > 0.5 ? 'cloud1' : 'cloud2';
        cloud.classList.add('cloud', cloudType);

        // Случайная позиция по горизонтали и высоте
        cloud.style.right = '-100px';
        cloud.style.top = `${Math.random() * 40}%`;

        gameArea.appendChild(cloud);
        clouds.push(cloud);

        // Анимация движения облака
        const cloudAnimationDuration = 15 + Math.random() * 10; // 15-25 секунд
        cloud.style.animation = `moveLeft ${cloudAnimationDuration}s linear`;

        // Удаляем облако после анимации
        setTimeout(() => {
            cloud.remove();
            clouds = clouds.filter(c => c !== cloud);
        }, cloudAnimationDuration * 1000);
    }

    // Функция создания препятствий
    function createObstacle() {
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');

        // Случайно выбираем тип препятствия
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

        if (type === 'ground') {
            obstacle.classList.add('ground-obstacle');
            obstacle.style.height = `${40 + Math.random() * 40}px`; // Случайная высота
        } else {
            obstacle.classList.add('air-obstacle');
            // Случайная высота для воздушных препятствий
            obstacle.style.bottom = `${150 + Math.random() * 150}px`;
        }

        obstacle.style.right = '-60px';
        gameArea.appendChild(obstacle);
        obstacles.push(obstacle);
    }

    // Функция прыжка
    function jump() {
        if (!isJumping && gameRunning) {
            isJumping = true;
            playerBottom = 100;
            jumpPower = -12;
            
            const jumpAnimation = () => {
                playerBottom += jumpPower;
                player.style.bottom = `${playerBottom}px`;
                jumpPower += gravity;
                
                // Ограничение высоты прыжка
                if (playerBottom <= 100) {
                    playerBottom = 100;
                    player.style.bottom = `${playerBottom}px`;
                    isJumping = false;
                } else {
                    requestAnimationFrame(jumpAnimation);
                }
            };
            
            requestAnimationFrame(jumpAnimation);
        }
    }

    // Функция проверки столкновений
    function checkCollision() {
        const playerRect = player.getBoundingClientRect();

        for (const obstacle of obstacles) {
            const obstacleRect = obstacle.getBoundingClientRect();

            // Проверяем пересечение прямоугольников
            if (
                playerRect.left < obstacleRect.left + obstacleRect.width &&
                playerRect.left + playerRect.width > obstacleRect.left &&
                playerRect.top < obstacleRect.top + obstacleRect.height &&
                playerRect.top + playerRect.height > obstacleRect.top
            ) {
                return true; // Столкновение обнаружено
            }
        }

        return false; // Столкновений нет
    }

    // Функция обновления игры
    function updateGame() {
        if (!gameRunning) return;
        
        // Анимация параллакс-фона
        layer1Position -= gameSpeed * 0.2;
        layer2Position -= gameSpeed * 0.5;
        layer3Position -= gameSpeed * 0.8;
        
        // Сброс позиций фонов при достижении конца
        if (layer1Position <= -100) layer1Position = 0;
        if (layer2Position <= -100) layer2Position = 0;
        if (layer3Position <= -100) layer3Position = 0;
        
        // Применяем позиции к слоям
        layer1.style.backgroundPosition = `${layer1Position}px 0`;
        layer2.style.backgroundPosition = `${layer2Position}px 0`;
        layer3.style.backgroundPosition = `${layer3Position}px 0`;
        
        // Анимация земли
        ground1Position -= gameSpeed;
        ground2Position -= gameSpeed;
        
        // Сброс позиций земли при достижении конца
        if (ground1Position <= -100) ground1Position = 0;
        if (ground2Position <= -100) ground2Position = 0;
        
        // Применяем позиции к земле
        ground1.style.left = `${ground1Position}px`;
        ground2.style.left = `${ground2Position}px`;

        // Перемещаем препятствия
        obstacles = obstacles.filter(obstacle => {
            const currentRight = parseInt(obstacle.style.right);
            const newRight = currentRight + gameSpeed;
            obstacle.style.right = `${newRight}px`;

            // Удаляем препятствия, которые вышли за экран
            if (newRight > window.innerWidth) {
                obstacle.remove();
                return false;
            }

            return true;
        });

        // Проверяем столкновения
        if (checkCollision()) {
            endGame();
            return;
        }

        animationId = requestAnimationFrame(updateGame);
    }

    // Функция начала игры
    function startGame() {
        // Сброс состояния игры
        score = 0;
        gameSpeed = 5;
        scoreElement.textContent = score;
        playerBottom = 100;
        player.style.bottom = `${playerBottom}px`;
        
        // Сброс позиций фонов
        layer1Position = 0;
        layer2Position = 0;
        layer3Position = 0;
        ground1Position = 0;
        ground2Position = 0;
        
        // Применяем начальные позиции
        if (layer1) layer1.style.backgroundPosition = '0px 0';
        if (layer2) layer2.style.backgroundPosition = '0px 0';
        if (layer3) layer3.style.backgroundPosition = '0px 0';
        if (ground1) ground1.style.left = '0px';
        if (ground2) ground2.style.left = '100%';

        // Очистка старых препятствий и облаков
        obstacles.forEach(obstacle => obstacle.remove());
        obstacles = [];
        clouds.forEach(cloud => cloud.remove());
        clouds = [];

        // Переключение экранов
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        gameRunning = true;

        // Запускаем генерацию облаков
        cloudTimer = setInterval(createCloud, cloudFrequency);
        createCloud(); // Создаем первое облако сразу

        // Запускаем генерацию препятствий
        obstacleTimer = setInterval(createObstacle, obstacleFrequency);
        createObstacle(); // Создаем первое препятствие сразу

        // Запускаем счетчик очков
        scoreTimer = setInterval(() => {
            score++;
            scoreElement.textContent = score;
        }, 100);

        // Увеличиваем сложность со временем
        difficultyTimer = setInterval(() => {
            if (gameSpeed < 12) {
                gameSpeed += 0.5;
            }
            if (obstacleFrequency > minObstacleFrequency) {
                obstacleFrequency -= 100;
                clearInterval(obstacleTimer);
                obstacleTimer = setInterval(createObstacle, obstacleFrequency);
            }
        }, 5000);

        // Запускаем игровой цикл
        updateGame();
    }

    // Функция завершения игры
    function endGame() {
        gameRunning = false;

        // Останавливаем все таймеры
        clearInterval(obstacleTimer);
        clearInterval(cloudTimer);
        clearInterval(scoreTimer);
        clearInterval(difficultyTimer);
        cancelAnimationFrame(animationId);

        // Показываем экран окончания игры
        finalScoreElement.textContent = score;
        gameScreen.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
    }

    // Обработчики событий
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    // Добавляем управление прыжком (клик/тап по игровой области)
    gameArea.addEventListener('click', (e) => {
        if (gameRunning) {
            e.preventDefault();
            jump();
        }
    });

    // Добавляем управление прыжком с клавиатуры (для тестирования на ПК)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            jump();
        }
    });

    // Добавляем поддержку сенсорного управления для мобильных устройств
    gameArea.addEventListener('touchstart', (e) => {
        if (gameRunning) {
            e.preventDefault();
            jump();
        }
    }, { passive: false });
    
    // Добавляем дополнительную обработку для некоторых мобильных браузеров
    gameArea.addEventListener('touchend', (e) => {
        if (gameRunning) {
            e.preventDefault();
            jump();
        }
    }, { passive: false });
    
    // Добавляем обработку для Pointer Events (современный стандарт)
    gameArea.addEventListener('pointerdown', (e) => {
        if (gameRunning) {
            e.preventDefault();
            jump();
        }
    });

    // Обнаружение Telegram WebApp API для интеграции с Telegram
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        // Можно добавить дополнительные функции интеграции с Telegram
        // Например, отправка счета в бота или использование Telegram пользователя
    }
});