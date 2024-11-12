const pinDisplay = document.getElementById("pinDisplay");
const pinBox = document.getElementById("pinBox");

pinDisplay.textContent = "***";
let userName = sessionStorage.getItem('user_name');
export function togglePin() {
    if (pinDisplay.textContent === "***") {
        pinDisplay.textContent = pin_code; // Muestra el PIN

        // Copiar el texto (nombre de usuario y PIN)
        const textToCopy = `Usuario: ${userName}, PIN: ${pin_code}`; // Modifica `userName` al nombre de la variable que uses
        navigator.clipboard.writeText(textToCopy) // Usar la API Clipboard para copiar
            .then(() => {
                console.log('Texto copiado al portapapeles');
                alert('Texto copiado: ' + textToCopy); // Mensaje confirmación
            })
            .catch(err => {
                console.error('Error al copiar: ', err);
            });
    } else {
        pinDisplay.textContent = "***"; // Oculta el PIN
    }
}

pinDisplay.addEventListener('click', () => togglePin());

export function mostrarPinSiDisponible(pin_code) {
    if (pin_code) {
        pinBox.style.display = "flex";
        pinDisplay.style.display = "inline"; 
        pinDisplay.textContent = "***"; 
    } else {
        pinDisplay.style.display = "none"; 
    }
}