import { mostrarPinSiDisponible } from './user-pins.js';
import { backgroundMusic, correctSound, wrongSound, isMuted } from './mute-handler.js';

document.addEventListener('DOMContentLoaded', () => {
    const userNameInput = document.getElementById('user-name');
    const pinCode = document.getElementById('pin-code');
    const usernameStatus = document.getElementById('username-status');
    const pinContainer = document.getElementById('pin-container');

    const startButton = document.getElementById('start-button');
    const welcomeContainer = document.getElementById('welcome-container');
    const faqContainer = document.getElementById('faq-container');
    const chartContainer = document.getElementById('chart-container');
    const categoryContainer = document.getElementById('category-container');
    const rankingContainer = document.getElementById('ranking-container');
    const slogan = document.getElementById('slogan');
    const optionButton1 = document.getElementById('option-button-1');
    const optionButton2 = document.getElementById('option-button-2');
    const timerText = document.getElementById('timer-text');
    const resultText = document.getElementById('result-text');
    const scoreText = document.getElementById('score-text');
    const correctCountText = document.getElementById('count-text');
    const bestScoresList = document.getElementById('best-scores-list');
    const answerButtons = document.getElementById('answer-buttons');
    const questionText = document.getElementById('question-text');
    const flagImage = document.querySelector('#answer-buttons picture img');
    const questionContainer = document.getElementById('question-container');

    const progressBarContainer = document.getElementById('progress-bar-container')
    const progressBar = document.getElementById('progress-bar');
    const memorizationMessage = document.getElementById("memorization-message");

    let correctAnswer = null;
    let timerInterval = null;
    let totalScore = 0;
    let bestScores = [];
    let selectedCategory = '';
    let gameEnded = null;
    let correctAnswersCount = 0; 
    let totalTimeTaken = 0; 
    let debounceTimer;
    let explanation = '';
    let currentQuestion = '';
    userNameInput.addEventListener('input', () => {
        userName = userNameInput.value.trim();
        clearTimeout(debounceTimer); 
    
        if (userName.length > 3) {
            debounceTimer = setTimeout(() => {
                checkUserNameAvailability(userName);
            }, 300);
        } else {
            usernameStatus.textContent = '';
        }
    });

    function checkUserNameAvailability(userName) {
    if (userName.length > 4) {
        fetch('/check_user_name', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token'),
            },
            body: JSON.stringify({ user_name: userName }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.available) {
                usernameStatus.style.color = 'green';
                usernameStatus.style.fontWeight = '400'
                usernameStatus.textContent = 'Nombre de usuario disponible';
                startButton.disabled = false;  // Habilita el botón si está disponible
                pinContainer.style.display = 'none';  // Oculta el contenedor del PIN
            } else if (data.no_pin) {
                usernameStatus.style.color = 'white';
                usernameStatus.style.fontWeight = '400'
                usernameStatus.textContent = 'Introduce el PIN para validar tu identidad';
                pinContainer.style.display = 'flex';  // Muestra el PIN
            } else if (data.validated) {
                usernameStatus.style.color = 'white';
                usernameStatus.style.fontWeight = '400'
                usernameStatus.textContent = 'Pin correcto, puedes usar este nombre';
            }
            else {
                usernameStatus.style.color = 'red';
                usernameStatus.textContent = 'Nombre de usuario no disponible';
                startButton.disabled = true;   // Deshabilita el botón si no está disponible
                pinContainer.style.display = 'none';  // Oculta el contenedor del PIN
            }
        })
        .catch(error => {
            console.error('Error:', error);
            usernameStatus.textContent = 'Error verificando el nombre de usuario';
            startButton.disabled = true;  // Deshabilita el botón en caso de error
            pinContainer.style.display = 'none';  // Oculta el contenedor del PIN
        });
    }
    }
    
    // Función para mostrar la tabla de puntuaciones
    function displayBestScores() {
        // Limpiar la lista actual
        bestScoresList.innerHTML = '';

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

    mostrarPinSiDisponible(pin_code); // Muestra el pin si está disponible

    function startGame() {
        const userName = userNameInput.value.trim();
        const pin_code_input = pinCode.value; // Asegúrate de tener el valor del PIN
        if (userName.length >= 4) { // Verifica que el nombre de usuario tenga al menos 3 caracteres
            fetch('/set_user_name', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCookie('csrf_access_token'),
                },
                body: JSON.stringify({ user_name: userName, pin_code: pin_code_input }),
            })
            .then(response => {
                if (response.ok) {
                    return response.json(); 
                } else {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error); // Extrae el mensaje de error
                    });
                }
            })
            .then(data => {
                pin_code = data.pin_code; // Actualiza el pin_code con el nuevo PIN
                mostrarPinSiDisponible(pin_code); // Muestra el nuevo PIN
                welcomeContainer.style.display = 'none';
                faqContainer.style.display = 'none';
                chartContainer.style.display = 'none';
                categoryContainer.style.display = 'block';
            
                // Chequea si es un nuevo usuario
                if (data.message === "New user set") {
                    // Muestra la flecha parpadeante
                    document.getElementById('blurBackground').style.display = 'block';

                    // Muestra el mensaje de bienvenida
                    const welcomeMessage = document.getElementById('welcomeMessage');
                    welcomeMessage.innerText = `Gracias por unirte ${userName}! 👩‍💻`; // Asigna el nombre de usuario
                    welcomeMessage.style.display = 'block'; // Muestra el mensaje
                    setTimeout(() => {
                        welcomeMessage.style.opacity = '1'; // Asegúrate de que se vuelva visible
                    }, 50); // Pequeño retraso para iniciar la animación
                
                    // Muestra la flecha parpadeante
                    const pinDisplay = document.getElementById('pinDisplay');
                    pinDisplay.classList.add('flecha');
                
                    // Mostrar el mensaje de información
                    const infoMessage = document.getElementById('infoMessage');
                    infoMessage.style.display = 'block'; // Muestra el mensaje y lo hace visible
                    infoMessage.style.opacity = '1'; // Hacer visible el mensaje de información
                
                    // Reproducir sonido
                    const welcomeAudio = new Audio(audioUrls.welcome); // Cambia por la ruta de tu audio
                    welcomeAudio.play();
                
                    // Ocultar después de un tiempo
                    setTimeout(() => {
                        welcomeMessage.style.opacity = '0'; // Comenzar la animación de ocultar
                        setTimeout(() => {
                            welcomeMessage.style.display = 'none'; // Ocultar mensaje
                            document.getElementById('blurBackground').style.display = 'none'; // Ocultar fondo
                            pinDisplay.classList.remove('flecha'); // Eliminar la clase de la flecha
                            infoMessage.style.opacity = '0'; // Comenzar a ocultar el mensaje de información
                            setTimeout(() => {
                                infoMessage.style.display = 'none'; // Ocultar mensaje de información
                            }, 400); // Tiempo para la transición de opacidad
                        }, 600); // Tiempo para completar la transición de la bienvenida
                    }, 6000); // 5000ms = 5 segundos
                }
            })
            .catch(error => {
                console.error(error); // Manejo de error
                alert(error.message); // Muestra el mensaje de error al usuario
            });
        } else {
            alert('El nombre de usuario debe tener más de 3 caracteres');
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
        if (window.innerWidth > 768) {
            // Solo aplicar display flex en pantallas de ordenador
            getBestScores();
        }
    
        // Mostrar el contador de "Preparados, listos, ya" dentro de #question-container
        const countdownText = document.createElement('p');
        countdownText.style.fontSize = '4rem';
        countdownText.style.textAlign = 'center';
        countdownText.style.color = 'rgba(252, 211, 77, 0.8)';
        questionContainer.appendChild(countdownText);
        questionContainer.style.display = 'block'; // Asegurarse de que el contenedor esté visible
        
        let countdown = 3;
        
        // Actualizar el texto del countdown inmediatamente
        function updateCountdownText() {
            if (selectedCategory === "Memoria") {
                // Mostrar el mensaje de memorización
                memorizationMessage.innerText = "Tienes 6 segundos para memorizar todo lo que veas";
                memorizationMessage.style.display = "block"; // Asegurarse de que el mensaje esté visible
        
                // Mostrar el countdown
                countdownText.innerText = countdown === 3 ? "3..." : countdown === 2 ? "2..." : "1...";
            } else {
                // Para otras categorías
                countdownText.innerText = countdown === 3 ? "3..." : countdown === 2 ? "2..." : "1...";
            }
        }
        
    
        // Llamar la primera vez para que se muestre "¡Preparados!" inmediatamente
        updateCountdownText();
        
        const countdownInterval = setInterval(() => {
            countdown--;
    
            if (countdown > 0) {
                updateCountdownText();
            } else {
                clearInterval(countdownInterval);
                memorizationMessage.style.display = "none";
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

    async function getQuestion() {
        // Mostrar elementos del temporizador y la barra de progreso
        if (!isMuted) {
            backgroundMusic.play();
        }
    
        // Detener el temporizador anterior si existe
        if (countdownInterval) {
            clearInterval(countdownInterval);
            gameEnded = false; // Asegúrate de reiniciar el estado del juego
        }
    
        let endpoint = getEndpoint(selectedCategory);
    
        try {
            const response = await fetch(endpoint);
            if (response.status === 204) {
                endGame('Has terminado todas las preguntas');
                return;
            }
    
            const data = await response.json();
            if (data.error) {
                alert(data.error);
                return;
            }
    
            // Llama al manejador de la categoría seleccionada
            const categoryHandler = categoryHandlers[selectedCategory] || categoryHandlers["default"];
            
            // Se ejecuta el handler, pero NO mostramos los botones aún
            slogan.style.display = 'none';
            await categoryHandler(data);
            timerText.style.display = 'flex';
            scoreText.style.display = 'flex';
            correctCountText.style.display = 'flex';
            progressBar.style.width = '100%';
            
        } catch (error) {
            console.error('Error fetching question:', error);
        }
    }
    
    // Obtener el endpoint adecuado según la categoría seleccionada
    function getEndpoint(category) {
        const endpoints = {
            "flags": `/get_country_question`,
            "LogicGame": `/get_logic_game/logics`,
            "Culture": `/get_logic_game/culture`,
            "Memoria": `/get_memory_game`,
            "default": `/get_question/${category}`
        };
    
        return endpoints[category] || endpoints["default"];
    }
    
    // Manejadores de cada categoría
    let problem ='';
    const categoryHandlers = {
        "flags": function (data) {
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
            answerButtons.style.display = 'flex';
            progressBarContainer.style.display = 'flex';
            startCountdown();
        },
    
        "LogicGame": function (data) {
            handleLogicOrCultureGame(data);
            answerButtons.style.display = 'flex';
            progressBarContainer.style.display = 'flex';
            startCountdown();
        },
    
        "Culture": function (data) {
            handleLogicOrCultureGame(data);
            answerButtons.style.display = 'flex';
            progressBarContainer.style.display = 'flex';
            startCountdown();
        },
        "Memoria": async function (data) {
                problem = decodeString(data.problem);
                
                // Mostrar el texto del problema en el centro de la pantalla
                questionText.style.display = 'block';
                questionText.textContent = problem;
                answerButtons.style.display = 'none';
                //questionContainer.style.display = 'none';

                await new Promise(resolve => setTimeout(resolve, 6000));  // Esperar 6 segundos
        
                // Mostrar la pregunta y las opciones
                handleMemoryGame(data); 
        },
            "default": function (data) {
                handleCategoryQuiz(data);
                answerButtons.style.display = 'flex';
                progressBarContainer.style.display = 'flex';
                startCountdown();
            }
        };
          function handleMemoryGame(data) {
            const memoryQuestion = data.question;
            const wrong = decodeString(data.wrong);
            const correct = decodeString(data.correct);
            const options = [wrong, correct];
            const shuffledOptions = options.sort(() => Math.random() - 0.5);
        
            // Actualizar las opciones de los botones
            optionButton1.textContent = shuffledOptions[0];
            optionButton2.textContent = shuffledOptions[1];
            questionText.style.display = 'block';
            questionText.textContent = memoryQuestion;
        
            // Asegúrate de que ahora se muestre todo correctamente
            questionContainer.style.display = "block";
            answerButtons.style.display = 'flex'; // Mostrar los botones de respuesta después de cargar la pregunta
            correctAnswer = correct;
            answerButtons.style.display = 'flex';
            progressBarContainer.style.display = 'flex';
            explanation = formatMemoryExplanation(memoryQuestion, problem, correct);
            startCountdown();
        }
    // Función compartida para manejar tanto LogicGame como Culture
    function handleLogicOrCultureGame(data) {
        const logicQuestion = data.question;
        const wrong = decodeString(data.wrong);
        const correct = decodeString(data.correct);
        const options = [wrong, correct];
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
        // Actualizar las opciones de los botones
        optionButton1.textContent = shuffledOptions[0];
        optionButton2.textContent = shuffledOptions[1];
    
        questionText.style.display = 'block';
        questionText.textContent = logicQuestion;
    
        questionContainer.style.display = "block";
        correctAnswer = correct;
        explanation = formatLogicExplanation(logicQuestion, correct);
    }
    
    function handleCategoryQuiz(data) { 
        let quizQuestion = data.question;
        const wrong = decodeString(data.wrong);
        const correct = decodeString(data.correct);
        explanation = decodeString(data.explanation);
        const options = [wrong, correct];
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
        // Actualizar las opciones de los botones
        optionButton1.textContent = shuffledOptions[0];
        optionButton2.textContent = shuffledOptions[1];
    
        questionText.style.display = 'block';
        if (quizQuestion=='VF'){
            quizQuestion='Elige la afirmación correcta'
        }
        questionText.textContent = quizQuestion;
    
        questionContainer.style.display = "block";
        correctAnswer = correct;
                    // Actualizar el span con el creador de la pregunta
        const createdBySpan = document.getElementById('created-by-span');
        createdBySpan.textContent = `Pregunta de: ${data.created_by}`;
    }

    function formatMemoryExplanation(memoryQuestion, problem, correct) {
        return `ℹ️ Pregunta de memoria: ${memoryQuestion}<br><br>Problema:<br>${problem}<br><br>Respuesta correcta:<br>${correct} ℹ️`;
      }

    function formatLogicExplanation(question, correct) {
    return `ℹ️ Pregunta: ${question}<br><br>Respuesta correcta:<br>${correct}ℹ️`;
    }

    let previousUserRank = null; // Variable para almacenar el rango anterior del usuario
    let userRank = 0;
    async function getUserRank(playerScore) {
        const url = selectedCategory ? `/get_user_rank/${selectedCategory}` : '/get_user_rank/';
        const params = new URLSearchParams({ playerScore });
        
        try {
            const response = await fetch(`${url}?${params}`);
            const data = await response.json();
            userRank = data.userRank;
        } catch (error) {
            console.error('Error fetching user rank:', error);
        }
        return userRank;
    }

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
                previousUserRank = userRank;
                showRankingPopup(message);
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
    function modifyRankingContainer() {
        const rankingContainer = document.getElementById('ranking-container');
    
        // Solo cambiar display a flex si la pantalla es mayor a 768px
        if (window.innerWidth > 768 && rankingContainer.style.display != 'none') {
            rankingContainer.style.display = 'flex';
        } else {
            rankingContainer.style.display = 'none'; // Asegurarte de que esté oculto en móviles
        }
    }
    
    window.addEventListener('resize', modifyRankingContainer);
    modifyRankingContainer();
    
    async function getBestScores() {
        try {
            rankingContainer.style.display = 'flex';
            const rankingTitle = document.querySelector('#ranking-container h2');

            rankingTitle.textContent = `Top 7 ${categoryNames[selectedCategory]}`;

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
        let decodedBytes = atob(s);
        let uint8Array = new Uint8Array([...decodedBytes].map(char => char.charCodeAt(0)));
        let decoder = new TextDecoder('utf-8');
        return decoder.decode(uint8Array);
    }

    function updateProgressBar() {
        if (gameEnded) return;

        const elapsedTime = (Date.now() - startTime) / 1000;
        remainingTime = countdownTime - elapsedTime;
        const progressPercentage = (remainingTime / countdownTime) * 100;

        progressBar.style.width = `${progressPercentage}%`;

        timerText.textContent = `Tiempo: ${remainingTime.toFixed(1)}s`;

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
        console.log(timeTaken)
        if (userAnswer === correctAnswer) {
            correctSound.play();
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
        const messages = ["Bien!", "Excelente!", "Sigue así!", "Muy bien hecho!", "Gran trabajo!", "Correcto!", "Olé!", "Eso es!", "Crack!"];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // Mostrar el mensaje en el pop-up
        showPopup(randomMessage);

        // Aumentar la puntuación
        let scoreToAdd = Math.max(0, 10 - timeTaken);
        totalScore += scoreToAdd;
        totalScore = parseFloat(totalScore.toFixed(2));
        scoreText.textContent = `Puntuación Total: ${totalScore.toFixed(2)}`; 
        correctAnswersCount += 1;
        correctCountText.textContent = `Correctas: ${correctAnswersCount}`; 
        totalTimeTaken += timeTaken;

        console.log(totalTimeTaken)
        // Llamar a displayFunnyMessage después de que el pop-up haya sido visible
        setTimeout(() => {
            //displayFunnyMessage(totalScore);
            if (window.innerWidth > 768) {
                // Solo aplicar display flex en pantallas de ordenador
                updateBestScores(userName, totalScore);
            }

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
        showFinalOverlay(totalScore);
        totalScore=0.0;
        totalTimeTaken = 0.0;
        correctAnswersCount = 0;
        correctCountText.textContent = `Correctas: ${correctAnswersCount}`; ;
        // Remover el pop-up de ranking si existe
        const rankingPopup = document.querySelector('.ranking-popup');
        if (rankingPopup) {
            document.body.removeChild(rankingPopup);
        }
    }

async function showFinalOverlay(totalScore) {
    window.scrollTo(0, 0);

    // Crear el overlay
    const overlay = document.createElement('div');
    overlay.className = 'final-overlay';   
    
    // Crear el cuadro del mensaje
    let userRankResult = await getUserRank(totalScore)
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    const userRanking = document.createElement('p');
    userRanking.className = 'overlay-subtitle';
    userRanking.textContent = `${totalScore} 📣 #${userRankResult}`;

    const nameOverlay = document.createElement('p');
    nameOverlay.className = 'overlay-username';
    nameOverlay.textContent = `${userName}`;
    messageBox.appendChild(nameOverlay);
    
    const labelOverlay = document.createElement('span');
    labelOverlay.className = 'message-box-label'; // Asigna la clase para el estilo
    labelOverlay.textContent = 'genias.io'; // Establece el texto del span
    messageBox.appendChild(labelOverlay);
    
    // Agregar el título
    const overlayTitle = document.createElement('h1');
    overlayTitle.className = 'overlay-title';
    
    const rankMessage = document.createElement('p');
    rankMessage.className = 'rank-message';
    
    // Ajustar el título del mensaje según el userRank
    if (userRank === 3) {
        nameOverlay.textContent = `${userName}🥉`;
    } else if (userRank === 2) {
        nameOverlay.textContent = `${userName}🥈`;
    } else if (userRank === 1) {
        nameOverlay.textContent = `${userName}🥇`;
    }

    const categoryMessage = document.createElement('p');
    categoryMessage.className = 'overlay-category';
    categoryMessage.textContent = `${categoryNames[selectedCategory]}`;
    
    // Agregar los elementos al cuadro del mensaje
    messageBox.appendChild(userRanking);
    messageBox.appendChild(rankMessage);
    messageBox.appendChild(categoryMessage);

    overlay.appendChild(messageBox);
    
    // Crear un contenedor para los botones dentro del overlay
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    const returnButton = document.createElement('button');
    returnButton.textContent = 'Volver a Jugar';
    returnButton.className = 'btn';
    
    const rankingButton = document.createElement('button');
    rankingButton.textContent = 'Ver Rankings';
    rankingButton.className = 'btn';
    
    const shareButton = document.createElement('button');
    shareButton.textContent = 'Compartir Resultado';
    shareButton.className = 'btn';
    
    // Agregar los botones al contenedor de botones
    buttonContainer.appendChild(returnButton);
    buttonContainer.appendChild(rankingButton);
    buttonContainer.appendChild(shareButton);
    
    // Agregar el contenedor de botones dentro del overlay
    overlay.appendChild(buttonContainer);
    

    const reportButtonContainer = document.createElement('div');
    reportButtonContainer.style.marginTop = '10px';
    reportButtonContainer.style.display = 'flex'; // Usar flex para centrar
    reportButtonContainer.style.justifyContent = 'center'; // Centrar horizontalmente
    const reportButton = document.createElement('button');
    reportButton.className = 'report-button';
    reportButton.textContent = 'Reportar pregunta'
    buttonContainer.appendChild(reportButton);
    reportButtonContainer.appendChild(reportButton);
    overlay.appendChild(reportButtonContainer);

    const infoField = document.createElement('p');
    infoField.className = 'info-field'; // Clase para estilizar el campo
    if (explanation){
        infoField.innerHTML = `ℹ️ ${explanation} ℹ️`; // Establecer el contenido del campo
    }

    // Agregar estilo
    infoField.style.marginTop = '20px'; // Espacio superior
    infoField.style.fontSize = '14px'; // Tamaño de fuente
    infoField.style.color = 'white'; // Color del texto
    infoField.style.textAlign = 'center'; // Alinear al centro
    overlay.appendChild(infoField);
    // Agregar el campo informativo al body, después del overlay
    document.body.appendChild(overlay);
    if (selectedCategory == 'flags'){
        currentQuestion = flagImage.src;
    } else{
        currentQuestion = questionText.textContent;
    }
    
    reportButton.addEventListener('click', () => {
        const confirmed = confirm('¿Estás seguro de que deseas reportar esta pregunta como incorrecta?');
        if (confirmed) {
          reportQuestion(currentQuestion, selectedCategory);
        }
      });


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

    shareButton.addEventListener('click', async () => {
        const urlToShare = `https://genias.io/rankings?search=${userName}`;
        const shareTitle = '¡Mira esta clasificación!';

        // Capturar el screenshot del cuadro de mensaje usando html2canvas
        try {
            const canvas = await html2canvas(messageBox);
            canvas.toBlob((blob) => {
                const file = new File([blob], 'screenshot.png', { type: 'image/png' });

                // Verificar si la API de compartir está disponible
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        title: shareTitle,
                        text: rankMessage.textContent,
                        files: [file],
                        url: urlToShare
                    }).then(() => console.log('Contenido compartido'))
                    .catch(error => console.error('Error al compartir:', error));
                } else {
                    alert('Tu dispositivo no soporta compartir esta funcionalidad.');
                }
            });
        } catch (error) {
            console.error('Error al capturar el screenshot:', error);
        }
    });
}

    function reportQuestion(question, category) {
        fetch('/report_question', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token'),
        },
        body: JSON.stringify({ question, category }),
        })
        .then(response => response.json())
        .then(data => {
        alert('Gracias por tu reporte. Revisaremos esta pregunta.');
        })
        .catch((error) => {
        console.error('Error al enviar el reporte:', error);
        });
    }
  
        

    function goToMainScreen() {

        fetch('/end_game', {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                welcomeContainer.style.display = 'none';
                categoryContainer.style.display = 'block';
                answerButtons.style.display = 'none';
                userNameInput.value = userName;
                resultText.style.display = 'none';
                scoreText.style.display = 'none';
                correctCountText.style.display='none';
                slogan.style.display = 'flex';
                explanation ='';
                questionText.style.display = 'none';
                flagImage.style.display = 'none';

                
            });
    }

    optionButton1.addEventListener('click', () => {
        checkAnswer(optionButton1.textContent);
    });

    optionButton2.addEventListener('click', () => {
        checkAnswer(optionButton2.textContent);
    });
});