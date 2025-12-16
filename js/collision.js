// js/collision.js
export function checkCollision(character, obstacle) {
    return character.x < obstacle.x + obstacle.width &&
           character.x + character.width > obstacle.x &&
           character.y < obstacle.y + obstacle.height &&
           character.y + character.height > obstacle.y;
}

export function checkAllCollisions(character, obstacles) {
    for (const obstacle of obstacles) {
        if (checkCollision(character, obstacle)) {
            return true;
        }
    }
    return false;
}