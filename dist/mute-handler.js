const muteButton = document.getElementById('mute-button');
export let isMuted = localStorage.getItem('isMuted') === 'true'; // Recuperar el estado del mute de localStorage
export const backgroundMusic = new Audio(audioUrls.background);
backgroundMusic.loop = true;

export const correctSound = new Audio(audioUrls.correct);
export const wrongSound = new Audio(audioUrls.wrong);
export const welcomeSound = new Audio(audioUrls.welcome);

backgroundMusic.volume = 0.1;
correctSound.volume = 0.5;
wrongSound.volume = 0.5;
welcomeSound.volume = 0.5;

function toggleMute() {
    if (isMuted) {
        backgroundMusic.muted = true;
        correctSound.muted = true;
        wrongSound.muted = true;
        welcomeSound.muted = true;

        if (muteButton) {
            muteButton.classList.add('active'); // Cambia el estado visual
            muteButton.querySelector('.icon-sound').style.display = 'none'; // Oculta icono de sonido
            muteButton.querySelector('.icon-muted').style.display = 'flex'; // Muestra icono de silencio
        }
    } else {
        backgroundMusic.muted = false;
        correctSound.muted = false;
        wrongSound.muted = false;
        if (muteButton) {
            muteButton.classList.remove('active'); // Cambia el estado visual
            muteButton.querySelector('.icon-sound').style.display = 'flex'; // Muestra icono de sonido
            muteButton.querySelector('.icon-muted').style.display = 'none'; // Oculta icono de silencio
        }
    }
}

// Verifica si el botón de mute existe antes de intentar usarlo
if (muteButton) {
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;  // Cambia el estado de silencio
        localStorage.setItem('isMuted', isMuted); // Almacena el nuevo estado
        toggleMute(); // Llama a la función para manejar el mute
    });
}

// Pausar la música cuando la página se cierra
window.addEventListener("beforeunload", function() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
});

// Inicializar el mute si está activado
toggleMute();
