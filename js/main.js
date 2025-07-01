document.addEventListener('DOMContentLoaded', () => {
    const timeEl = document.getElementById('time');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('high-score');
    const gameArea = document.getElementById('game-area');
    const plateLane = document.getElementById('plate-lane');
    const inputBox = document.getElementById('input-box');
    const startButton = document.getElementById('start-button');
    const difficultySelector = document.getElementById('difficulty-selector');

    const MEAT_WORDS = {
        easy: ['タン', 'ハツ', 'レバ', 'ミノ', 'ロース', 'カルビ'],
        normal: ['ハラミ', 'サガリ', 'シンシン', 'カメノコ', 'ランプ', 'イチボ'],
        hard: ['シャトーブリアン', 'ミスジ', 'ザブトン', 'トモサンカク', 'カイノミ']
    };
    const MEAT_ICONS = ['🍖', '🥩', '🥓'];

    let score = 0;
    let timeLeft = 60;
    let highScore = localStorage.getItem('highScore') || 0;
    let gameInterval;
    let plateInterval;
    let plates = [];
    let difficulty = 'easy';

    highScoreEl.textContent = highScore.toString().padStart(4, '0');

    function getDifficultySettings() {
        switch (difficulty) {
            case 'easy':
                return { speed: 2, interval: 2500, words: MEAT_WORDS.easy };
            case 'normal':
                return { speed: 4, interval: 2000, words: MEAT_WORDS.normal };
            case 'hard':
                return { speed: 6, interval: 1500, words: MEAT_WORDS.hard };
        }
    }

    function createPlate() {
        const settings = getDifficultySettings();
        const word = settings.words[Math.floor(Math.random() * settings.words.length)];
        const icon = MEAT_ICONS[Math.floor(Math.random() * MEAT_ICONS.length)];

        const plateEl = document.createElement('div');
        plateEl.classList.add('plate');
        plateEl.innerHTML = `<span class="meat-icon">${icon}</span><span class="word">${word}</span>`;
        
        const topPosition = Math.random() * (gameArea.clientHeight - 50);
        plateEl.style.top = `${topPosition}px`;
        plateEl.style.transform = `translateX(${gameArea.clientWidth}px)`;

        plateLane.appendChild(plateEl);
        
        const plateObj = {
            element: plateEl,
            word: word,
            position: gameArea.clientWidth,
            speed: settings.speed
        };
        plates.push(plateObj);
    }

    function movePlates() {
        plates.forEach((plate, index) => {
            plate.position -= plate.speed;
            plate.element.style.transform = `translateX(${plate.position}px)`;

            if (plate.position < -plate.element.clientWidth) {
                plate.element.remove();
                plates.splice(index, 1);
            }
        });
    }

    function startGame() {
        score = 0;
        timeLeft = 60;
        plates.forEach(p => p.element.remove());
        plates = [];
        
        scoreEl.textContent = '0000';
        timeEl.textContent = timeLeft;
        
        inputBox.disabled = false;
        inputBox.focus();
        startButton.disabled = true;
        difficultySelector.querySelectorAll('input').forEach(radio => radio.disabled = true);

        const settings = getDifficultySettings();

        gameInterval = setInterval(() => {
            timeLeft--;
            timeEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);

        plateInterval = setInterval(createPlate, settings.interval);
        requestAnimationFrame(updateGame);
    }

    function updateGame() {
        if (timeLeft > 0) {
            movePlates();
            requestAnimationFrame(updateGame);
        }
    }

    function endGame() {
        clearInterval(gameInterval);
        clearInterval(plateInterval);
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreEl.textContent = highScore.toString().padStart(4, '0');
        }
        
        inputBox.disabled = true;
        inputBox.value = '';
        startButton.disabled = false;
        difficultySelector.querySelectorAll('input').forEach(radio => radio.disabled = false);
        alert(`ゲーム終了！スコア: ${score}`);
    }

    let isComposing = false;

    function hiraganaToKatakana(str) {
        return str.replace(/[\u3041-\u3096]/g, function(match) {
            const charCode = match.charCodeAt(0) + 0x60;
            return String.fromCharCode(charCode);
        });
    }

    function handleTyping(e) {
        if (isComposing) return;
        const typedValue = e.target.value;
        const katakanaValue = hiraganaToKatakana(typedValue);
        const matchedPlate = plates.find(plate => plate.word === katakanaValue);

        if (matchedPlate) {
            score += 10;
            scoreEl.textContent = score.toString().padStart(4, '0');
            
            const index = plates.indexOf(matchedPlate);
            plates.splice(index, 1);
            matchedPlate.element.remove();
            
            e.target.value = '';
        }
    }

    startButton.addEventListener('click', startGame);

    inputBox.addEventListener('compositionstart', () => {
        isComposing = true;
    });

    inputBox.addEventListener('compositionend', (e) => {
        isComposing = false;
        handleTyping(e);
    });

    inputBox.addEventListener('input', handleTyping);
    difficultySelector.addEventListener('change', (e) => {
        if (e.target.name === 'difficulty') {
            difficulty = e.target.value;
        }
    });
});