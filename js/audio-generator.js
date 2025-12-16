// js/audio-generator.js
export class AudioGenerator {
    constructor() {
        this.audioContext = null;
        this.isAudioEnabled = true;
        
        // Попытка инициализации аудио
        this.initAudioContext();
        
        // Звуковой банк
        this.sounds = {
            jump: null,
            collision: null,
            coin: null,
            background: null
        };
        
        // Генерация звуков при инициализации
        if (this.audioContext) {
            this.generateSounds();
        }
    }
    
    initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('AudioContext инициализирован');
        } catch (e) {
            console.warn('Web Audio API не поддерживается:', e);
            this.isAudioEnabled = false;
        }
    }
    
    generateSounds() {
        if (!this.audioContext) return;
        
        // Прыжок
        this.sounds.jump = this.generateJumpSound();
        
        // Столкновение
        this.sounds.collision = this.generateCollisionSound();
        
        // Монетка (для будущих бонусов)
        this.sounds.coin = this.generateCoinSound();
        
        // Фоновая мелодия
        this.sounds.background = this.generateBackgroundMelody();
    }
    
    // Генерация звука прыжка
    generateJumpSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // До
        oscillator.frequency.exponentialRampToValueAtTime(659.25, this.audioContext.currentTime + 0.1); // Ми
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        return { oscillator, gainNode, duration: 0.3 };
    }
    
    // Генерация звука столкновения
    generateCollisionSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // Ля
        oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.2); // Ля на октаву ниже
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        return { oscillator, gainNode, duration: 0.5 };
    }
    
    // Генерация звука монетки
    generateCoinSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'triangle';
        
        // Арпеджио C-E-G
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // До
        oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.05); // Ми
        oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.1); // Соль
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        return { oscillator, gainNode, duration: 0.3 };
    }
    
    // Генерация фоновой мелодии
    generateBackgroundMelody() {
        const notes = [
            261.63,  // До
            293.66,  // Ре
            329.63,  // Ми
            349.23,  // Фа
            392.00,  // Соль
            440.00,  // Ля
            493.88   // Си
        ];
        
        const chords = [
            [0, 2, 4],  // До-Ми-Соль
            [2, 4, 6],  // Ми-Соль-Си
            [4, 6, 1],  // Соль-Си-Ре
            [1, 3, 5]   // Ре-Фа-Ля
        ];
        
        let currentChord = 0;
        let noteIndex = 0;
        
        return {
            play: () => {
                if (!this.isAudioEnabled) return;
                
                const chord = chords[currentChord];
                const noteValue = notes[chord[noteIndex % chord.length]];
                
                this.playNote(noteValue, 0.5);
                
                noteIndex++;
                if (noteIndex % 4 === 0) {
                    currentChord = (currentChord + 1) % chords.length;
                }
            },
            stop: () => {
                // Логика остановки фоновой музыки
            }
        };
    }
    
    playNote(frequency, duration) {
        if (!this.audioContext || !this.isAudioEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // Воспроизведение звуков
    playJump() {
        if (!this.isAudioEnabled || !this.sounds.jump) return;
        
        const sound = this.sounds.jump;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(659.25, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }
    
    playCollision() {
        if (!this.isAudioEnabled || !this.sounds.collision) return;
        
        const sound = this.sounds.collision;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }
    
    playCoin() {
        if (!this.isAudioEnabled || !this.sounds.coin) return;
        
        const sound = this.sounds.coin;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'triangle';
        
        const times = [0, 0.05, 0.1];
        const frequencies = [523.25, 659.25, 783.99];
        
        times.forEach((time, index) => {
            oscillator.frequency.setValueAtTime(frequencies[index], this.audioContext.currentTime + time);
        });
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }
    
    toggleSound() {
        this.isAudioEnabled = !this.isAudioEnabled;
        return this.isAudioEnabled;
    }
}