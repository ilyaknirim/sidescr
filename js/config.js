// js/config.js
export const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#FFD166',
    '#FF8C42', '#74B9FF', '#A29BFE', '#FD79A8',
    '#E17055', '#00B894', '#00CEC9', '#FDCB6E'
];

export const GAME_CONFIG = {
    // Физика
    GRAVITY: 0.5,
    JUMP_STRENGTH: -10,
    INITIAL_SPEED: 2,
    MAX_SPEED: 8,
    GROUND_HEIGHT: 100,

    // Визуал
    BACKGROUND_COLOR: '#87CEEB',
    GROUND_COLOR: '#8FBC8F',

    // Игровой процесс
    OBSTACLE_SPAWN_RATE: 100,
    SPEED_INCREASE_RATE: 500,
    SPEED_INCREMENT: 0.5,
    SCORE_INCREMENT: 0.01,

    // Персонаж
    CHARACTER: {
        MIN_WIDTH: 40,
        MAX_WIDTH: 60,
        MIN_HEIGHT: 50,
        MAX_HEIGHT: 70,
        START_X: 100
    },

    // Препятствия
    OBSTACLE: {
        MIN_WIDTH: 30,
        MAX_WIDTH: 80,
        MIN_HEIGHT: 40,
        MAX_HEIGHT: 120,
        TYPES: ['tree', 'rock', 'cloud', 'house', 'car', 'animal', 'mushroom', 'flower']
    },

    // Фон
    BACKGROUND_ELEMENTS_COUNT: 5,
    BG_ELEMENT_TYPES: ['cloud', 'tree'],

    // Аудио
    AUDIO: {
        ENABLED: true,
        VOLUME: 0.5,
        BACKGROUND_MUSIC_INTERVAL: 30
    },

    // Частицы
    PARTICLES: {
        JUMP_COUNT: 15,
        COLLISION_COUNT: 30,
        TRAIL_CHANCE: 0.3,
        MAX_PARTICLES: 500
    }
};
