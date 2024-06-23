// calculations.js

////////////////////////
///////// DATA /////////
////////////////////////

window.parseData = function (data) {
  const obj = JSON.parse(data);

  let HalfBreadth_Waterlines, HalfBreadth_Stations, HalfBreadth_Table;
  let Buttock_Waterlines, Buttock_Stations, Buttock_Table;

  // Extraction des données HALFBreadth
  if (obj['structure']['hull']['halfBreadths']['table']) {
    let HalfBreadth = obj['structure']['hull']['halfBreadths'];
    HalfBreadth_Waterlines = HalfBreadth['waterlines'];
    HalfBreadth_Stations = HalfBreadth['stations'];
    HalfBreadth_Table = Object.values(HalfBreadth['table']);
  }

  // Extraction des données BUTTOCK HEIGHTS
  if (obj['structure']['hull']['buttockHeights']['table']) {
    let buttockHeights = obj['structure']['hull']['buttockHeights'];
    Buttock_Waterlines = buttockHeights['waterlines'];
    Buttock_Stations = buttockHeights['stations'];
    Buttock_Table = Object.values(buttockHeights['table']);
  }
  return {
    HalfBreadth_Waterlines,
    HalfBreadth_Stations,
    HalfBreadth_Table,
    Buttock_Waterlines,
    Buttock_Stations,
    Buttock_Table
  };
}



///////////////////////////
///////// CHARTS /////////
/////////////////////////


///////// HALF Breadth PLAN /////////

window.createHalfBreadthChart = function (HalfBreadth_Stations, HalfBreadth_Table) {

  const configHalf = {
    type: 'line',
    data: {
      labels: HalfBreadth_Stations,
      datasets: HalfBreadth_Table.map((row, index) => ({
        label: `Vector ${index + 1}`,
        data: row,
        borderColor: 'black',
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0
      }))
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Half Breadth Plan'
        },
        legend: {
          display: true,
        }
      }
    }
  };

  const HalfBreadthPlanctx = document.getElementById('HalfBreadthChart').getContext('2d');
  HalfBreadthChart = new Chart(HalfBreadthPlanctx, configHalf);
}

///////// Sheer PLAN /////////

window.createSheerPlanChart = function (ButtockStations, ButtockTable) {

    const configSheer = {
      type: 'line',
      data: {
        labels: ButtockStations,
        datasets: ButtockTable.map((vecteur, index) => ({
          label: `Vector ${index + 1}`,
          data: vecteur,
          borderColor: 'black',
          borderWidth: 1,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0
        }))
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Sheer Plan'
          },
          legend: {
            display: true
          }
        }
      }
    };

    // Create the Sheer Plan chart context
    const SheerPlanCtx = document.getElementById('SheerPlanChart').getContext('2d');
    SheerPlanChart = new Chart(SheerPlanCtx, configSheer);
  }

///////// BODY PLAN /////////

window.createBodyPlanChart = function (waterlines, bodyTable) {

  // Check if there are any data in the table
  if (bodyTable.length > 0 && bodyTable[0].length > 0) {
    // Create an array to store datasets
    var datasets = [];

    // Loop through the data and create a dataset for each vector
    for (var i = 0; i < bodyTable.length; i++) {
      var borderColor;
      if (bodyTable[i].some(value => value < 0)) {
        borderColor = 'rgba(0, 0, 0, 1)';
      } else {
        borderColor = 'rgba(128, 128, 128, 1)'; 
      }
      datasets.push({
        label:  `Vector ${i + 1}`,
        data: bodyTable[i],
        fill: false,
        borderColor: borderColor,
        borderWidth: 1,
        tension: 0.1
      });
    }

    const configBody = {
      type: 'line',
      data: {
        labels: waterlines,
        datasets: datasets.map(dataset => ({
          ...dataset,
          pointRadius: 0,
          pointHoverRadius: 0
        }))
      },
      options: {
        indexAxis: 'y',
        scales: {
          y: {
            reverse: false
          }
        },
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Body Plan'
          },
          datalabels: {
            display: false
          },
          legend: {
            display: true,
          }
        }
      }
    };

    // Create the chart
    const BodyPlanctx = document.getElementById('BodyPlanChart').getContext('2d');
    BodyPlanChart = new Chart(BodyPlanctx, configBody);
  } else {
    // If the table is empty, display a message or take another action
    console.log("No data available to create the Body Plan chart.");
  }
}


