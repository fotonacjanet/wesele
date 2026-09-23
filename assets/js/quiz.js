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

function initQuiz() {
    // Losowanie 5 unikalnych pytan
    let shuffled = allQuestions.sort(() => 0.5 - Math.random());
    selectedQuestions = shuffled.slice(0, 5);

    const container = document.getElementById('questionsContainer');
    container.innerHTML = ''; // czyszczenie

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
                        ${['a', 'b', 'c'][optIndex]}) ${opt}
                    </label>
                </li>
            `;
        });
        html += `</ul>`;
        
        questionDiv.innerHTML = html;
        container.appendChild(questionDiv);
    });

    // Pokazanie przycisku i paska postepu po zaladowaniu pytan
    document.getElementById('submitBtn').style.display = 'block';
    document.getElementById('progressContainer').style.display = 'block';
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
}

function checkQuiz() {
    let score = 0;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    
    let summaryHtml = '<div class="quiz-summary"><h3>Podsumowanie odpowiedzi:</h3><ul>';

    for (let i = 0; i < selectedQuestions.length; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        const q = selectedQuestions[i];
        
        if (selected) {
            const userAnswer = parseInt(selected.value);
            if (userAnswer === q.answer) {
                score++;
                summaryHtml += `<li>Pytanie ${i + 1}: <span class="correct-answer">Poprawnie</span></li>`;
            } else {
                summaryHtml += `<li>Pytanie ${i + 1}: <span class="wrong-answer">Błędnie</span> - prawidłowa odpowiedź to: ${['a', 'b', 'c'][q.answer]}) ${q.options[q.answer]}</li>`;
            }
        } else {
            summaryHtml += `<li>Pytanie ${i + 1}: <span class="wrong-answer">Brak odpowiedzi</span> - prawidłowa odpowiedź to: ${['a', 'b', 'c'][q.answer]}) ${q.options[q.answer]}</li>`;
        }
    }
    
    summaryHtml += '</ul></div>';

    resultDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    
    let scoreHtml = '';
    if (score === 5) {
        resultDiv.style.color = '#d4b886'; // Złoty
        scoreHtml = `Twój wynik: ${score}/5.<br>Znakomicie! Złoty róg jest bezpieczny w Twoich dłoniach. Matura z „Wesela” nie sprawi Ci kłopotu.`;
    } else if (score >= 3) {
        resultDiv.style.color = '#f4f1ea'; // Jasny papier
        scoreHtml = `Twój wynik: ${score}/5.<br>Dobrze, lecz uważaj – nie daj się porwać chocholim tańcom i powtórz jeszcze kilka szczegółów.`;
    } else {
        resultDiv.style.color = '#ff9999'; // Jasnoczerwony
        scoreHtml = `Twój wynik: ${score}/5.<br>Niestety, ostał Ci się ino sznur... Czeka Cię powtórka materiału, by obudzić się z tego letargu!`;
    }

    resultDiv.innerHTML = scoreHtml + summaryHtml;
    
    // Zablokuj mozliwosc zmiany odpowiedzi
    const inputs = document.querySelectorAll('input[type="radio"]');
    inputs.forEach(input => input.disabled = true);
    document.getElementById('submitBtn').style.display = 'none';
}
