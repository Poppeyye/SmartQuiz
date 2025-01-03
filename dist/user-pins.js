const pinDisplay = document.getElementById("pinDisplay");
const pinBox = document.getElementById("pinBox");

pinDisplay.textContent = "***";

function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.position = 'fixed';
    messageElement.style.bottom = '20px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.backgroundColor = '#28a745'; // Color verde
    messageElement.style.color = '#fff';
    messageElement.style.padding = '10px 20px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.zIndex = '1000';
    messageElement.style.transition = 'opacity 0.5s';
    messageElement.style.opacity = '1';
    
    // Agrega el mensaje al body
    document.body.appendChild(messageElement);
    
    // Desaparece después de 3 segundos
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.addEventListener('transitionend', () => {
            messageElement.remove(); // Eliminar el elemento del DOM
        });
    }, 3000);
}

let isPinVisible = false; // Variable de estado para el PIN
let copyCompleted = false; // Indica si se ha copiado el texto

export function togglePin() {
    if (!isPinVisible) {
        pinDisplay.textContent = pin_code; // Muestra el PIN
        isPinVisible = true; // Cambia el estado a visible
    } else if (copyCompleted) {
        pinDisplay.textContent = "***"; // Vuelve a ocultar el PIN
        isPinVisible = false; // Cambia el estado a oculto
        copyCompleted = false; // Resetea el estado de copiado
    } else {
        // Si el usuario ya ha visto el PIN, lo copia al portapapeles
        const textToCopy = `genias.io -> Usuario: ${userName}, PIN: ${pin_code}`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showMessage('Texto copiado: ' + textToCopy); // Mostrar mensaje
                copyCompleted = true; // Marca que se ha copiado el texto
            })
            .catch(err => {
                console.error('Error al copiar: ', err);
            });
    }
}

pinDisplay.addEventListener('click', () => togglePin());

export function mostrarPinSiDisponible(pin_code) {
    if (pin_code) {
        pinBox.style.display = "flex";
        pinDisplay.style.display = "inline"; 
        pinDisplay.textContent = "***"; 
        isPinVisible = false; // Resetea el estado a oculto
        copyCompleted = false; // Resetea el estado de copiado
    } else {
        pinDisplay.style.display = "none"; 
    }
}