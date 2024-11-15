// Colores de las jugadores
const categoryColors = [
    'rgba(255, 69, 0, 0.5)',     // Vibrante Rojo Naranja
    'rgba(0, 128, 0, 0.5)',      // Verde Bosque
    'rgba(30, 144, 255, 0.5)',   // Azul Brillante
    'rgba(255, 215, 0, 0.5)',    // Amarillo Dorado
    'rgba(0, 255, 255, 0.5)',    // Cian
    'rgba(255, 20, 147, 0.5)',   // Rosa Profundo
    'rgba(0, 255, 0, 0.5)',      // Verde Limón
    'rgba(70, 130, 180, 0.5)',   // Azul Acero
    'rgba(255, 140, 0, 0.5)',    // Naranja Quemado
];
// Llamada al endpoint para obtener datos dinámicamente
async function fetchAvgScores() {
    try {
        const response = await fetch('/get_average_scores/');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function fetchTopPlayersData() {
    try {
        const response = await fetch('/get_top_players/'); // Llamada al nuevo endpoint
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching top players data:', error);
        return null;
    }
}
async function renderBarChart() {
    // Define colores vibrantes para las barras
    const colors = [
        'rgba(255, 69, 0, 0.8)',     // Vibrante Rojo Naranja
        'rgba(0, 128, 0, 0.8)',      // Verde Bosque
        'rgba(30, 144, 255, 0.8)',   // Azul Brillante
        'rgba(255, 215, 0, 0.8)',    // Amarillo Dorado
        'rgba(0, 255, 255, 0.8)',    // Cian
        'rgba(255, 20, 147, 0.8)',   // Rosa Profundo
        'rgba(0, 255, 0, 0.8)',      // Verde Limón
        'rgba(70, 130, 180, 0.8)',   // Azul Acero
        'rgba(255, 140, 0, 0.8)',    // Naranja Quemado
    ];

    // Fetch data from the backend
    const response = await fetch('/get_category_percentages/');
    const chartData = await response.json();
    if (!chartData) return;

    const ctx = document.getElementById('barChart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.categories, // Categorías
            datasets: [{
                data: chartData.percentages, // Porcentajes
                backgroundColor: colors.slice(0, chartData.categories.length), // Colores según el número de categorías
                borderColor: 'rgba(255, 255, 255, 0.7)', // Color del borde
                borderWidth: 1,
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Qué categorías interesan más? % partidas jugadas',
                    font: {
                        size: 18,
                        weight: 'bold',
                        family: 'Arial, sans-serif',
                    },
                    color: 'rgba(255, 255, 255, 0.85)',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
async function renderChart() {
    // Define colores transparentes para cada categoría
    
    const chartData = await fetchAvgScores();
    if (!chartData) return;

    const ctx = document.getElementById('myChart').getContext('2d');

    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: chartData.labels, // Etiquetas de las categorías
            datasets: [{
                data: chartData.datasets[0].data, // Valores de puntuación promedio
                backgroundColor: categoryColors.slice(0, chartData.labels.length),  // Asigna colores según el número de etiquetas
                borderColor: 'rgba(255, 255, 255, 0.7)', // Color del borde
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const category = chartData.labels[tooltipItem.dataIndex];
                            const score = chartData.datasets[0].data[tooltipItem.dataIndex];
                            return `${category}: ${score.toFixed(2)}`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Promedio global de puntos por categoría',
                    font: {
                        size: 18,
                        weight: 'bold',
                        family: 'Arial, sans-serif',
                    },
                    color:'rgba(255, 255, 255, 0.85)',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },
            scales: {
                r: {
                    ticks: {
                        display: true,
                        backdropColor: 'rgba(0, 0, 0, 0)',
                        color: 'white',
                        font: {
                            size: 14
                        }
                    },
                    pointLabels: {
                        font: {
                            size: 14,
                            weight: 'bold',
                        },
                        color: 'white'
                    }
                }
            }
        }
    });
}

async function renderRadarChart() {
    const colors = ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB'];

    const topPlayersData = await fetchTopPlayersData(); // Obtener datos de los jugadores
    if (!topPlayersData) return;

    const ctxRadar = document.getElementById('myRadarChart').getContext('2d');

    const datasets = [];

    // Mapeo de nombres descriptivos de las categorías
    const labels = allCategories.map(category => categoryNames[category]); // Obtiene el nombre descriptivo

    // Generar datasets para cada jugador
    for (const [playerName, playerData] of Object.entries(topPlayersData.top_players)) {
        const scores = allCategories.map(category => playerData.scores[category] || 0); // Mapeamos puntuaciones usando 0 si no hay puntuación
        
        // Asegúrate de que scores tenga longitud igual a allCategories
        datasets.push({
            label: playerName,
            data: scores,
            backgroundColor: colors[datasets.length % colors.length] + '30',  // Color con opacidad
            borderColor: colors[datasets.length % colors.length],
            borderWidth: 2,
            fill: true // Para asegurar que el área esté llena
        });
    }

    const data = {
        labels: labels, // Etiquetas para las categorías
        datasets: datasets // Datos de puntuaciones para los 5 jugadores
    };

    new Chart(ctxRadar, {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                }
            },
            elements: {
                line: {
                    tension: 0, // Cambiado a 0 para evitar suavizado
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 16, // Aumenta el tamaño de la fuente de la leyenda
                            weight: '500' // Opcional: cambia el peso de la fuente
                        },
                        color: 'white' // Cambia el color de la fuente de la leyenda
                    }
                },
                title: {
                    display: true,
                    text: 'Top 5 Jugadores global',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    color: 'rgba(255, 255, 255, 0.85)'
                }
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', function () {
    const chartContainer = document.getElementById('chart-container');

    // Usamos IntersectionObserver para cargar el gráfico cuando el contenedor es visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                renderChart(); // Renderizamos el gráfico de promedio
                renderRadarChart(); // Renderizamos el gráfico radar
                renderBarChart();
                observer.unobserve(chartContainer); // Desobservamos después de cargar
            }
        });
    });

    observer.observe(chartContainer); // Observamos el contenedor del gráfico
});