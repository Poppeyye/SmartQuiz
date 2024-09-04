let allScores = [];
let currentCategory = 'all';
let currentDateRange = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    const categorySelector = document.getElementById('category-selector');
    const dateRangeSelector = document.getElementById('date-range-selector');
    
    allScores = await getAllScores(currentCategory, currentDateRange);
    updateScores(allScores);

    categorySelector.addEventListener('change', async (event) => {
        currentCategory = event.target.value;
        allScores = await getAllScores(currentCategory, currentDateRange);
        updateScores(allScores);
    });

    dateRangeSelector.addEventListener('change', async (event) => {
        currentDateRange = event.target.value;
        allScores = await getAllScores(currentCategory, currentDateRange);
        updateScores(allScores);
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredScores = allScores.filter(score => score.name.toLowerCase().includes(query));
        displayFilteredScores(filteredScores);
    });
});

// Función para obtener todos los puntajes, filtrar por categoría y rango de fecha
async function getAllScores(category, dateRange) {
    try {
        let url = `/get_all_scores/`;
        if (category !== 'all') {
            if (dateRange !== 'all') {
                url = `/get_all_scores_dates/${category}/${dateRange}`;
            } else {
                url = `/get_all_scores/${category}`;
            }
        } else if (dateRange !== 'all') {
            url = `/get_all_scores_dates/all/${dateRange}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        return data.scores || []; // Manejo de caso en que no haya scores
    } catch (error) {
        console.error('Error fetching scores:', error);
        return [];
    }
}

// Función para actualizar los puntajes según la categoría y rango de fecha seleccionados
function updateScores(scores) {
    const filteredScores = currentCategory === 'all' ? scores :
        scores.filter(score => score.category.toLowerCase() === currentCategory);
    displayScores(filteredScores);
}

// Muestra los puntajes
function displayScores(scores) {
    const allCategories = ['deportes', 'historia', 'software', 'moda', 'economia'];

    allCategories.forEach(category => {
        const listId = `best-scores-${category}`;
        const scoresList = document.getElementById(listId);

        if (scoresList) { // Verificar si scoresList existe
            scoresList.innerHTML = ''; // Limpiamos la lista al inicio

            // Solo mostramos los 20 mejores para cada categoría
            const categoryScores = scores.filter(score => score.category.toLowerCase() === category).slice(0, 20);
            populateScoreRows(categoryScores, scoresList);
        }
    });
}

// Muestra los puntajes filtrados
function displayFilteredScores(filteredScores) {
    const allCategories = ['deportes', 'historia', 'software', 'moda', 'economia'];

    allCategories.forEach(category => {
        const listId = `best-scores-${category}`;
        const scoresList = document.getElementById(listId);

        if (scoresList) {
            scoresList.innerHTML = ''; // Limpiar la tabla antes de llenar

            // Filtra los scores de la categoría actual
            const categoryScores = allScores.filter(score => score.category.toLowerCase() === category);
            // Muestra solo los scores filtrados que pertenecen a esa categoría
            const filteredCategoryScores = filteredScores.filter(score => score.category.toLowerCase() === category);
            populateScoreRows(filteredCategoryScores, scoresList);
        }
    });
}

// Populate score rows con medallas
function populateScoreRows(scores, scoresList) {
    scores.forEach((score) => {
        const row = document.createElement('tr');

        // Asignar medalla según el ranking
        let medalHtml = '';
        if (score.ranking === 1) {
            medalHtml = `<img src="/static/svgs/gold.svg" alt="Medalla de Oro" width="20" height="20">`;
        } else if (score.ranking === 2) {
            medalHtml = `<img src="/static/svgs/silver.svg" alt="Medalla de Plata" width="20" height="20">`;
        } else if (score.ranking === 3) {
            medalHtml = `<img src="/static/svgs/bronze.svg" alt="Medalla de Bronce" width="20" height="20">`;
        }

        row.innerHTML = `
            <td>${score.ranking}</td> <!-- Usar ranking para el número de posición -->
            <td>${medalHtml} ${score.name}</td>
            <td>${score.score}</td>
            <td>${score.date}</td>
            <td>${score.total_correct}</td>
            <td>${score.avg_time}</td>
        `;
        scoresList.appendChild(row);
    });
}