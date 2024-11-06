const pinDisplay = document.getElementById("pinDisplay");
const pinBox = document.getElementById("pinBox");

pinDisplay.textContent = "***";

export function togglePin() {
    if (pinDisplay.textContent === "***") {
        pinDisplay.textContent = pin_code; // Muestra el pin
    } else {
        pinDisplay.textContent = "***"; // Oculta el pin
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