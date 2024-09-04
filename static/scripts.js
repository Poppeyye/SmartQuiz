document.addEventListener('DOMContentLoaded', () => {
    const userNameInput = document.getElementById('user-name');
    const startButton = document.getElementById('start-button');
    const welcomeContainer = document.getElementById('welcome-container');
    const categoryContainer = document.getElementById('category-container');
    const questionText = document.getElementById('question-text');
    const optionButton1 = document.getElementById('option-button-1');
    const optionButton2 = document.getElementById('option-button-2');
    const timerText = document.getElementById('timer-text');
    const resultText = document.getElementById('result-text');
    const scoreText = document.getElementById('score-text');
    const bestScoresList = document.getElementById('best-scores-list');
    const answerButtons = document.getElementById('answer-buttons');
    const funnyMessage = document.getElementById('funny-message');
    //const scoreTimer = document.getElementById('score-timer')
    const progressBarContainer = document.getElementById('progress-bar-container')
    const progressBar = document.getElementById('progress-bar');

    let correctAnswer = null;
    let timerInterval = null;
    let totalScore = 0;
    let bestScores = [];
    let userName = '';
    let selectedCategory = '';
    let gameEnded = null;

    // Función para mostrar la tabla de puntuaciones
    function displayBestScores() {
        // Limpiar la lista actual
        bestScoresList.innerHTML = '';

        // Ordenar las puntuaciones de mayor a menor si no se ha hecho antes
        bestScores.sort((a, b) => b.score - a.score);

        // Recorriendo la lista de puntuaciones
        bestScores.forEach((score, index) => {
            const li = document.createElement('li');

            // Añadir medalla según la posición
            if (index === 0) {
                li.innerHTML = `<img src="/static/svgs/gold.svg" alt="Medalla de Oro" width="20" height="20">${score.name}: ${score.score.toFixed(2)}`;
            } else if (index === 1) {
                li.innerHTML = `<img src="/static/svgs/silver.svg" alt="Medalla de Plata" width="20" height="20">${score.name}: ${score.score.toFixed(2)}`;
            } else if (index === 2) {
                li.innerHTML = `<img src="/static/svgs/bronze.svg" alt="Medalla de Bronce" width="20" height="20">${score.name}: ${score.score.toFixed(2)}`;
            } else {
                li.textContent = `${score.name}: ${score.score.toFixed(2)}`; // Sin medalla
            }

            // Añadir el <li> a la lista
            bestScoresList.appendChild(li);
        });
    }

    // Función para empezar el juego
    startButton.addEventListener('click', () => {
        startGame();
    });

    // Agregar evento para la tecla enter
    userNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            startGame();
        }
    });

    function startGame() {
        userName = userNameInput.value.trim();
        console.log(userName)
        if (userName) {
            // Enviar el nombre del usuario al backend
            fetch('/set_user_name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_name: userName }),
            })
            .then(response => {
                console.log(response)
                if (response.ok) {
                    welcomeContainer.style.display = 'none';
                    categoryContainer.style.display = 'block';
                } else {
                    alert('Hubo un error al establecer el nombre de usuario. Por favor, inténtalo de nuevo.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ocurrió un error al iniciar el juego.');
            });
        } else {
            alert('Por favor ingrese su nombre.');
        }
    }

    // Funciones para la selección de categoría
    document.getElementById('category-sports').addEventListener('click', () => { selectCategory('Deportes'); });
    document.getElementById('category-history').addEventListener('click', () => { selectCategory('Historia'); });
    document.getElementById('category-technology').addEventListener('click', () => { selectCategory('Software'); });
    document.getElementById('category-economy').addEventListener('click', () => { selectCategory('Economia'); });
    document.getElementById('category-fashion').addEventListener('click', () => { selectCategory('Moda'); });

    function selectCategory(category) {
        selectedCategory = category;
        categoryContainer.style.display = 'none';
        getBestScores();
        //resetUI();
        totalScore = 0;
        getQuestion();
    }

    function updateBestScores(userName, score) {
        const existingScoreIndex = bestScores.findIndex(entry => entry.name.toLowerCase() === userName.toLowerCase());

        if (existingScoreIndex !== -1) {
            bestScores[existingScoreIndex].score = Math.max(bestScores[existingScoreIndex].score, score);
        } else {
            bestScores.push({ name: userName, score: score });
        }

        bestScores.sort((a, b) => b.score - a.score);
        if (bestScores.length > 10) bestScores.pop();
        //displayFunnyMessage(userName, score)
        displayBestScores();
    }

    async function getAllScores() {
        try {
            const response = await fetch(`/get_all_scores/${selectedCategory}`);
            const data = await response.json();
            console.log(data)
            if (data.scores) {
                return data.scores;
            }
        } catch (error) {
            console.error('Error fetching all scores:', error);
            return [];
        }
    }

    async function getQuestion() {
        // Mostrar elementos del temporizador y la barra de progreso
        progressBarContainer.style.display = 'flex';
        timerText.style.display = 'flex';
        scoreText.style.display = 'flex';
        progressBar.style.width = '100%';

        // Detener el temporizador anterior si existe
        if (countdownInterval) {
            clearInterval(countdownInterval);
            gameEnded = false; // Asegúrate de reiniciar el estado del juego
        }

        try {
            const response = await fetch(`/get_question/${selectedCategory}`);
            console.log(response)
            const data = await response.json();
            if (data.error) {
                alert(data.error);
                return;
            }

            const options = [data.headline, data.fake_new];
            const shuffledOptions = options.sort(() => Math.random() - 0.5);
            optionButton1.textContent = shuffledOptions[0];
            optionButton2.textContent = shuffledOptions[1];
            correctAnswer = data.headline;

            answerButtons.style.display = 'flex';
            startCountdown();

        } catch (error) {
            console.error('Error fetching question:', error);
        }
    }

    let previousUserRank = null; // Variable para almacenar el rango anterior del usuario
    let userRank = 0;
    async function displayFunnyMessage(playerScore) {
        const url = selectedCategory ? `/get_user_rank/${selectedCategory}` : '/get_user_rank/';
        const params = new URLSearchParams({ playerScore });
        
        try {
            const response = await fetch(`${url}?${params}`);
            const data = await response.json();
    
            userRank = data.userRank;
            const totalUsers = data.totalUsers;
    
            console.log("Total Users:", totalUsers);
            console.log("User Rank:", userRank);
    
            let message = '';
    
            if (userRank === 0 || userRank > totalUsers) {
                message = '¡No se encontró tu puntuación en la lista!';
            } else if (userRank <= Math.ceil(totalUsers * 0.25)) {
                message = '¡Estás en el Top 25% de jugadores!';
            } else if (userRank <= Math.ceil(totalUsers * 0.50)) {
                message = '¡Estás en el Top 50% de jugadores!';
            } else if (userRank <= Math.ceil(totalUsers * 0.75)) {
                message = '¡Estás en el Top 75% de jugadores!';
            } else if (userRank <= 3) {
                message = '¡Estás en el Top 3!';
            } else if (userRank == 1) {
                message = 'Sin límite hacia arriba =D';
            } else {
                message = '¡Sigue intentándolo, lo harás mejor la próxima vez!';
            }
    
            if (previousUserRank !== userRank) {
                showRankingPopup(message);
                previousUserRank = userRank;
            }
    
            console.log(message);
        } catch (error) {
            console.error('Error fetching user rank:', error);
        }
    }
    

    function showRankingPopup(message) {
        const rankingPopup = document.createElement('div');
        rankingPopup.className = 'ranking-popup'; // Clase CSS para el pop-up
        rankingPopup.textContent = message;

        // Agregar el pop-up al DOM
        document.body.appendChild(rankingPopup);

        // Mostrar el pop-up
        setTimeout(() => {
            rankingPopup.style.opacity = 1; // Hacerlo visible
        }, 10); // Un pequeño delay para que se aplique el estilo

        // Desaparecer el pop-up después de 3 segundos
        setTimeout(() => {
            rankingPopup.style.opacity = 0; // Hacerlo invisible primero
            setTimeout(() => {
                document.body.removeChild(rankingPopup); // Remover del DOM después de que se desvanezca
            }, 300); // Duración del desvanecimiento
        }, 3000); // 3 segundos
    }
    async function submitScore(userName, totalScore) {
        try {
            const response = await fetch('/add_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userName,
                    score: totalScore,
                    category: selectedCategory
                }),
            });

            if (!response.ok) {
                throw new Error('Error al agregar la puntuación');
            }

            const result = await response.json();
            console.log(result.message); // Mensaje de éxito
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function getBestScores() {
        try {
            const response = await fetch(`/get_best_scores/${selectedCategory}`);
            const data = await response.json();
            if (data.scores) {
                bestScores = data.scores;
                displayBestScores();
            }
        } catch (error) {
            console.error('Error fetching best scores:', error);
        }
    }

    let countdownTime = 10; // Tiempo inicial en segundos
    let countdownInterval;
    let startTime;
    let remainingTime;

    function startCountdown() {
        startTime = Date.now();
        updateProgressBar();
        countdownInterval = setInterval(updateProgressBar, 100);
    }

    function updateProgressBar() {
        if (gameEnded) return;

        const elapsedTime = (Date.now() - startTime) / 1000;
        remainingTime = countdownTime - elapsedTime;
        const progressPercentage = (remainingTime / countdownTime) * 100;

        // Actualizar la barra de progreso
        progressBar.style.width = `${progressPercentage}%`;

        // Actualizar el texto del temporizador
        timerText.textContent = `Tiempo: ${remainingTime.toFixed(1)}s`;

        // Verificar si el tiempo ha terminado y detener el intervalo
        if (remainingTime <= 0 && !gameEnded) {
            endGame('Se acabó el tiempo!\n Puntuación Total: ');
        }

    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        progressBar.style.width = '0%';
        progressBarContainer.style.display = 'none';
        gameEnded = true;
        timerText.style.display = 'none';
    }

    function checkAnswer(userAnswer) {
        if (gameEnded) return;
        stopTimer();

        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000;

        if (userAnswer === correctAnswer) {
            handleCorrectAnswer(timeTaken);
        } else {
            gameEnded = true;
            endGame('Incorrecto!\n Puntuación total: ');
        }

        console.log(`Tiempo de respuesta: ${timeTaken.toFixed(2)}s`);
    }

    function showPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'popup-message'; // Clase CSS para el pop-up
        popup.textContent = message;

        // Agregar el pop-up al DOM
        document.body.appendChild(popup);

        // Mostrar el pop-up
        setTimeout(() => {
            popup.style.opacity = 1; // Hacerlo visible
        }, 10); // Un pequeño delay para que se aplique el estilo

        // Ocultar el pop-up después de un tiempo
        setTimeout(() => {
            popup.style.opacity = 0; // Comenzar a ocultar
            setTimeout(() => {
                document.body.removeChild(popup); // Eliminar del DOM después de la transición
            }, 300); // Esperar un poco antes de eliminar
        }, 1000); // Tiempo de visualización del pop-up
    }

    function handleCorrectAnswer(timeTaken) {
        const messages = ["¡Bien!", "¡Excelente!", "¡Sigue así!", "¡Muy bien hecho!", "¡Gran trabajo!", "¡Correcto!"];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // Mostrar el mensaje en el pop-up
        showPopup(randomMessage);

        // Aumentar la puntuación
        totalScore += Math.max(0, 10 - timeTaken);
        scoreText.textContent = `Puntuación Total: ${totalScore.toFixed(2)}`;

        // Llamar a displayFunnyMessage después de que el pop-up haya sido visible
        setTimeout(() => {
            displayFunnyMessage(totalScore);
            updateBestScores(userName, totalScore);

            // Obtener la siguiente pregunta, se puede agregar un tiempo para delay antes de hacer la siguiente pregunta
            getQuestion();
        }, 1300); // Asegúramos que no se interrumpa el pop-up
    }

    function endGame(msg) {

        // Establecer el mensaje de resultado
        stopTimer();

        resultText.textContent = `${msg}: ${totalScore.toFixed(2)}`;
        resultText.style.opacity = 1;

        // Enviar la puntuación
        submitScore(userName, totalScore);
        // Mostrar el mensaje de puntuación final como un pop-up
        showFinalOverlay();

        // Remover el pop-up de ranking si existe
        const rankingPopup = document.querySelector('.ranking-popup');
        if (rankingPopup) {
            document.body.removeChild(rankingPopup);
        }

        console.log(`Juego terminado. Puntuación final: ${totalScore.toFixed(2)}`);
    }
    function showFinalOverlay() {
        // Creamos el overlay
        const overlay = document.createElement('div');
        overlay.className = 'final-overlay';

        // Crear el cuadro del mensaje
        const messageBox = document.createElement('div');
        messageBox.className = 'message-box';

        const title = document.createElement('h2');
        title.textContent = '¡Juego Terminado!';
        title.className = 'overlay-title';

        const rankMessage = document.createElement('p');
        rankMessage.textContent = `Tu puesto en el ranking es: ${userRank}`;
        rankMessage.className = 'rank-message';

        const playAgainMessage = document.createElement('p');
        playAgainMessage.textContent = '¿Qué quieres hacer ahora?';
        playAgainMessage.className = 'overlay-subtitle';

        const returnButton = document.createElement('button');
        returnButton.textContent = 'Volver a Jugar';
        returnButton.className = 'btn';

        const rankingButton = document.createElement('button');
        rankingButton.textContent = 'Ver Rankings';
        rankingButton.className = 'btn';

        const shareButton = document.createElement('button');
        shareButton.textContent = 'Compartir Resultado';
        shareButton.className = 'btn';

        // Agregar los elementos al cuadro del mensaje
        messageBox.appendChild(title);
        messageBox.appendChild(rankMessage);
        messageBox.appendChild(playAgainMessage);
        messageBox.appendChild(returnButton);
        messageBox.appendChild(rankingButton);
        messageBox.appendChild(shareButton);
        overlay.appendChild(messageBox);
        document.body.appendChild(overlay);

        // Manejar eventos de los botones
        returnButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
            goToMainScreen();
        });
        rankingButton.addEventListener('click', () => {
            stopTimer();
            document.body.removeChild(overlay);
            window.location.href = '/rankings';
        });

        shareButton.addEventListener('click', () => {
            // La URL que deseas compartir
            const urlToShare = `https://127.0.0.1:5000/rankings?search=${userName}`; // Cambia esto por la URL que deseas compartir
        
            // Crea un enlace de AddToAny para compartir
            const shareURL = `https://www.addtoany.com/share_save?linkurl=${encodeURIComponent(urlToShare)}`;
        
            // Abre el enlace en una nueva ventana
            window.open(shareURL, '_blank');
        });
    }

    function goToMainScreen() {
        // Eliminar el ranking pop-up, si existe
        //const rankingPopup = document.querySelector('.ranking-popup');

        // Realizar la búsqueda para finalizar el juego
        fetch('/end_game', {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                welcomeContainer.style.display = 'block';
                answerButtons.style.display = 'none';
                userNameInput.value = userName;
                resultText.style.display = 'none';
                scoreText.style.display = 'none';
                //rankingPopup.style.display = 'none';
            });
    }

    function resetUI() {
        resultText.style.opacity = 0;
        timerText.style.display = 'none'; // Ocultar el temporizador
        answerButtons.style.display = 'none'; // Ocultar botones de respuesta
        funnyMessage.style.display = 'none'
        // Solo mostrar la puntuación anterior
        scoreText.style.display = 'block'; // Asegúrate de que la puntuación sea visible
    }

    optionButton1.addEventListener('click', () => {
        checkAnswer(optionButton1.textContent);
    });

    optionButton2.addEventListener('click', () => {
        checkAnswer(optionButton2.textContent);
    });
});

function generatDataURL(canvasSize, level) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvasSize;
    offscreenCanvas.height = canvasSize;
    const ctx = offscreenCanvas.getContext('2d');

    function drawSierpinskiCarpet(x, y, size, level) {
        if (level == 0) {
            ctx.fillStyle = "hsl(35, 50%, 65%)";
            ctx.fillRect(x, y, size, size);
            return;
        }

        const newSize = size / 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (!(i == 1 && j == 1)) {
                    drawSierpinskiCarpet(x + i * newSize, y + j * newSize, newSize, level - 1);
                }
            }
        }
    }

    drawSierpinskiCarpet(0, 0, canvasSize, level);
    return offscreenCanvas.toDataURL();
}

const canvasSize = window.innerWidth / 9;
const level = 5; // Adjust recursion level for detail
const dataURL = generatDataURL(canvasSize, level);
document.body.style.backgroundImage = `url(${dataURL})`;
