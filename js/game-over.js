// js/game-over.js
export class GameOverManager {
    constructor() {
        this.texts = [];
        this.loading = false;
    }
    
    async loadTexts() {
        if (this.loading) return false;
        
        this.loading = true;
        try {
            console.log('Загрузка мотивационных фраз...');
            const response = await fetch('texts.txt');
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            const text = await response.text();
            this.texts = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            console.log(`Загружено ${this.texts.length} фраз`);
            
            if (this.texts.length === 0) {
                throw new Error('Файл пустой');
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            this.useDefaultTexts();
            return false;
        } finally {
            this.loading = false;
        }
    }
    
    useDefaultTexts() {
        this.texts = [
            "Не жди идеального момента. Возьми и сделай этот момент идеальным.",
            "Упс, игра окончена! Но ты был близок к рекорду.",
            "Не расстраивайся, следующий раз повезет больше.",
            "Игра окончена, но опыт получен! Продолжай тренироваться.",
            "Ты справился отлично, но в этот раз не повезло."
        ];
    }
    
    getRandomText() {
        if (this.texts.length === 0) {
            this.useDefaultTexts();
        }
        
        const index = Math.floor(Math.random() * this.texts.length);
        return this.texts[index];
    }
    
    speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
    }
    
    show(score) {
        const text = this.getRandomText();
        const scoreText = Math.floor(score);
        
        // Обновляем DOM
        document.getElementById('gameOverText').textContent = text;
        document.getElementById('gameOverScore').textContent = `Счет: ${scoreText}`;
        document.getElementById('gameOverModal').style.display = 'flex';
        
        // Озвучиваем
        this.speakText(text);
        
        return text;
    }
    
    hide() {
        document.getElementById('gameOverModal').style.display = 'none';
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
}