// js/color-palette.js
export class ColorPalette {
    constructor() {
        this.palettes = [
            // Теплые палитры
            {
                name: 'Закат',
                background: ['#FFD89C', '#FFB347', '#FF8C42', '#FF6347'],
                ground: ['#8B4513', '#A0522D', '#CD853F'],
                character: ['#FF6B6B', '#FFA07A', '#FFD166'],
                obstacles: ['#E76F51', '#F4A261', '#E9C46A'],
                bgElements: ['#264653', '#2A9D8F', '#E9C46A']
            },
            // Холодные палитры
            {
                name: 'Океан',
                background: ['#87CEEB', '#4682B4', '#5F9EA0', '#B0E0E6'],
                ground: ['#228B22', '#32CD32', '#3CB371'],
                character: ['#4ECDC4', '#45B7D1', '#96CEB4'],
                obstacles: ['#1D3557', '#457B9D', '#A8DADC'],
                bgElements: ['#1D3557', '#457B9D', '#A8DADC']
            },
            // Пастельные
            {
                name: 'Пастель',
                background: ['#FFE5EC', '#FDE2E4', '#FAF0EA', '#F0EFEB'],
                ground: ['#D8E2DC', '#ECE4DB', '#FFE5D9'],
                character: ['#FFCBF2', '#F3C4FB', '#ECB0E1'],
                obstacles: ['#B5E2FA', '#F7AEF8', '#B388EB'],
                bgElements: ['#A9DEF9', '#D0F4DE', '#FF99C8']
            },
            // Яркие
            {
                name: 'Неон',
                background: ['#0D0221', '#261447', '#2E2157'],
                ground: ['#540D6E', '#72195A', '#8F2D56'],
                character: ['#F86624', '#FDCA40', '#F9C80E'],
                obstacles: ['#00FF9F', '#00B4D8', '#7209B7'],
                bgElements: ['#00FF9F', '#00B4D8', '#7209B7']
            },
            // Природные
            {
                name: 'Лес',
                background: ['#606C38', '#283618', '#3A5A40'],
                ground: ['#BC6C25', '#DDA15E', '#FEFAE0'],
                character: ['#F4A261', '#E76F51', '#E9C46A'],
                obstacles: ['#588157', '#3A5A40', '#344E41'],
                bgElements: ['#A3B18A', '#588157', '#3A5A40']
            }
        ];
        
        this.currentPalette = this.getRandomPalette();
    }
    
    getRandomPalette() {
        const randomIndex = Math.floor(Math.random() * this.palettes.length);
        return this.palettes[randomIndex];
    }
    
    getRandomColor(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    getBackgroundColor() {
        return this.getRandomColor(this.currentPalette.background);
    }
    
    getGroundColor() {
        return this.getRandomColor(this.currentPalette.ground);
    }
    
    getCharacterColor() {
        return this.getRandomColor(this.currentPalette.character);
    }
    
    getObstacleColor() {
        return this.getRandomColor(this.currentPalette.obstacles);
    }
    
    getBgElementColor() {
        return this.getRandomColor(this.currentPalette.bgElements);
    }
    
    getAllColors() {
        return {
            background: this.getBackgroundColor(),
            ground: this.getGroundColor(),
            character: this.getCharacterColor(),
            obstacle: this.getObstacleColor(),
            bgElement: this.getBgElementColor()
        };
    }
    
    setPalette(index) {
        if (index >= 0 && index < this.palettes.length) {
            this.currentPalette = this.palettes[index];
        }
    }
}