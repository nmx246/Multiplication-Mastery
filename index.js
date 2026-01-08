let exercises = [];
let currentIndex = 0;
let correctAnswers = 0;
let baseScore = 100;
let startTime;
let currentLevelName = '';
let currentPlayer = '';
let lastFeedback = '';

const positiveWords = ["Correct!", "Good Job!", "Amazing!", "Excellent!", "Awesome!", "Great!"];

function initButtonEffects() {
    const allBtns = document.querySelectorAll('.num-btn, .action-btn');
    allBtns.forEach(btn => {
        if (!btn.getAttribute('data-label')) {
            btn.setAttribute('data-label', btn.innerText);
        }

        btn.addEventListener('touchstart', () => {
            btn.classList.add('is-active');
            if (window.navigator.vibrate) window.navigator.vibrate(10);
        }, { passive: true });

        btn.addEventListener('touchend', () => {
            btn.classList.remove('is-active');
        }, { passive: true });

        btn.addEventListener('touchcancel', () => {
            btn.classList.remove('is-active');
        }, { passive: true });
    });
}

function showConfirmModal() {
    document.getElementById('confirmModal').style.display = 'flex';
}

function confirmClean(isSure) {
    if (isSure) {
        localStorage.clear();
        location.reload();
    } else {
        document.getElementById('confirmModal').style.display = 'none';
    }
}

function validateAndStart() {
    const nameInput = document.getElementById('playerName');
    if (nameInput.value.trim() === "") {
        document.getElementById('nameError').style.display = "block";
        return;
    }
    currentPlayer = nameInput.value.trim();
    const selectedRadio = document.querySelector('input[name="level"]:checked');
    currentLevelName = selectedRadio.getAttribute('data-name');
    document.getElementById('levelSelector').value = currentLevelName;
    startGame(parseInt(selectedRadio.value));
}

function startGame(choice) {
    exercises = []; currentIndex = 0; correctAnswers = 0; baseScore = 100; lastFeedback = '';
    for (let i = 0; i < 30; i++) {
        exercises.push({
            num1: Math.floor(Math.random() * choice) + 1,
            num2: Math.floor(Math.random() * choice) + 1
        });
    }
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-play-screen').style.display = 'block';

    document.getElementById('machine-title').innerText = "";
    document.getElementById('displayCurrentPlayer').innerText = `PLAYER: ${currentPlayer}`;
    document.getElementById('displayCurrentLevel').innerText = `LEVEL: ${currentLevelName.toUpperCase()}`;

    startTime = Date.now();
    setupInputListeners();
    showExercise();
}

function setupInputListeners() {
    const input = document.getElementById('userGuess');
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentIndex < exercises.length) {
                checkAnswer();
            }
        }
    });
}

function typeNum(val) {
    const input = document.getElementById('userGuess');
    if (val === 'del') {
        input.value = input.value.slice(0, -1);
    } else if (val === 'clear') {
        input.value = '';
    } else {
        if (input.value.length < 6) {
            input.value += val;
        }
    }
}

function showExercise() {
    const current = exercises[currentIndex];
    document.getElementById('exerciseDisplay').innerText = `${current.num1}×${current.num2}`;
    document.getElementById('questionCounter').innerText = `${currentIndex + 1}/30`;
    document.getElementById('feedbackArea').innerHTML = lastFeedback;

    const input = document.getElementById('userGuess');
    input.value = '';
    input.disabled = false;

    if (!('ontouchstart' in window)) {
        setTimeout(() => { input.focus(); }, 10);
    }
}

function checkAnswer() {
    const input = document.getElementById('userGuess');
    const val = parseInt(input.value);

    if (isNaN(val)) return;

    const correctAns = exercises[currentIndex].num1 * exercises[currentIndex].num2;

    if (val === correctAns) {
        correctAnswers++;
        lastFeedback = `<span style="color:green">${positiveWords[Math.floor(Math.random() * positiveWords.length)]}</span>`;
    } else {
        baseScore -= 3;
        lastFeedback = `<span style="color:red">Wrong! Answer: ${correctAns}</span>`;
        const screen = document.getElementById('screenArea');
        screen.classList.add('shake');
        setTimeout(() => screen.classList.remove('shake'), 400);
    }

    document.getElementById('feedbackArea').innerHTML = lastFeedback;

    if (currentIndex === exercises.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('finishBtn').style.display = 'block';
        input.disabled = true;
    } else {
        currentIndex++;
        setTimeout(showExercise, 400);
    }
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function finishGame() {
    document.getElementById('game-play-screen').style.display = 'none';
    const durationMs = Date.now() - startTime;
    const durationSeconds = durationMs / 1000;
    const timePenalty = Math.max(0, (durationSeconds - 300) / 10);
    const finalScore = Math.round(Math.max(0, baseScore - timePenalty));

    const successRate = ((correctAnswers / 30) * 100).toFixed(2);
    const timeStr = formatTime(durationMs);
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    saveHighScore(currentPlayer, finalScore, dateStr);

    document.getElementById('end-screen').innerHTML = `
        <div style="font-weight: bold; margin-top: 20px; line-height: 1.6;">
            <h2 style="border-bottom: 2px solid #000; margin-bottom: 20px; font-size: 32px;">GAME OVER</h2>
            <div style="text-align: left; display: inline-block; font-size: 18px; background: #eee; padding: 15px; border-radius: 10px; border: 2px solid #000;">
                <p>CORRECT ANSWERS: ${correctAnswers}/30</p>
                <p>SUCCESS RATE: ${successRate}%</p>
                <p>DURATION: ${timeStr}</p>
            </div>
            <div style="font-size: 36px; border: 4px solid #000; padding: 20px; margin: 25px auto; background:#000; color:#fff; width: fit-content; text-shadow: 0 0 5px #fff;">
                SCORE: ${finalScore}
            </div>
        </div>
    `;
    updateTableDisplay();
}

function saveHighScore(name, score, date) {
    try {
        const key = `highScores_${currentLevelName}`;
        let scores = JSON.parse(localStorage.getItem(key)) || [];
        scores.push({ name, score, date });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem(key, JSON.stringify(scores.slice(0, 10)));
    } catch (e) { console.error("Save failed", e); }
}

function updateTableDisplay() {
    try {
        const level = document.getElementById('levelSelector').value;
        const scores = JSON.parse(localStorage.getItem(`highScores_${level}`)) || [];
        document.getElementById('high-score-body').innerHTML = scores.map((s, i) => `
            <tr>
                <td>#${i + 1}</td>
                <td>${s.date}</td>
                <td><b>${s.name}</b></td>
                <td style="font-weight: 900;">${s.score}</td>
            </tr>
        `).join('');
    } catch (e) { console.error("Update failed", e); }
}

window.onload = () => {
    initButtonEffects();
    updateTableDisplay();
};
