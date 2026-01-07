let exercises = [];
let currentIndex = 0;
let correctAnswers = 0;
let baseScore = 100;
let startTime;
let currentLevelName = '';
let currentPlayer = '';

const positiveWords = ["Correct!", "Good Job!", "Amazing!", "Excellent!", "Awesome!", "Great!"];

// פונקציית איפוס
function secureReset() {
    if (prompt("ENTER PASSWORD:") === "4327") {
        localStorage.clear();
        location.reload();
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
    exercises = []; currentIndex = 0; correctAnswers = 0; baseScore = 100;
    for (let i = 0; i < 30; i++) {
        exercises.push({
            num1: Math.floor(Math.random() * choice) + 1,
            num2: Math.floor(Math.random() * choice) + 1
        });
    }
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-play-area').style.display = 'block';
    document.getElementById('machine-title').innerText = currentLevelName.toUpperCase();
    document.getElementById('displayPlayerName').innerText = `PLAYER: ${currentPlayer}`;
    
    startTime = Date.now();
    setupInputListeners(); // הגדרת המאזינים פעם אחת בלבד
    showExercise();
}

function setupInputListeners() {
    const input = document.getElementById('userGuess');
    const nextBtn = document.getElementById('nextBtn');

    // מאזין למקלדת - הופך את ה-Done/Enter ל-Next
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmission();
        }
    });

    nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleSubmission();
    });
}

function showExercise() {
    const current = exercises[currentIndex];
    const input = document.getElementById('userGuess');
    
    document.getElementById('exerciseDisplay').innerText = `${current.num1}×${current.num2}`;
    document.getElementById('questionCounter').innerText = `QUESTION ${currentIndex + 1}/30`;
    
    input.value = '';
    
    // החזרת פוקוס כדי שהמקלדת לא תיסגר
    setTimeout(() => {
        input.focus();
    }, 10);
}

function handleSubmission() {
    const input = document.getElementById('userGuess');
    const val = parseInt(input.value);
    const current = exercises[currentIndex];
    const correctAns = current.num1 * current.num2;

    if (isNaN(val)) {
        input.focus();
        return;
    }

    const feedbackArea = document.getElementById('feedbackArea');
    if (val === correctAns) {
        correctAnswers++;
        feedbackArea.innerHTML = `<span style="color:green">${positiveWords[Math.floor(Math.random() * positiveWords.length)]}</span>`;
        nextStep();
    } else {
        baseScore -= 3;
        feedbackArea.innerHTML = `<span style="color:red">Wrong! Answer: ${correctAns}</span>`;
        document.getElementById('screenArea').classList.add('shake');
        setTimeout(() => {
            document.getElementById('screenArea').classList.remove('shake');
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
    document.getElementById('game-play-area').style.display = 'none';
    const durationSeconds = (Date.now() - startTime) / 1000;
    const timePenalty = Math.max(0, (durationSeconds - 300) / 10);
    const finalScore = Math.round(Math.max(0, baseScore - timePenalty));
    const timeStr = `${Math.floor(durationSeconds / 60).toString().padStart(2, '0')}:${Math.floor(durationSeconds % 60).toString().padStart(2, '0')}`;

    saveHighScore(currentPlayer, finalScore, timeStr);

    document.getElementById('end-screen').innerHTML = `
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

// פונקציית שמירה משופרת לנייד
function saveHighScore(name, score, duration) {
    try {
        const key = `highScores_${currentLevelName}`;
        let scores = JSON.parse(localStorage.getItem(key)) || [];
        scores.push({ name, score, duration });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem(key, JSON.stringify(scores.slice(0, 10)));
    } catch (e) {
        console.error("Storage error:", e);
    }
}

function updateTableDisplay() {
    const selectedLevel = document.getElementById('levelSelector').value;
    const key = `highScores_${selectedLevel}`;
    const scores = JSON.parse(localStorage.getItem(key)) || [];
    const body = document.getElementById('high-score-body');
    if (body) {
        body.innerHTML = scores.map((s, i) => `
            <tr><td>#${i + 1}</td><td><b>${s.name}</b></td><td>${s.score}</td></tr>
        `).join('');
    }
}

window.onload = updateTableDisplay;
