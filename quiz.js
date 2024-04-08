const questionContainer = document.getElementById('question');
const answersContainer = document.getElementById('answers');
const progressBar = document.getElementById('progress-bar');

const questions_url = 'https://raw.githubusercontent.com/fsudzinski/QuizQuestions/main/questions.json';
let userScore = 0.0;
let correctAnswers = 0;
let isAnswerSelected = false;
const timeLimit = 100; // 10s
let timer;
let timeLeft;

let questions = [];

async function loadQuestions(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Wystąpił błąd podczas pobierania danych.');
      }
      const data = await response.json();
      questions = data;
      return data;
    } catch (error) {
      console.error('Błąd wczytywania pytań:', error);
      return [];
    }
  }

function startQuiz() {
    userScore = 0.0;
    correctAnswers = 0;
    displayQuestion(0);
}

function displayQuestion(index) {
    if (questions.length == 0) {
        questionContainer.textContent = "Trwa ładowanie pytania"
    }
    
    if (index < questions.length) {
        startTimer(index);        

        const currentQuestion = questions[index];
        questionContainer.textContent = currentQuestion.question;

        answersContainer.innerHTML = '';

        for (var key in currentQuestion.answers) {
            const button = document.createElement('button');
            button.classList.add('answer-btn');
            button.textContent = currentQuestion.answers[key];
            button.onclick = () => checkAnswer(currentQuestion, button, index);
            answersContainer.appendChild(button);
        }
    } else {
        displayEndScreen();
    }
  }

function checkAnswer(question, button, index) {
    if (isAnswerSelected) {
        return;
    }

    isAnswerSelected = true;

    const correctAnswer = question.answers[question.answer];

    if (button.textContent === correctAnswer) {
        button.style.backgroundColor = 'green';
        document.getElementById('correctSound').play();
        console.log(calculatePoints(question.points, timeLeft));
        userScore += calculatePoints(question.points, timeLeft);
        correctAnswers += 1;
    } else {
        button.style.backgroundColor = 'red';
        document.getElementById('incorrectSound').play();
    }

    clearInterval(timer);
    setTimeout(() => { displayQuestion(index + 1); isAnswerSelected = false; }, 750);
  }

function calculatePoints(maxPoints, time) {
    if (time > 60) {
        return maxPoints;
    } else if (time > 40) {
        return 3*maxPoints/4;
    } else if (time > 20) {
        return maxPoints/2;
    } else {
        return maxPoints/4;
    }
}

function displayStartScreen() {    
    const startButton = document.createElement('button');
    startButton.classList.add('answer-btn');
    startButton.textContent = 'Start';
    startButton.onclick = startQuiz;
    answersContainer.appendChild(startButton);
}

function displayEndScreen() {
    progressBar.style.display = 'none';
    let maxScore = 0;
    questions.forEach(question => {
        maxScore += question.points;
    });

    let highestScore = localStorage.getItem('highestScore');
    if (highestScore === null || userScore > highestScore) {
        localStorage.setItem('highestScore', userScore);
        highestScore = userScore;
    }

    questionContainer.textContent = '';
    answersContainer.innerHTML = `
    <div id="end-screen" class="end-screen">
        <div id="score-info" class="score-info">
            <p id="result">Wynik: ${userScore} / ${maxScore}</p>
            <p id="record">Rekord: ${highestScore}</p>
        </div>
        <div id="answers-info" class="answers-info">
            <p id="correct-answers">Poprawne odpowiedzi: ${correctAnswers}</p>
            <p id="incorrect-answers">Błędne odpowiedzi: ${questions.length - correctAnswers}</p>
        </div>
    </div>`
    
    const restartButton = document.createElement('button');
    restartButton.classList.add('answer-btn');
    restartButton.textContent = 'Od nowa?';
    restartButton.onclick = startQuiz;
    answersContainer.appendChild(restartButton);    
}

function startTimer(index) {   
    timeLeft = timeLimit;
    let width = 100;
    progressBar.value = width;
    progressBar.style.display = 'block';
  
    timer = setInterval(() => {
      timeLeft--;
      width = (timeLeft / timeLimit) * 100;
  
      progressBar.value = width;
      if (timeLeft === 0) {
        clearInterval(timer);
        displayQuestion(index+1);
      }
    }, 100);
  }

loadQuestions(questions_url);
displayStartScreen();
