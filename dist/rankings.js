import { mostrarPinSiDisponible } from './user-pins.js';

let allScores = [];
let currentCategory = 'all';
let currentDateRange = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    mostrarPinSiDisponible(pin_code);
    const categorySelector = document.getElementById('category-selector');
    const dateRangeSelector = document.getElementById('date-range-selector');
    
    // Inicializa los puntajes
    allScores = await getAllScores(currentCategory, currentDateRange);
    updateScores(allScores);

    // Conecta el selector de categorías
    categorySelector.addEventListener('change', async (event) => {
        currentCategory = event.target.value;
        allScores = await getAllScores(currentCategory, currentDateRange);
        updateScores(allScores);
    });

    // Conecta el selector de rango de fechas
    dateRangeSelector.addEventListener('change', async (event) => {
        currentDateRange = event.target.value;
        allScores = await getAllScores(currentCategory, currentDateRange);
        updateScores(allScores);
    });

    // Manejo del parámetro de búsqueda en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const searchInput = document.getElementById('search-input');

    // Función para filtrar y mostrar los puntajes
    const filterAndDisplayScores = (query) => {
        const filteredScores = allScores.filter(score => score.name.toLowerCase().includes(query));
        displayFilteredScores(filteredScores);
    };

    // Si hay un parámetro de búsqueda en la URL, úsalo para filtrar
    if (searchParam) {
        const query = searchParam.toLowerCase();
        searchInput.value = searchParam; // Actualiza el input para que el usuario vea la búsqueda
        filterAndDisplayScores(query); // Filtra y muestra los puntajes
    }

    // Agrega listener al input de búsqueda
// Agrega listener al input de búsqueda
    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        
        if (query) {
            // Si hay texto en la búsqueda, filtra los resultados
            filterAndDisplayScores(query); 
        } else {
            // Si el input está vacío, vuelve a mostrar los 20 primeros puntajes
            updateScores(allScores);
        }
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
        scores.filter(score => score.category === currentCategory);
    displayScores(filteredScores);
}

// Muestra los puntajes
function displayScores(scores) {
    allCategories.forEach(category => {
        const listId = `best-scores-${category.toLowerCase()}`;
        const scoresList = document.getElementById(listId);

        if (scoresList) { // Verificar si scoresList existe
            scoresList.innerHTML = ''; // Limpiamos la lista al inicio

            // Solo mostramos los 20 mejores para cada categoría
            const categoryScores = scores.filter(score => score.category.toLowerCase() === category.toLowerCase()).slice(0, 10);
            populateScoreRows(categoryScores, scoresList);
        }
    });
}

// Muestra los puntajes filtrados
function displayFilteredScores(filteredScores) {
    allCategories.forEach(category => {
        const listId = `best-scores-${category.toLowerCase()}`;
        const scoresList = document.getElementById(listId);

        if (scoresList) {
            scoresList.innerHTML = ''; // Limpiar la tabla antes de llenar

            // Filtra los scores de la categoría actual
            const filteredCategoryScores = filteredScores.filter(score => score.category.toLowerCase() === category.toLowerCase());
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
            medalHtml = `<img src="${staticFolder}/svgs/gold.svg" alt="Medalla de Oro" width="20" height="20">`;
        } else if (score.ranking === 2) {
            medalHtml = `<img src="${staticFolder}/svgs/silver.svg" alt="Medalla de Plata" width="20" height="20">`;
        } else if (score.ranking === 3) {
            medalHtml = `<img src="${staticFolder}/svgs/bronze.svg" alt="Medalla de Bronce" width="20" height="20">`;
        }

        row.innerHTML = `
            <td>${medalHtml}${score.ranking}</td>
            <td>
                <div class="name-avatar-cell">
                    <div class="avatar-small">
                        ${multiavatar(score.name)} <!-- Genera el avatar basado en el nombre -->
                    </div>
                    <span class="user-name">${score.name}</span>
                </div>
            </td>
            <td>${score.score}</td>
            <td>${score.total_correct}</td>
            <td>${score.avg_time}</td>
        `;
        scoresList.appendChild(row);
    });
}