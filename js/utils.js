// js/utils.js
import { COLORS } from './config.js';

export const Random = {
    color: () => {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    },
    
    size: (min, max) => Math.random() * (max - min) + min,
    
    bool: (probability = 0.5) => Math.random() > probability,
    
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    arrayElement: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    }
};

export function btoa(str) {
    return window.btoa(str);
}

export function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}