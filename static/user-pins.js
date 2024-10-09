const pinDisplay = document.getElementById("pinDisplay");
const toggleButton = document.getElementById("togglePin");

pinDisplay.textContent = "****";

export function togglePin() {
    if (pinDisplay.textContent === "****") {
        pinDisplay.textContent = pin_code; // Muestra el pin
        toggleButton.textContent = "Ocultar PIN";
    } else {
        pinDisplay.textContent = "****"; // Oculta el pin
        toggleButton.textContent = "Ver PIN";
    }
}

toggleButton.addEventListener('click', () => togglePin());

export function mostrarPinSiDisponible(pin_code) {
    if (pin_code) {
        toggleButton.style.display = "inline"; 
        pinDisplay.style.display = "inline"; 
        pinDisplay.textContent = "****"; 
    } else {
        pinDisplay.style.display = "none"; 
        toggleButton.style.display = "none"; 
    }
}