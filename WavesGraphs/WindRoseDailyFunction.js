var DailyGraph_graphVisible = false;

document.getElementById('fileInput').addEventListener('change', function (event) {
    var file = document.getElementById('fileInput').files[0];
});

document.getElementById('dayWindRoseButton').addEventListener('click', function () {
    if (!DailyGraph_graphVisible) {

        if (!parsedData) {
            alert("Please upload a file first.");
        }
        document.getElementById('start').style.display = 'block';
        document.getElementById('slider').style.display = 'block';
        document.getElementById('sliderValue').style.display = 'block';

        displayDayWindRose();
        DailyGraph_graphVisible = true;
        document.getElementById('dayWindRoseButton').textContent = 'Hide Daily Wind Rose';
    } else {
        hideDayWindRose();
        DailyGraph_graphVisible = false;
        document.getElementById('DailyGraph').style.display = 'none';
        document.getElementById('dayWindRoseButton').textContent = 'Show Daily Wind Rose';
    }
});

document.getElementById('start').addEventListener('change', function () {
    
    if (DailyGraph_graphVisible) {
        displayDayWindRose();
    }
});


const slider = document.getElementById('slider');
const sliderValue = document.getElementById('sliderValue');
const values = [5, 10, 15, 45];

slider.addEventListener('input', function () {
    const step = values[slider.value];
    sliderValue.textContent = step + '°';
    updateCardinals(step);
    if (DailyGraph_graphVisible) {
        displayDayWindRose();
    }
});

sliderValue.textContent = values[slider.value] + '°';


function updateCardinals(step) {
    var cardinals = [];
    for (var i = 0; i <= 360; i += step) {
        cardinals.push(i);
    }
    cardinals.push(360); 
    window.cardinals = cardinals; 
}

function displayDayWindRose() {
    var file = document.getElementById('fileInput').files[0];
    var targetDate = document.getElementById('start').value;

    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            var data = results.data;
            var theta = [];
            var r = [];

            data.forEach(row => {
                var time = row['Time'];
                var meanWaveDirection = row['Mean wave direction'];
                var significantHeight = row['Significant height of combined wind waves and swell'];
                if (time && !isNaN(meanWaveDirection) && !isNaN(significantHeight)) { 
                    var datePart = time.split(' ')[0]; 
                    if (datePart === formatDate(targetDate)) {
                        var roundedTheta = roundToNearestCardinal(meanWaveDirection); 
                        var roundedR = roundToHalf(significantHeight);
                        if (!r.includes(roundedR)) { 
                            theta.push(roundedTheta);
                            r.push(roundedR);
                        }
                    }
                }
            });

            if (theta.length === 0 || r.length === 0) {

                document.getElementById('DailyGraph').innerHTML = "<h2>No Data available for this date</h2>";
                return;
            }


            var colors = assignColorsReversed(r);


            var plotData = r.map((rValue, index) => ({
                r: [rValue],
                theta: [theta[index]],
                name: rValue + " meters",
                marker: { color: colors[index] },
                type: "barpolar",
                width: 30
            }));


            plotData.sort((a, b) => b.r[0] - a.r[0]);

            var layout = {
                title: "Wave Rose",
                font: { size: 16 },
                legend: { font: { size: 16 } },
                polar: {
                    barmode: "overlay",
                    bargap: 0,
                    radialaxis: { ticksuffix: "m", angle: 45, dtick: 1 },
                    angularaxis: { direction: "clockwise", dtick: 45 }
                }
            };

            Plotly.newPlot("DailyGraph", plotData, layout);
            document.getElementById('DailyGraph').style.display = 'block';
        }
    });
}

function hideDayWindRose() {

    document.getElementById('DailyGraph').innerHTML = '';
    document.getElementById('DailyGraph').style.display = 'none';
    document.getElementById('start').style.display = 'none';
    document.getElementById('slider').style.display = 'none';
    document.getElementById('sliderValue').style.display = 'none';
}


function formatDate(dateString) {
    var dateParts = dateString.split('-');
    return dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
}


function roundToHalf(value) {
    var converted = parseFloat(value);
    var decimal = (converted - Math.floor(converted));
    var rounded = (decimal >= 0.25 && decimal < 0.75) ? Math.floor(converted) + 0.5 : Math.round(converted); // Arrondir à 0.5 près
    return rounded;
}

function roundToNearestCardinal(value) {

    var nearest = window.cardinals[0];
    var minDiff = Math.abs(value - window.cardinals[0]);
    for (var i = 1; i < window.cardinals.length; i++) {

        var diff = Math.abs(value - window.cardinals[i]);
        var diffPeriodic = Math.abs(360 - diff);
        var minDiffPeriodic = Math.min(diff, diffPeriodic);
        if (minDiffPeriodic < minDiff) {
            nearest = window.cardinals[i];
            minDiff = minDiffPeriodic;
        }
    }
    return nearest;
}


function assignColorsReversed(rValues) {

    var startColor = [0, 0, 255];
    var endColor = [173, 216, 230];
    var colors = [];


    var minR = Math.min(...rValues);
    var maxR = Math.max(...rValues);
    var range = maxR - minR;


    for (var i = 0; i < rValues.length; i++) {
        var percent = 1 - (rValues[i] - minR) / range;
        var color = interpolateColor(startColor, endColor, percent);
        colors.push("rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")");
    }
    return colors;
}


function interpolateColor(startColor, endColor, percent) {
    var color = [];
    for (var i = 0; i < 3; i++) {
        color[i] = Math.round(startColor[i] + percent * (endColor[i] - startColor[i])); // Interpolation linéaire
    }
    return color;
}


updateCardinals(values[slider.value]);