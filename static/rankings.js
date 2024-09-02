let allScores = []; // Variable para almacenar todos los puntajes

document.addEventListener('DOMContentLoaded', async () => {
    allScores = await getAllScores(); // Obtener todos los puntajes al cargar la página
    updateScores(allScores); // Mostrar los puntajes inicialmente
    
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (event) => {
        console.log('Input event triggered!'); // Para depuración
        const query = event.target.value.toLowerCase();
        // Filtrar los puntajes según el nombre ingresado en el input
        const filteredScores = allScores.filter(score => 
            score.name.toLowerCase().includes(query)
        );

        // Mostrar los puntajes filtrados
        displayFilteredScores(filteredScores);
    });
});

async function getAllScores() {
    try {
        const response = await fetch(`/get_all_scores/`); // Llamada al nuevo endpoint
        const data = await response.json();
        console.log(data);
        if (data.scores) {
            return data.scores; // Devuelve los puntajes que incluyen el ranking
        }
    } catch (error) {
        console.error('Error fetching all scores:', error);
        return [];
    }
}

function updateScores(scores) {
    // Llamamos a displayScores con todos los puntajes iniciales.
    displayScores(scores);
}

function displayScores(scores) {
    const allCategories = ['deportes', 'historia', 'software', 'moda', 'economia'];
    allCategories.forEach(category => {
        const listId = `best-scores-${category}`;
        const scoresList = document.getElementById(listId);
        scoresList.innerHTML = ''; // Limpiar previamente la tabla

        // Solo mostramos los 20 mejores para cada categoría
        const categoryScores = scores.filter(score => score.category.toLowerCase() === category).slice(0, 20);

        categoryScores.forEach((score) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${score.ranking}</td> <!-- Usar ranking de los datos -->
                <td>${score.name}</td>
                <td>${score.score}</td>
            `;
            scoresList.appendChild(row);
        });
    });
}

function displayFilteredScores(filteredScores) {
    // Limpiar todas las tablas primero
    const allCategories = ['deportes', 'historia', 'software', 'moda', 'economia'];
    allCategories.forEach(category => {
        const listId = `best-scores-${category}`;
        const scoresList = document.getElementById(listId);
        scoresList.innerHTML = ''; // Limpiar la lista
    });

    // Mostrar resultados filtrados
    filteredScores.forEach((score) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${score.ranking}</td> <!-- Usar ranking de los datos -->
            <td>${score.name}</td>
            <td>${score.score}</td>
        `;
        
        // Determinar a qué categoría pertenece el score
        const categoryId = score.category.toLowerCase();
        const listId = `best-scores-${categoryId}`;

        // Agregar fila a la tabla correspondiente
        document.getElementById(listId).appendChild(row);
    });
}