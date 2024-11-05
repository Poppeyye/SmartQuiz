const muteButton = document.getElementById('mute-button');
export let isMuted = localStorage.getItem('isMuted') === 'true';
export const backgroundMusic = new Audio(audioUrls.background);
backgroundMusic.loop = true;

export const correctSound = new Audio(audioUrls.correct);
export const wrongSound = new Audio(audioUrls.wrong);
backgroundMusic.volume = 0.1;
correctSound.volume = 0.5;
wrongSound.volume = 0.5;

function toggleMute() {
    if (isMuted) {
        backgroundMusic.muted = true;
        correctSound.muted = true;
        wrongSound.muted = true;
        if (muteButton) {
            muteButton.classList.add('active'); 
            muteButton.querySelector('.icon-sound').style.display = 'none'; 
            muteButton.querySelector('.icon-muted').style.display = 'flex'; 
        }
    } else {
        backgroundMusic.muted = false;
        correctSound.muted = false;
        wrongSound.muted = false;
        if (muteButton) {
            muteButton.classList.remove('active');
            muteButton.querySelector('.icon-sound').style.display = 'flex'; 
            muteButton.querySelector('.icon-muted').style.display = 'none'; 
        }
    }
}

if (muteButton) {
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;  
        localStorage.setItem('isMuted', isMuted); 
        toggleMute(); 
    });
}

// Pausar la música cuando la página se cierra
window.addEventListener("beforeunload", function() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
});

// Evento visibilitychange para pausar la música
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden') {
        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0; // Reinicia la música si es necesario
        }
    } else {
        if (!isMuted && backgroundMusic) {
            backgroundMusic.play();
        }
    }
});

// Inicializar el mute si está activado
toggleMute();