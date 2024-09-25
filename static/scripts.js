document.addEventListener('DOMContentLoaded', () => {
    const userNameInput = document.getElementById('user-name');
    const startButton = document.getElementById('start-button');
    const welcomeContainer = document.getElementById('welcome-container');
    const categoryContainer = document.getElementById('category-container');
    const rankingContainer = document.getElementById('ranking-container');
    const slogan = document.getElementById('slogan');
    const optionButton1 = document.getElementById('option-button-1');
    const optionButton2 = document.getElementById('option-button-2');
    const timerText = document.getElementById('timer-text');
    const resultText = document.getElementById('result-text');
    const scoreText = document.getElementById('score-text');
    const bestScoresList = document.getElementById('best-scores-list');
    const answerButtons = document.getElementById('answer-buttons');
    const questionText = document.getElementById('question-text');
    const flagImage = document.querySelector('#answer-buttons picture img');

    //const scoreTimer = document.getElementById('score-timer')
    const progressBarContainer = document.getElementById('progress-bar-container')
    const progressBar = document.getElementById('progress-bar');
    // music
    const backgroundMusic = document.getElementById('background-music');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const muteButton = document.getElementById('mute-button');
    backgroundMusic.volume = 0.1;
    correctSound.volume = 0.5;
    wrongSound.volume = 0.5;

    let correctAnswer = null;
    let timerInterval = null;
    let totalScore = 0;
    let bestScores = [];
    let userName = '';
    let selectedCategory = '';
    let gameEnded = null;
    let correctAnswersCount = 0; // Contador de respuestas correctas
    let totalTimeTaken = 0; // Acumulador del tiempo total tomado por las respuestas
    let isMuted = localStorage.getItem('isMuted') === 'true'; // Recuperar el estado del mute de localStorage

    // Inicialización del mute en la GUI
    toggleMute();

    // Manejo del botón de mute
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;  // Cambia el estado de silencio
        localStorage.setItem('isMuted', isMuted); // Almacena el nuevo estado
        toggleMute(); // Llama a la función para manejar el mute
    });
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
                li.innerHTML = `<img src="/static/svgs/gold.svg" alt="Medalla de Oro" width="20" height="20">${score.name}: ${score.score}`;
            } else if (index === 1) {
                li.innerHTML = `<img src="/static/svgs/silver.svg" alt="Medalla de Plata" width="20" height="20">${score.name}: ${score.score}`;
            } else if (index === 2) {
                li.innerHTML = `<img src="/static/svgs/bronze.svg" alt="Medalla de Bronce" width="20" height="20">${score.name}: ${score.score}`;
            } else {
                li.textContent = `${score.name}: ${score.score}`; // Sin medalla
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
        if (userName) {
            // Enviar el nombre del usuario al backend
            fetch('/set_user_name', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCookie('csrf_access_token'),

                },
                body: JSON.stringify({ user_name: userName }),
            })
            .then(response => {
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
    allCategories.forEach(category => {
        // Convertir el nombre de la categoría a minúsculas para coincidir con los IDs generados en HTML
        const categoryId = 'category-' + category.toLowerCase();

        // Seleccionar el botón correspondiente por su ID
        const button = document.getElementById(categoryId);

        // Verificar si el botón existe (en caso de que haya errores en el ID)
        if (button) {
            button.addEventListener('click', () => {
                // Llamar a la función selectCategory pasando el nombre de la categoría
                selectCategory(category);
            });
        }
    });

    function selectCategory(category) {
        selectedCategory = category;
        categoryContainer.style.display = 'none';
        getBestScores();
        totalScore = 0;
    
        // Mostrar el contador de "Preparados, listos, ya" dentro de #question-container
        const questionContainer = document.getElementById('question-container');
        const countdownText = document.createElement('p');
        countdownText.style.fontSize = '4rem';
        countdownText.style.textAlign = 'center';
        countdownText.style.color = 'rgba(252, 211, 77, 0.8)';
        questionContainer.appendChild(countdownText);
        questionContainer.style.display = 'block'; // Asegurarse de que el contenedor esté visible
        
        let countdown = 3;
    
        // Actualizar el texto del countdown inmediatamente
        function updateCountdownText() {
            countdownText.innerText = countdown === 3 ? "Prepárate!" : countdown === 2 ? "Ya?" : "Adelante!";
        }
    
        // Llamar la primera vez para que se muestre "¡Preparados!" inmediatamente
        updateCountdownText();
    
        const countdownInterval = setInterval(() => {
            countdown--;
    
            if (countdown > 0) {
                updateCountdownText();
            } else {
                clearInterval(countdownInterval);
                questionContainer.removeChild(countdownText); // Eliminar el texto después de terminar
                getQuestion(); // Llamar a getQuestion después de la cuenta regresiva
            }
        }, 1000); // Cada segundo cambia el texto
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
            if (data.scores) {
                return data.scores;
            }
        } catch (error) {
            console.error('Error fetching all scores:', error);
            return [];
        }
    }
    // Función para reproducir el sonido de respuesta correcta
    function playCorrectSound() {
        if (!isMuted) {
            correctSound.currentTime = 0; // Reiniciar el sonido
            correctSound.play();
        }
    }

    // Función para reproducir el sonido de respuesta incorrecta
    function playWrongSound() {
        if (!isMuted) {
            wrongSound.currentTime = 0; // Reiniciar el sonido
            wrongSound.play();
        }
    }
    const gameSounds = [correctSound, wrongSound, backgroundMusic]
  
  
    // Manejar el botón de silenciar
    function toggleMute() {
        if (isMuted) {
            backgroundMusic.muted = true;
            correctSound.muted = true;
            wrongSound.muted = true;
            muteButton.classList.add('active'); // Cambia el estado visual
            muteButton.querySelector('.icon-sound').style.display = 'none'; // Oculta icono de sonido
            muteButton.querySelector('.icon-muted').style.display = 'flex'; // Muestra icono de silencio
        } else {
            backgroundMusic.muted = false;
            correctSound.muted = false;
            wrongSound.muted = false;
            muteButton.classList.remove('active'); // Cambia el estado visual
            muteButton.querySelector('.icon-sound').style.display = 'flex'; // Muestra icono de sonido
            muteButton.querySelector('.icon-muted').style.display = 'none'; // Oculta icono de silencio
        }
    }

    async function getQuestion() {
        // Mostrar elementos del temporizador y la barra de progreso
        if (!isMuted){
            backgroundMusic.play();
        }
    
        progressBarContainer.style.display = 'flex';
        slogan.style.display = 'none';
        timerText.style.display = 'flex';
        scoreText.style.display = 'flex';
        progressBar.style.width = '100%';
    
        // Detener el temporizador anterior si existe
        if (countdownInterval) {
            clearInterval(countdownInterval);
            gameEnded = false; // Asegúrate de reiniciar el estado del juego
        }
    
        let endpoint;
        if (selectedCategory === "flags") {
            endpoint = `/get_country_question`;
        } else if (selectedCategory === "LogicGame") {
            endpoint = `/get_logic_game/`;
        }
        else {
            endpoint = `/get_question/${selectedCategory}`
        }
    
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            if (data.error) {
                alert(data.error);
                return;
            }
    
            if (selectedCategory === "flags") {

                const { correct_country, random_country } = data;
                const options = [correct_country, random_country];
                const shuffledOptions = options.sort(() => Math.random() - 0.5);
                flagImage.style.display = 'inline';

                // Actualizar la imagen de la bandera
                flagImage.src = `https://flagcdn.com/160x120/${correct_country.iso_code.toLowerCase()}.png`;
    
                // Actualizar las opciones de los botones
                optionButton1.textContent = shuffledOptions[0].name;
                optionButton2.textContent = shuffledOptions[1].name;
    
                // Almacenar la respuesta correcta
                correctAnswer = correct_country.name;
            } 
            else if (selectedCategory==="LogicGame") {
                const logicQuestion = data.question;
                const wrong = decodeString(data.wrong);
                const correct = decodeString(data.correct);
                const options = [wrong, correct];
                const shuffledOptions = options.sort(() => Math.random() - 0.5);
                optionButton1.textContent = shuffledOptions[0];
                optionButton2.textContent = shuffledOptions[1];
                const questionContainer = document.getElementById('question-container');

                questionText.textContent = logicQuestion;

                questionContainer.style.display = "block";
                const difficulty = data.difficulty;
                correctAnswer = correct;

            }
            else {
                const headline = decodeString(data.headline);
                const fake = decodeString(data.fake_news);
                const options = [headline, fake];
                const shuffledOptions = options.sort(() => Math.random() - 0.5);
                optionButton1.textContent = shuffledOptions[0];
                optionButton2.textContent = shuffledOptions[1];
                correctAnswer = headline;

            }
    
            // Mostrar los botones de respuesta
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
    
            let message = '';
    
            if (userRank === 0 || userRank > totalUsers) {
                message = '¡No se encontró tu puntuación en la lista! 🤔';
            } else if (userRank === 1) {
                message = '¡Felicidades! Eres el número 1 🥇🎉';
            } else if (userRank <= 3) {
                message = '¡Increíble! Estás en el Top 3 🌟🥈🥉';
            } else if (userRank <= Math.ceil(totalUsers * 0.25)) {
                message = '¡Estás en el Top 25% de jugadores! 🚀👏';
            } else if (userRank <= Math.ceil(totalUsers * 0.50)) {
                message = '¡Estás en el Top 50% de jugadores! 👍😊';
            } else if (userRank <= Math.ceil(totalUsers * 0.75)) {
                message = '¡Estás en el Top 75% de jugadores! 🙌💪';
            } else {
                message = '¡Sigue intentándolo, lo harás mejor la próxima vez! 💪😊';
            }
    
    
            if (previousUserRank !== userRank) {
                showRankingPopup(message);
                previousUserRank = userRank;
            }
    
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

    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                return cookie.substring(name.length + 1);
            }
        }
        return   
     null;
    }

    async function submitScore(userName, totalScore, totalTimeTaken, correctAnswersCount ) {

        try {
            const response = await fetch('/add_score', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCookie('csrf_access_token'),

                },
                body: JSON.stringify({
                    name: userName,
                    score: totalScore,
                    category: selectedCategory,
                    total_correct: correctAnswersCount,
                    total_time: totalTimeTaken,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al agregar la puntuación');
            }

        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function getBestScores() {
        try {
            rankingContainer.style.display = 'flex';
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

    function decodeString(s) {
        let decodedBytes = atob(s);  // Decodificamos la cadena base64 a bytes
        let uint8Array = new Uint8Array([...decodedBytes].map(char => char.charCodeAt(0))); // Convertimos a array de bytes
        let decoder = new TextDecoder('utf-8');  // Creamos un decodificador de UTF-8
        return decoder.decode(uint8Array);  // Decodificamos a string
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
            correctSound.play()
            handleCorrectAnswer(timeTaken);
        } else {
            wrongSound.play()
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
    
        // Forzar el reflujo/repaint para garantizar la aplicación correcta de la clase de estilo
        void popup.offsetWidth;
    
        // Mostrar el pop-up
        setTimeout(() => {
            popup.classList.add('popup-message-show'); // Añadir la clase que apilará el estilo visible
        }, 10); // Un pequeño delay para que se aplique el estilo
    
        // Ocultar el pop-up después de un tiempo
        setTimeout(() => {
            popup.classList.remove('popup-message-show'); // Comenzar a ocultar
            setTimeout(() => {
                document.body.removeChild(popup); // Eliminar del DOM después de la transición
            }, 300); // Esperar un poco antes de eliminar
        }, 1000); // Tiempo de visualización del pop-up
    }
    function handleCorrectAnswer(timeTaken) {
        const messages = ["Bien!", "Excelente!", "Sigue así!", "Muy bien hecho!", "Gran trabajo!", "Correcto!", "Olé!", "Eso es!", "Crack!", "GOAT!"];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // Mostrar el mensaje en el pop-up
        showPopup(randomMessage);

        // Aumentar la puntuación
        let scoreToAdd = Math.max(0, 10 - timeTaken);
        totalScore += scoreToAdd;
        totalScore = parseFloat(totalScore.toFixed(2));
        scoreText.textContent = `Puntuación Total: ${totalScore.toFixed(2)}`; 
        correctAnswersCount += 1;
        totalTimeTaken += timeTaken;
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
        backgroundMusic.currentTime = 0
        backgroundMusic.pause()
        resultText.textContent = `${msg}: ${totalScore}`;
        resultText.style.opacity = 1;

        // Enviar la puntuación
        submitScore(userName, totalScore,totalTimeTaken, correctAnswersCount);
        // Mostrar el mensaje de puntuación final como un pop-up
        showFinalOverlay();

        // Remover el pop-up de ranking si existe
        const rankingPopup = document.querySelector('.ranking-popup');
        if (rankingPopup) {
            document.body.removeChild(rankingPopup);
        }

        console.log(`Juego terminado. Puntuación final: ${totalScore}`);
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
            const urlToShare = `http://top10rank-be229c7616bc.herokuapp.com/rankings?search=${userName}`;
            const title = '¡Mira esta clasificación!'; // Un título atractivo para el contenido
        
            // Comprobar si la API de navegación está disponible
            if (navigator.share) {
                navigator.share({
                    title: title,
                    url: urlToShare
                })
                .then(() => console.log('Contenido compartido'))
                .catch(error => console.error('Error al compartir:', error));
            } else {
                // Si la API no está disponible, puedes mostrar un mensaje al usuario o implementar una alternativa
                alert('Tu dispositivo no soporta compartir de esta manera.');
            }
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
                welcomeContainer.style.display = 'flex';
                answerButtons.style.display = 'none';
                userNameInput.value = userName;
                resultText.style.display = 'none';
                scoreText.style.display = 'none';
                slogan.style.display = 'flex';
                rankingContainer.style.display = 'none';
                questionText.style.display = 'none'

                flagImage.style.display = 'none';

                
            });
    }

    function resetUI() {
        resultText.style.opacity = 0;
        timerText.style.display = 'none'; // Ocultar el temporizador
        answerButtons.style.display = 'none'; // Ocultar botones de respuesta
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
