let parsedData = null;
let MonthlyGraph_graphVisible = false;

document.getElementById('fileInput').addEventListener('change', function (event) {
    var file = document.getElementById('fileInput').files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                parsedData = results.data;
            }
        });
    }
});

document.getElementById('montWindRoseButton').addEventListener('click', function () {
    if (!MonthlyGraph_graphVisible) {

        if (parsedData) {
            processMonthlyData(parsedData);
        } else {
            alert("Please upload a file first.");
        }
        document.getElementById('montWindRoseButton').textContent = 'Hide Monthly Wind Rose';
    } else {
        document.getElementById('monthlyGraph').style.display = 'none';
        document.getElementById('legendButton').style.display = 'none';
        MonthlyGraph_graphVisible = false;
        document.getElementById('montWindRoseButton').textContent = 'Show Monthly Wind Rose';
    }
});

document.getElementById('legendButton').addEventListener('click', function () {
    var update = {
        showlegend: !document.getElementById('monthlyGraph').layout.showlegend
    };
    Plotly.relayout('monthlyGraph', update);
});

function processMonthlyData(data) {
    var theta = [];
    var r = [];

    data.forEach(row => {
        var meanWaveDirection = row['Mean wave direction'];
        var significantHeight = row['Significant height of combined wind waves and swell'];

        if (!isNaN(meanWaveDirection) && !isNaN(significantHeight)) {
            var roundedTheta = roundToNearestCardinal(meanWaveDirection);
            var roundedR = roundToHalf(significantHeight);

            theta.push(roundedTheta);
            r.push(roundedR);
        }
    });

    if (theta.length === 0 || r.length === 0) {
        document.getElementById('monthlyGraph').innerHTML = "<h2>No Monthly Data available</h2>";
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
        title: "Monthly Wave Rose",
        font: { size: 16 },
        polar: {
            barmode: "overlay",
            bargap: 0,
            radialaxis: { ticksuffix: "m", angle: 45, dtick: 1 },
            angularaxis: { direction: "clockwise", dtick: 45 }
        },
        showlegend: false // Légende masquée par défaut
    };

    Plotly.newPlot("monthlyGraph", plotData, layout);

    // Afficher le graphique et le bouton de légende après la création du graphique
    document.getElementById('monthlyGraph').style.display = 'block';
    document.getElementById('legendButton').style.display = 'block';
    MonthlyGraph_graphVisible = true;
}

function roundToNearestCardinal(value) {
    var cardinals = [0, 45, 90, 135, 180, 225, 270, 315, 360];
    var nearest = cardinals[0];
    var minDiff = Math.abs(value - cardinals[0]);
    for (var i = 1; i < cardinals.length; i++) {
        var diff = Math.abs(value - cardinals[i]);
        var diffPeriodic = Math.abs(360 - diff);
        var minDiffPeriodic = Math.min(diff, diffPeriodic);
        if (minDiffPeriodic < minDiff) {
            nearest = cardinals[i];
            minDiff = minDiffPeriodic;
        }
    }
    return nearest;
}

function roundToHalf(value) {
    var converted = parseFloat(value);
    var decimal = (converted - Math.floor(converted));
    var rounded = (decimal >= 0.25 && decimal < 0.75) ? Math.floor(converted) + 0.5 : Math.round(converted);
    return rounded;
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
        color[i] = Math.round(startColor[i] + percent * (endColor[i] - startColor[i]));
    }
    return color;
}