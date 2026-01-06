let exercises = [];
let currentIndex = 0;
let correctAnswers = 0;
let baseScore = 100;
let startTime;
let currentLevelName = '';
let currentPlayer = '';
let lastFeedback = '';

// רשימת שבח מגוונת ורנדומלית
const positiveWords = [
    "Correct!", "Good Job!", "Amazing!", "Excellent!",
    "Awesome!", "Great!", "Brilliant!", "Perfect!",
    "Nice!", "On Fire!", "Unstoppable!", "Superb!",
    "Fantastic!", "Keep it up!", "Sharp!", "Bravo!"
];

function validateAndStart() {
    const nameInput = document.getElementById('playerName');
    const errorMsg = document.getElementById('nameError');
    if (nameInput.value.trim() === "") {
        errorMsg.style.display = "block";
        nameInput.style.borderColor = "#ff0000";
        return;
    }
    errorMsg.style.display = "none";
    nameInput.style.borderColor = "#000";
    currentPlayer = nameInput.value.trim();
    const selectedRadio = document.querySelector('input[name="level"]:checked');
    currentLevelName = selectedRadio.getAttribute('data-name');
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
    document.getElementById('machine-title').innerText = "MODE: " + currentLevelName.toUpperCase();
    updateTableDisplay();
    startTime = Date.now();
    showExercise();
}

function showExercise() {
    const displayArea = document.getElementById('exercise-list');
    const current = exercises[currentIndex];
    const correctAns = current.num1 * current.num2;

    displayArea.innerHTML = `
        <div class="flashcard">
            <p style="font-weight: bold; margin-bottom: 5px;">PLAYER: ${currentPlayer}</p>
            <div class="game-screen-area" id="screenArea">
                <h2>${current.num1}×${current.num2}</h2>
            </div>
            <input type="tel" id="userGuess" autofocus placeholder="?" autocomplete="off" 
                   style="border: 3px solid #000; font-size: 36px; width: 140px; text-align: center; padding: 10px; font-family: inherit;">
            
            <button class="action-btn next-btn-styled" id="nextBtn">NEXT ➔</button>
            
            <p style="font-size: 14px; margin-top: 10px;">QUESTION ${currentIndex + 1}/30</p>
            <div id="feedbackArea" class="feedback-msg">${lastFeedback}</div>
        </div>
    `;

    const input = document.getElementById('userGuess');
    const nextBtn = document.getElementById('nextBtn');
    input.focus();

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer(correctAns);
    });

    nextBtn.addEventListener('click', () => {
        checkAnswer(correctAns);
    });
}

function checkAnswer(correctAns) {
    const input = document.getElementById('userGuess');
    const screen = document.getElementById('screenArea');
    const val = parseInt(input.value);

    if (isNaN(val)) return;

    if (val === correctAns) {
        correctAnswers++;
        const word = positiveWords[Math.floor(Math.random() * positiveWords.length)];
        lastFeedback = `<span class="feedback-success">${word}</span>`;
        nextStep();
    } else {
        baseScore -= 3;
        // ניסוח אנגלי תקני וחד
        lastFeedback = `<span class="feedback-error">Incorrect! Correct: ${correctAns}</span>`;

        screen.classList.remove('shake');
        void screen.offsetWidth;
        screen.classList.add('shake');

        setTimeout(() => {
            nextStep();
        }, 300);
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
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const durationSeconds = (Date.now() - startTime) / 1000;
    const timePenalty = Math.max(0, (durationSeconds - 300) / 10);
    const finalScore = Math.round(Math.max(0, baseScore - timePenalty));
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = Math.floor(durationSeconds % 60);
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const successRate = ((correctAnswers / 30) * 100).toFixed(2);

    saveHighScore(currentPlayer, finalScore, formattedTime, successRate, correctAnswers);

    document.getElementById('exercise-list').innerHTML = `
        <div style="text-align: center; line-height: 1.6; font-weight: bold; margin-top: -20px;">
            <h2 style="border-bottom: 2px solid #000; display: inline-block; padding-bottom: 5px; margin-bottom: 20px;">GAME OVER</h2>
            <div style="font-size: 14px; text-align: center; display: inline-block;">
                <p>Date: ${dateStr}</p>
                <p>Level: ${currentLevelName}</p>
                <p>Correct Answers: ${correctAnswers}/30</p>
                <p>Success Rate: ${successRate}%</p>
                <p>Duration: ${formattedTime}</p>
                <p style="font-size: 24px; margin-top: 15px; border: 2px solid #000; padding: 10px;">SCORE: ${finalScore}</p>
            </div>
        </div>
    `;
    updateTableDisplay();
}

function saveHighScore(name, score, duration, rate, correct) {
    const key = `highScores_${currentLevelName}`;
    let scores = JSON.parse(localStorage.getItem(key)) || [];
    scores.push({ name, score, duration, rate, correct });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(scores.slice(0, 10)));
}

function updateTableDisplay() {
    if (!currentLevelName) return;
    const key = `highScores_${currentLevelName}`;
    let scores = JSON.parse(localStorage.getItem(key)) || [];
    const body = document.getElementById('high-score-body');
    document.getElementById('table-title').innerText = `HALL OF FAME - ${currentLevelName.toUpperCase()}`;
    body.innerHTML = scores.map((s, i) => `
        <tr><td>#${i + 1}</td><td><b>${s.name}</b></td><td>${s.score}</td><td>${s.duration}</td><td>${s.correct}/30</td><td>${s.rate}%</td></tr>
    `).join('');
}




// לניקוי הטבלה, מחק את ה-// מהשורה הבאה ושמור:
// localStorage.clear(); location.reload();