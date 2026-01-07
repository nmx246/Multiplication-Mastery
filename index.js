let exercises = [];
let currentIndex = 0;
let correctAnswers = 0;
let baseScore = 100;
let startTime;
let currentLevelName = '';
let currentPlayer = '';
let lastFeedback = '';

const positiveWords = ["Correct!", "Good Job!", "Amazing!", "Excellent!", "Awesome!", "Great!"];

function validateAndStart() {
    const nameInput = document.getElementById('playerName');
    const errorMsg = document.getElementById('nameError');
    if (nameInput.value.trim() === "") {
        errorMsg.style.display = "block";
        return;
    }
    errorMsg.style.display = "none";
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
    document.getElementById('machine-title').innerText = currentLevelName.toUpperCase();
    startTime = Date.now();
    showExercise();
}

function showExercise() {
    const displayArea = document.getElementById('exercise-list');
    const current = exercises[currentIndex];
    const correctAns = current.num1 * current.num2;

    displayArea.innerHTML = `
        <div class="flashcard">
            <p style="font-weight: bold; font-size:16px; margin-bottom:10px;">PLAYER: ${currentPlayer}</p>
            <div class="game-screen-area" id="screenArea">
                <h2>${current.num1}×${current.num2}</h2>
            </div>
            <input type="number" id="userGuess" inputmode="numeric" autofocus placeholder="?" autocomplete="off" 
                   style="border: 3px solid #000; font-size: 36px; width: 140px; text-align: center; padding: 10px; font-family: inherit;">
            <button class="action-btn" style="background: #000; color: #fff; margin-top: 25px; width:90%;" id="nextBtn">NEXT ➔</button>
            <p style="font-size: 14px; margin-top: 15px; font-weight:bold;">QUESTION ${currentIndex + 1}/30</p>
            <div id="feedbackArea" class="feedback-msg" style="font-size:16px; font-weight:bold; margin-top:10px; min-height:25px;">${lastFeedback}</div>
        </div>
    `;

    const input = document.getElementById('userGuess');
    input.focus();

    // תיקון למעבר שאלה בנייד (Done / Enter)
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkAnswer(correctAns);
        }
    });

    document.getElementById('nextBtn').addEventListener('click', function (e) {
        e.preventDefault();
        checkAnswer(correctAns);
    });
}

function checkAnswer(correctAns) {
    const input = document.getElementById('userGuess');
    if (!input) return;

    const val = parseInt(input.value);
    if (isNaN(val)) return;

    if (val === correctAns) {
        correctAnswers++;
        lastFeedback = `<span style="color:green">${positiveWords[Math.floor(Math.random() * positiveWords.length)]}</span>`;
        nextStep();
    } else {
        baseScore -= 3;
        lastFeedback = `<span style="color:red">Wrong! Answer: ${correctAns}</span>`;
        const screen = document.getElementById('screenArea');
        if (screen) screen.classList.add('shake');
        setTimeout(() => {
            if (screen) screen.classList.remove('shake');
            nextStep();
        }, 400);
    }
}

function nextStep() {
    currentIndex++;
    if (currentIndex < exercises.length) {
        showExercise();
    } else {
        finishGame();
    }
}

function finishGame() {
    const durationSeconds = (Date.now() - startTime) / 1000;
    const timePenalty = Math.max(0, (durationSeconds - 300) / 10);
    const finalScore = Math.round(Math.max(0, baseScore - timePenalty));
    const timeStr = `${Math.floor(durationSeconds / 60).toString().padStart(2, '0')}:${Math.floor(durationSeconds % 60).toString().padStart(2, '0')}`;

    saveHighScore(currentPlayer, finalScore, timeStr);

    document.getElementById('exercise-list').innerHTML = `
        <div style="font-weight: bold; margin-top: 20px;">
            <h2 style="border-bottom: 2px solid #000; margin-bottom: 20px; font-size: 32px;">GAME OVER</h2>
            <p style="font-size: 20px;">Correct: ${correctAnswers}/30</p>
            <p style="font-size: 20px;">Time: ${timeStr}</p>
            <div style="font-size: 36px; border: 4px solid #000; padding: 20px; margin: 20px auto; background:#000; color:#fff; width: fit-content;">
                SCORE: ${finalScore}
            </div>
        </div>
    `;
    updateTableDisplay();
}

function saveHighScore(name, score, duration) {
    const key = `highScores_${currentLevelName}`;
    let scores = JSON.parse(localStorage.getItem(key)) || [];
    scores.push({ name, score, duration });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(scores.slice(0, 10)));
}

function updateTableDisplay() {
    const selectedLevel = document.getElementById('levelSelector').value;
    const key = `highScores_${selectedLevel}`;
    let scores = JSON.parse(localStorage.getItem(key)) || [];
    const body = document.getElementById('high-score-body');
    if (body) {
        body.innerHTML = scores.map((s, i) => `
            <tr><td>#${i + 1}</td><td><b>${s.name}</b></td><td>${s.score}</td></tr>
        `).join('');
    }
}

window.onload = updateTableDisplay;

// לניקוי הטבלה, מחק את ה-// מהשורה הבאה ושמור:
// localStorage.clear(); location.reload();
