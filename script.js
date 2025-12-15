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

    // Случайные параметры для генерации мира
    let obstacleTypes = ['ground', 'air'];
    let obstacleFrequency = 2000; // Начальная частота появления препятствий
    let minObstacleFrequency = 800; // Минимальная частота
    let cloudFrequency = 3000;

    // Создаем землю
    const ground = document.createElement('div');
    ground.id = 'ground';
    gameArea.appendChild(ground);

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
            let jumpCount = 0;

            const jumpInterval = setInterval(() => {
                playerBottom += jumpPower;
                player.style.bottom = `${playerBottom}px`;
                jumpPower += gravity;
                jumpCount++;

                // Ограничение высоты прыжка
                if (playerBottom <= 100) {
                    playerBottom = 100;
                    player.style.bottom = `${playerBottom}px`;
                    clearInterval(jumpInterval);
                    isJumping = false;
                    jumpPower = -12; // Сброс силы прыжка
                }
            }, 20);
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

    // Добавляем управление прыжком (клик/тап по экрану)
    document.addEventListener('click', (e) => {
        // Исключаем клики по кнопкам
        if (e.target !== startButton && e.target !== restartButton) {
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
    document.addEventListener('touchstart', (e) => {
        // Исключаем касания по кнопкам
        if (e.target !== startButton && e.target !== restartButton) {
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