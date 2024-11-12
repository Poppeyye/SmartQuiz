const pinDisplay = document.getElementById("pinDisplay");
const pinBox = document.getElementById("pinBox");

pinDisplay.textContent = "***";
export function togglePin() {
    if (pinDisplay.textContent === "***") {
        pinDisplay.textContent = pin_code; // Muestra el PIN

        // Copiar el texto (nombre de usuario y PIN)
        const textToCopy = `genias.io -> Usuario: ${userName}, PIN: ${pin_code}`; // Modifica `userName` al nombre de la variable que uses
        navigator.clipboard.writeText(textToCopy) // Usar la API Clipboard para copiar
            .then(() => {
                alert('Texto copiado, cuando quieras podrás usar tu nombre de usuario de nuevo. ' + textToCopy); // Mensaje confirmación
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