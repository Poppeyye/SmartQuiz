export const backgroundMusic = document.getElementById('background-music');
export const correctSound = document.getElementById('correct-sound');
export const wrongSound = document.getElementById('wrong-sound');
export const muteButton = document.getElementById('mute-button');
export let isMuted = localStorage.getItem('isMuted') === 'true'; // Recuperar el estado del mute de localStorage

backgroundMusic.volume = 0.1;
correctSound.volume = 0.5;
wrongSound.volume = 0.5;

toggleMute();

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

 muteButton.addEventListener('click', () => {
     isMuted = !isMuted;  // Cambia el estado de silencio
     localStorage.setItem('isMuted', isMuted); // Almacena el nuevo estado
     toggleMute(); // Llama a la función para manejar el mute
 });

 window.addEventListener("beforeunload", function() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reinicia la música
});