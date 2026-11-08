const QUESTIONS_PER_QUIZ = 5;
const LETTERS = ['a', 'b', 'c', 'd'];

let allQuestions = [];
let selectedQuestions = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/pytania.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allQuestions = data;
            initQuiz();
        })
        .catch(error => {
            console.error('Błąd podczas ładowania pytań:', error);
            document.getElementById('questionsContainer').innerHTML = '<p style="color: #f44336; text-align: center;">Nie udało się załadować pytań. Odśwież stronę.</p>';
        });
});

// Tasowanie Fishera-Yatesa (rownomierne losowanie)
function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function initQuiz() {
    selectedQuestions = shuffle(allQuestions).slice(0, QUESTIONS_PER_QUIZ);

    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    document.getElementById('result').innerHTML = '';

    selectedQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-block';

        let html = `<div class="question">${index + 1}. ${q.question}</div>`;
        html += `<ul class="options">`;
        q.options.forEach((opt, optIndex) => {
            html += `
                <li>
                    <label>
                        <input type="radio" name="q${index}" value="${optIndex}" onchange="updateProgress()">
                        ${LETTERS[optIndex]}) ${opt}
                    </label>
                </li>
            `;
        });
        html += `</ul>`;

        questionDiv.innerHTML = html;
        container.appendChild(questionDiv);
    });

    document.getElementById('submitBtn').style.display = 'block';
    document.getElementById('retryBtn').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'block';
    updateProgress();
}

function updateProgress() {
    let answered = 0;
    for (let i = 0; i < selectedQuestions.length; i++) {
        if (document.querySelector(`input[name="q${i}"]:checked`)) {
            answered++;
        }
    }
    const percentage = (answered / selectedQuestions.length) * 100;
    document.getElementById('progressBar').style.width = percentage + '%';
}

function checkQuiz() {
    let score = 0;
    const total = selectedQuestions.length;
    const resultDiv = document.getElementById('result');

    let summaryHtml = '<div class="quiz-summary"><h3>Podsumowanie odpowiedzi:</h3><ul>';

    selectedQuestions.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        const correct = `${LETTERS[q.answer]}) ${q.options[q.answer]}`;

        if (selected && parseInt(selected.value, 10) === q.answer) {
            score++;
            summaryHtml += `<li>Pytanie ${i + 1}: <span class="correct-answer">Poprawnie</span></li>`;
        } else {
            const label = selected ? 'Błędnie' : 'Brak odpowiedzi';
            summaryHtml += `<li>Pytanie ${i + 1}: <span class="wrong-answer">${label}</span> - prawidłowa odpowiedź to: ${correct}</li>`;
        }
    });

    summaryHtml += '</ul></div>';

    resultDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';

    let scoreHtml = `Twój wynik: ${score}/${total}.<br>`;
    if (score === total) {
        resultDiv.style.color = '#e6c27a';
        scoreHtml += 'Znakomicie! Gospodarzysz wiedzą jak Boryna swoją ziemią – pełne sąsieki na maturę.';
    } else if (score >= Math.ceil(total * 0.6)) {
        resultDiv.style.color = '#f7f0e1';
        scoreHtml += 'Dobry plon, lecz nie wszystko zebrane z pola – powtórz jeszcze kilka szczegółów.';
    } else {
        resultDiv.style.color = '#ff9999';
        scoreHtml += 'Nieurodzaj... Trzeba wrócić do orki i zasiać wiedzę na nowo, nim nadejdą żniwa!';
    }

    resultDiv.innerHTML = scoreHtml + summaryHtml;

    document.querySelectorAll('input[type="radio"]').forEach(input => input.disabled = true);
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('retryBtn').style.display = 'block';
}
