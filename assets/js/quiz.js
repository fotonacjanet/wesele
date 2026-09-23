// Ile pytań losujemy do jednego podejścia
const LICZBA_PYTAN = 10;
const LITERY = 'abcdefgh';

let allQuestions = [];
let selectedQuestions = [];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('questionsContainer').addEventListener('change', updateProgress);
    document.getElementById('submitBtn').addEventListener('click', checkQuiz);

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
            // Otwarta z dysku (file://) strona nie może pobrać pliku JSON – podpowiadamy, co zrobić
            const hint = location.protocol === 'file:'
                ? 'Przeglądarka blokuje wczytywanie pytań, gdy strona jest otwarta prosto z dysku. Otwórz ją przez serwer, np. GitHub Pages albo polecenie „python -m http.server” w folderze projektu.'
                : 'Odśwież stronę.';
            document.getElementById('questionsContainer').innerHTML =
                `<p class="quiz-error">Nie udało się załadować pytań. ${hint}</p>`;
        });
});

// Tasowanie Fishera–Yatesa: każda kolejność jest równie prawdopodobna
function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function initQuiz() {
    // Losowanie unikalnych pytań; kolejność odpowiedzi też jest losowana,
    // więc zapamiętujemy przy każdej odpowiedzi, czy jest poprawna
    selectedQuestions = shuffle(allQuestions)
        .slice(0, LICZBA_PYTAN)
        .map(q => ({
            question: q.question,
            explanation: q.explanation,
            options: shuffle(q.options.map((text, index) => ({ text, correct: index === q.answer })))
        }));

    const container = document.getElementById('questionsContainer');
    container.innerHTML = ''; // czyszczenie

    selectedQuestions.forEach((q, index) => {
        // fieldset + legend: czytnik ekranu odczyta treść pytania przy każdej odpowiedzi
        const questionDiv = document.createElement('fieldset');
        questionDiv.className = 'question-block';

        let html = `<legend class="question">${index + 1}. ${q.question}</legend>`;
        html += `<ul class="options">`;

        q.options.forEach((opt, optIndex) => {
            html += `
                <li>
                    <label>
                        <input type="radio" name="q${index}" value="${optIndex}">
                        <span>${LITERY[optIndex]}) ${opt.text}</span>
                    </label>
                </li>
            `;
        });
        html += `</ul>`;
        html += `<div class="explanation" hidden></div>`;

        questionDiv.innerHTML = html;
        container.appendChild(questionDiv);
    });

    // Pokazanie przycisku i paska postępu po załadowaniu pytań
    document.getElementById('result').innerHTML = '';
    document.getElementById('submitBtn').style.display = 'block';
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('progressLabel').hidden = false;
    updateProgress();
}

function updateProgress() {
    let answered = 0;
    for (let i = 0; i < selectedQuestions.length; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected) {
            answered++;
        }
    }

    const percentage = (answered / selectedQuestions.length) * 100;
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressLabel').textContent = `Odpowiedziano: ${answered} z ${selectedQuestions.length}`;
}

function checkQuiz() {
    let score = 0;
    const total = selectedQuestions.length;
    const blocks = document.querySelectorAll('#questionsContainer .question-block');

    selectedQuestions.forEach((q, i) => {
        const labels = blocks[i].querySelectorAll('label');
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        const userAnswer = selected ? parseInt(selected.value) : null;
        const correctIndex = q.options.findIndex(opt => opt.correct);

        labels[correctIndex].classList.add('is-correct');

        let status;
        if (userAnswer === correctIndex) {
            score++;
            status = '<span class="correct-answer">Poprawnie.</span>';
        } else if (userAnswer === null) {
            status = '<span class="wrong-answer">Brak odpowiedzi.</span>';
        } else {
            labels[userAnswer].classList.add('is-wrong');
            status = '<span class="wrong-answer">Błędnie.</span>';
        }

        const explanation = blocks[i].querySelector('.explanation');
        explanation.innerHTML = `${status} ${q.explanation || ''}`;
        explanation.hidden = false;
    });

    const resultDiv = document.getElementById('result');
    resultDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';

    let scoreHtml = '';
    if (score === total) {
        resultDiv.style.color = '#d4b886'; // Złoty
        scoreHtml = `Twój wynik: ${score}/${total}.<br>Znakomicie! Złoty róg jest bezpieczny w Twoich dłoniach. Matura z „Wesela” nie sprawi Ci kłopotu.`;
    } else if (score >= total * 0.6) {
        resultDiv.style.color = '#f4f1ea'; // Jasny papier
        scoreHtml = `Twój wynik: ${score}/${total}.<br>Dobrze, lecz uważaj – nie daj się porwać chocholim tańcom i powtórz jeszcze kilka szczegółów.`;
    } else {
        resultDiv.style.color = '#ff9999'; // Jasnoczerwony
        scoreHtml = `Twój wynik: ${score}/${total}.<br>Niestety, ostał Ci się ino sznur... Czeka Cię powtórka materiału, by obudzić się z tego letargu!`;
    }

    resultDiv.innerHTML = scoreHtml
        + '<p class="result-hint">Poprawne odpowiedzi i wyjaśnienia znajdziesz przy każdym pytaniu.</p>'
        + '<button type="button" id="restartBtn">Spróbuj ponownie – nowe pytania</button>';
    document.getElementById('restartBtn').addEventListener('click', () => {
        initQuiz();
        document.getElementById('quiz').scrollIntoView();
    });

    // Zablokuj możliwość zmiany odpowiedzi
    const inputs = document.querySelectorAll('#questionsContainer input[type="radio"]');
    inputs.forEach(input => input.disabled = true);
    document.getElementById('submitBtn').style.display = 'none';
    resultDiv.scrollIntoView({ block: 'nearest' });
}