///////// DESTROY CHARTS /////////

window.destroyCharts = function() {
  if (HalfBreadthChart) {
    HalfBreadthChart.destroy();
    HalfBreadthChart = null;
  }
  if (BodyPlanChart) {
    BodyPlanChart.destroy();
    BodyPlanChart = null;
  }
  if (SheerPlanChart) {
    SheerPlanChart.destroy();
    SheerPlanChart = null;
  }
}


///////// UPDATE CHARTS /////////


window.updateChart = function(pointsVisible) {

  newStations = calculateNewStations(HalfBreadth_Stations, desiredPoints);
  newTable = calculateNewTable(HalfBreadth_Table, desiredPoints);
  newBodyTable = calculateNewTable(bodyTable, desiredPoints);
  newWaterlines = calculateNewWaterlines(HalfBreadth_Waterlines, desiredPoints);

  HalfBreadthChart.data.labels = newStations;
  HalfBreadthChart.data.datasets = newTable.map((row, index) => ({
    label: `Vecteur ${index + 1}`,
    data: row,
    borderColor: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
    fill: false,
    pointRadius: pointsVisible ? 3 : 0,
    pointHoverRadius: pointsVisible ? 5 : 0,
  }));

  HalfBreadthChart.update();


  BodyPlanChart.data.labels = newWaterlines;
  BodyPlanChart.data.datasets = newBodyTable.map((row, index) => ({
    label: '',
    data: row,
    borderColor: row.some(value => value < 0) ? 'rgba(54, 162, 235, 1)' : 'rgba(54, 89, 150, 1)',
    fill: false,
    pointRadius: pointsVisible ? 3 : 0,
    pointHoverRadius: pointsVisible ? 5 : 0,
    tension: 0.1
    
  }));
  BodyPlanChart.update();

  if (Buttock_Table) {
  newStations = calculateNewStations(Buttock_Stations, desiredPoints);
  newTable = calculateNewButtockTable(Buttock_Table, desiredPoints);

  SheerPlanChart.data.labels = newStations;
  SheerPlanChart.data.datasets = newTable.map((row, index) => ({
    label: `Vecteur ${index + 1}`,
    data: row,
    borderColor: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
    fill: false,
    pointRadius: pointsVisible ? 3 : 0,
    pointHoverRadius: pointsVisible ? 5 : 0,
    tension: 0.1
    
  }));
  SheerPlanChart.update();
  }
}


///////// LEGEND MANAGER /////////

window.updateChartLegend = function(legendVisible) {
  // Mettre à jour l'état de l'affichage de la légende dans chaque graphique
  HalfBreadthChart.options.plugins.legend.display = legendVisible;
  if (Buttock_Table){
    SheerPlanChart.options.plugins.legend.display = legendVisible;
  }
  BodyPlanChart.options.plugins.legend.display = legendVisible;

  // Mettre à jour les graphiques
  HalfBreadthChart.update();
  if (Buttock_Table){
    SheerPlanChart.update();
  }
  
}

///////// REVERSE MANAGER /////////

window.updateChartReverse = function(reverseVisible) {
  
  BodyPlanChart.options.scales.y.reverse = reverseVisible;

  BodyPlanChart.update();
}


////////////////////////////////
///////// INTERPOLATE /////////
//////////////////////////////


///////// STATIONS /////////

window.calculateNewStations = function (Data, desiredPoints) {

  let newData = [];

  for (let i = 0; i < Data.length - 1; i++) {
    newData.push(Data[i]);

    if (Data[i] !== 0 && Data[i + 1] !== 0) {
      let numInterpolatedPoints = Math.floor((desiredPoints - newData.length) / (Data.length - i - 1));

      if (numInterpolatedPoints > 0) {
        for (let k = 0; k < numInterpolatedPoints; k++) {
          let t = (k + 1) / (numInterpolatedPoints + 1);
          let x = Data[i] + t * (Data[i + 1] - Data[i]);
          x = Number(x.toFixed(2));
          newData.push(x);
        }
      }
    }
  }

  newData.push(Data[Data.length - 1]);

  return newData;
};


