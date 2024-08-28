let selectedDateRange = 'all';

const dateRangeSelect = document.getElementById('date-range');

async function updateScores() {
    const categories = ['Deportes', 'Historia', 'Software', 'Moda', 'Economia'];
    await Promise.all(categories.map(category => 
        getScoresByCategoryAndDate(category, selectedDateRange)
            .then(scores => displayScores(category, scores))
    ));
}

async function getScoresByCategoryAndDate(category, dateRange) {
    try {
        const response = await fetch(`/get_all_scores_dates/${category}/${dateRange}`);
        const data = await response.json();
        return data.scores || [];
    } catch (error) {
        console.error('Error fetching scores:', error);
        return [];
    }
}

function displayScores(category, scores) {
    const listId = `best-scores-${category.toLowerCase()}`;
    const scoresList = document.getElementById(listId);
    scoresList.innerHTML = '';

    scores.slice(0, 10).forEach(score => {
        const listItem = document.createElement('li');
        listItem.textContent = `${score.name}: ${score.score}`;
        scoresList.appendChild(listItem);
    });
}

document.addEventListener('DOMContentLoaded', updateScores);