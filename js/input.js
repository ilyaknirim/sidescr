// js/input.js
export function setupInput(game) {
    // Клавиатурные события
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            event.preventDefault();
            game.jump();
        }
    });

    // Сенсорные события для мобильных устройств
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (event) => {
        touchStartY = event.changedTouches[0].screenY;
    }, { passive: false });

    document.addEventListener('touchend', (event) => {
        touchEndY = event.changedTouches[0].screenY;
        const diffY = touchStartY - touchEndY;

        // Минимальное расстояние для прыжка
        if (diffY > 50) {
            event.preventDefault();
            game.jump();
        }
    }, { passive: false });

    // Предотвращение скролла при касании канваса
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
        }, { passive: false });
    }

    // Мышиные события (для десктопа)
    document.addEventListener('click', () => {
        game.jump();
    });

    console.log('Input handling initialized');
}
