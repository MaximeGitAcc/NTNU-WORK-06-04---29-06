let pause = false;
let currentDirection = ''; // Variable globale pour stocker la direction actuelle des vagues
let WaveFunction_Amplitude = 0;

// Fonction de conversion des degrés en direction cardinale
function degreesToCardinal(degrees) {
    const cardinals = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
    const index = Math.round(degrees / 45) % 8;
    return cardinals[index];
}

document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            processCSVData(text);
        };
        reader.readAsText(file);
    }
});

document.getElementById('pauseButton').addEventListener('click', function () {
    pause = !pause;
    document.getElementById('pauseButton').textContent = pause ? 'Resume' : 'Pause';
});

const timeLabels = [];
let currentDay = '';

function processCSVData(data) {
    const lines = data.split('\n').slice(1); // Ignore la première ligne des noms des colonnes
    //console.log("CSV Lines:", lines);

    const waveDataReal = lines.map((line, index) => {
        if (line.trim() === '') {
            return NaN; // Ignore les lignes vides
        }

        const columns = line.split(','); // Séparer par virgule
        if (columns.length < 16) {
            console.warn(`Line ${index + 2} doesn't have enough columns.`); // L'index + 2 car on ignore la première ligne
            return NaN; // Si la ligne n'a pas assez de colonnes, ignorer
        }

        const dateTime = columns[0]; // Extraire la date et l'heure de la première colonne
        const dateParts = dateTime.split(' '); // Séparer la date et l'heure
        const date = dateParts[0]; // Date format "dd/mm/yyyy"
        const time = dateParts[1]; // Heure format "hh:mm:ss"
        const waveHeight = parseFloat(columns[13]); // Accéder à la 14ème colonne pour WVHT (index 13)
        const waveDirection = parseFloat(columns[5]); // Accéder à la 5ème colonne pour la direction des vagues
        const waveDirectionCardinal = degreesToCardinal(waveDirection); // Convertir la direction des vagues en direction cardinale
        // console.log(`Wave Height [Line ${index}]:`, waveHeight);
        // console.log(`Wave Direction [Line ${index}]:`, waveDirectionCardinal);
        return { date: date, time: time, value: waveHeight, direction: waveDirectionCardinal }; // Retourner la date, l'heure, la valeur et la direction
    }).filter(value => !isNaN(value.value)); // Filtrer les valeurs non numériques

    //console.log("Filtered Wave Data:", waveDataReal);

    if (waveDataReal.length === 0) {
        console.error("No valid wave data found.");
        return;
    }

    // Créer des points positifs et négatifs pour chaque hauteur de vague
    const wavePoints = [];
    waveDataReal.forEach(data => {
        const halfHeight = data.value / 2; // Divisez chaque valeur par deux
        wavePoints.push({ date: data.date, time: data.time, value: halfHeight, direction: data.direction });
        wavePoints.push({ date: data.date, time: data.time, value: -halfHeight, direction: data.direction });
    });

    //console.log("Wave Points:", wavePoints);
    initWaveChart(wavePoints);
}

// Initialisation du contexte du canvas et des données
const ctx = document.getElementById('waveChart').getContext('2d');

// Options du graphique
const options = {
    responsive: true,
    animation: {
        duration: 0 // Désactive l'animation par défaut
    },
    scales: {
        x: {
            type: 'category',
            ticks: {
                autoSkip: false,
                maxRotation: 90,
                minRotation: 90
            },
            title: {
                display: true,
                text: 'Time in Hours (HH:MM)',
                fontSize: 18
            }
        },
        y: {
            min: -4, // Minimum de l'axe des ordonnées
            max: 4, // Maximum de l'axe des ordonnées
            title: {
                display: true,
                text: 'Wave Heights (m)',
                fontSize: 18
            }
        }
    }
};

// Fonction principale pour initialiser et animer le graphique
function initWaveChart(wavePoints) {
    const datasets = [
        {
            label: '',
            backgroundColor: 'rgba(0, 102, 255, 0.5)',
            borderColor: 'rgba(0, 0, 153,1)',
            borderWidth: 2,
            pointRadius: 1, // Taille des points (0 pour ne pas les afficher)
            lineTension: 0.4, // Courbes
            data: []
        }
    ];

    const waveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: datasets
        },
        options: options
    });

    // Fonction pour ajouter progressivement les points de données
    let dataIndex = 0;

    function addWaveData() {
        if (!pause && dataIndex < wavePoints.length) {
            const point = wavePoints[dataIndex];
            waveChart.data.datasets[0].data.push(point.value);
            waveChart.data.labels.push(point.time);

            // Vérifier si la date ou la direction a changé
            if (currentDay !== point.date || currentDirection !== point.direction) {
                currentDay = point.date;
                currentDirection = point.direction;
                waveChart.data.datasets[0].label = `Waves: ${currentDay} (${currentDirection})`;
            }

            if (waveChart.data.datasets[0].data.length > 8) {
                // Supprimer le premier élément des données
                waveChart.data.datasets[0].data.shift();
                // Supprimer le premier label
                waveChart.data.labels.shift();
            }

            WaveFunction_Amplitude = point.value;

            waveChart.update();
            dataIndex += 1; // Passer au prochain point
        }
        setTimeout(addWaveData, 1000); // Ajoute une nouvelle donnée toutes les secondes
    }

    addWaveData(); // Commence l'ajout de données
}