///////// WATERLINES /////////


window.calculateNewWaterlines = function (waterlines, desiredPoints) {
  let newWaterlines = [];

  for (let i = 0; i < waterlines.length - 1; i++) {
    newWaterlines.push(waterlines[i]);

    if (waterlines[i] !== 0 && waterlines[i + 1] !== 0) {
      let numInterpolatedPoints = Math.floor((desiredPoints - newWaterlines.length) / (waterlines.length - i - 1));

      if (numInterpolatedPoints > 0) {
        for (let k = 0; k < numInterpolatedPoints; k++) {
          let t = (k + 1) / (numInterpolatedPoints + 1);
          let x = waterlines[i] + t * (waterlines[i + 1] - waterlines[i]);
          x = Number(x.toFixed(2));
          newWaterlines.push(x);
        }
      }
    }
  }

  newWaterlines.push(waterlines[waterlines.length - 1]);

  return newWaterlines;
};


///////// TRANSPOSE TABLE /////////

window.transposeArray = function (array) {
  return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
}

///////// BODYPLAN /////////

window.adjustVectors = function (tableauTranspose) {
  const abs = Math.floor(tableauTranspose.length / 2); // Trouver la moitié de la longueur du tableau
  const firstHalf = tableauTranspose.slice(0, abs); // Prendre la première moitié du tableau
  const secondHalf = tableauTranspose.slice(abs); // Prendre la deuxième moitié du tableau

  // Inverser les valeurs des vecteurs de la deuxième moitié, en ignorant les valeurs nulles
  const negatedVectors = secondHalf.map(vector => vector.map(value => value !== null ? -value : null));

  return firstHalf.concat(negatedVectors); // Concaténer les deux parties du tableau ajustées
}

///////// TABLE /////////


window.calculateNewTable = function (table, desiredPoints) {
  let newTable = [];

  table.forEach(row => {
    let newRow = [];
    for (let i = 0; i < row.length - 1; i++) {
      newRow.push(row[i]);

      if (row[i] !== null && row[i + 1] !== null && row[i] !== 0 && row[i + 1] !== 0) {
        let numInterpolatedPoints = Math.floor((desiredPoints - newRow.length) / (row.length - i - 1));

        if (numInterpolatedPoints > 0) {
          for (let k = 0; k < numInterpolatedPoints; k++) {
            let t = (k + 1) / (numInterpolatedPoints + 1);
            let value = row[i] + t * (row[i + 1] - row[i]);
            value = Number(value.toFixed(2));
            newRow.push(value);
          }
        }
      }
    }

    newRow.push(row[row.length - 1]);
    newTable.push(newRow);
  });

  return newTable;
};


window.calculateNewButtockTable = function(table, desiredPoints) {
  let newTable = [];

  table.forEach(row => {
    let newRow = [];
    let nonNullValues = row.filter(value => value !== null);

    for (let i = 0; i < nonNullValues.length - 1; i++) {
      newRow.push(nonNullValues[i]);

      let numInterpolatedPoints = Math.floor((desiredPoints - newRow.length) / (nonNullValues.length - 1));

      if (numInterpolatedPoints > 0) {
        for (let k = 1; k <= numInterpolatedPoints; k++) {
          let t = k / (numInterpolatedPoints + 1);
          let value = nonNullValues[i] + t * (nonNullValues[i + 1] - nonNullValues[i]);
          value = Number(value.toFixed(2));
          newRow.push(value);
        }
      }
    }

    if (row[row.length - 1] !== null) {
      newRow.push(row[row.length - 1]);
    }
    
    newTable.push(newRow);
  });

  return newTable;
};


function getGradientColor(index, total) {
  // Start color: rgba(54, 162, 235, 1)
  const startColor = [100, 89, 150, 1];
  // End color: rgba(54, 89, 150, 1)
  const endColor = [54, 162, 235, 1];

  const factor = index / (total - 1);
  const interpolatedColor = startColor.map((channel, i) => {
    const delta = endColor[i] - channel;
    return Math.round(channel + factor * delta);
  });

  return `rgba(${interpolatedColor.join(',')})`;
}

