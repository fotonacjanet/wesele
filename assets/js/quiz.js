const QUESTIONS_PER_QUIZ = 5; // domyslnie; zestaw moze nadpisac polem "ile"
const LETTERS = ['a', 'b', 'c', 'd'];

let allQuestions = [];
let selectedQuestions = [];
let currentSet = null;

// Zestawy pytan: strona lektury moze zdefiniowac window.QUIZ_SETS = [{ id, label, src, opis? }].
// Bez tego ladowany jest jeden zestaw z data/pytania.json.
const QUIZ_SETS = window.QUIZ_SETS || [{ id: 'ogolny', label: 'Quiz', src: 'data/pytania.json' }];

document.addEventListener('DOMContentLoaded', () => {
    renderTabs();
    const fromHash = QUIZ_SETS.find(set => '#' + set.id === window.location.hash);
    loadSet(fromHash || QUIZ_SETS[0]);
});

function renderTabs() {
    const tabs = document.getElementById('quizTabs');
    if (!tabs || QUIZ_SETS.length < 2) return;
    tabs.innerHTML = QUIZ_SETS.map(set =>
        `<button type="button" class="quiz-tab" data-set="${set.id}">${set.label}</button>`
    ).join('');
    tabs.querySelectorAll('.quiz-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const set = QUIZ_SETS.find(s => s.id === btn.dataset.set);
            history.replaceState(null, '', '#' + set.id);
            loadSet(set);
        });
    });
}

function loadSet(set) {
    currentSet = set;
    document.querySelectorAll('.quiz-tab').forEach(btn =>
        btn.classList.toggle('active', btn.dataset.set === set.id));
    const desc = document.getElementById('quizSetDescription');
    if (desc) desc.textContent = set.opis || '';

    document.getElementById('questionsContainer').innerHTML = '<p style="text-align: center;">Trwa przygotowywanie pytań...</p>';
    document.getElementById('result').innerHTML = '';

    fetch(set.src)
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
}

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
    selectedQuestions = shuffle(allQuestions).slice(0, (currentSet && currentSet.ile) || QUESTIONS_PER_QUIZ);

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

    // Komunikaty ustawiane na stronie lektury (window.QUIZ_MESSAGES), z domyslnymi wartosciami
    const msg = Object.assign({
        perfect: 'Znakomicie! Jesteś gotów na maturę.',
        good: 'Dobrze, lecz powtórz jeszcze kilka szczegółów.',
        poor: 'Niestety – czeka Cię powtórka materiału.'
    }, window.QUIZ_MESSAGES || {});

    let scoreHtml = `Twój wynik: ${score}/${total}.<br>`;
    if (score === total) {
        resultDiv.style.color = 'var(--light-gold)';
        scoreHtml += msg.perfect;
    } else if (score >= Math.ceil(total * 0.6)) {
        resultDiv.style.color = 'var(--paper)';
        scoreHtml += msg.good;
    } else {
        resultDiv.style.color = '#ff9999';
        scoreHtml += msg.poor;
    }

    resultDiv.innerHTML = scoreHtml + summaryHtml;

    document.querySelectorAll('input[type="radio"]').forEach(input => input.disabled = true);
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('retryBtn').style.display = 'block';
}
