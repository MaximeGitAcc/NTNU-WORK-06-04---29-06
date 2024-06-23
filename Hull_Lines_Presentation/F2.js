// Définir les variables globales
let newStations = [];
let newTable = [];
let newWaterlines = [];
let desiredPoints = 0;
let HalfBreadthChart;
let BodyPlanChart;
let ShearPlanChart;
let pointsVisible = false;
let legendVisible = true;
let reverseVisible = false;
let tableauTranspose = [];
let bodyTable = [];
let HalfBreadth_Waterlines, HalfBreadth_Stations, HalfBreadth_Table;
let Buttock_Waterlines, Buttock_Stations, Buttock_Table;


// Gestion de la lecture du fichier JSON et de la création du graphique
document.getElementById('fileInput').addEventListener('change', function (event) {
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.onload = function (event) {
    var data = event.target.result;

    ({
      HalfBreadth_Waterlines,
      HalfBreadth_Stations,
      HalfBreadth_Table,
      Buttock_Waterlines,
      Buttock_Stations,
      Buttock_Table
    } = parseData(data));


    destroyCharts()


    //////////////// HALFBreadth

    if (HalfBreadth_Table) {
      createHalfBreadthChart(HalfBreadth_Stations, HalfBreadth_Table);
    } else {
      console.log("HalfBreadth Table is empty or undefined. Cannot create Half Breadth Plan chart.");
    }

    //////////////// SHEAR

    if (Buttock_Table) {
      const shearPlanContainer = document.getElementById('shearPlanContainer');
      const shearPlanCanvas = document.createElement('canvas');
      shearPlanCanvas.id = 'ShearPlanChart'; 
      shearPlanContainer.appendChild(shearPlanCanvas);
      createShearPlanChart(Buttock_Stations, Buttock_Table);
    } else {
      console.log("ButtockTable is empty or undefined. Cannot create Shear Plan chart.");
      let chartItems = document.getElementsByClassName("chart-item");

      for (let i = 0; i < chartItems.length; i++) {
        chartItems[i].style.marginLeft = "50%";
      }
    }



    //////////////// BODY


    // Create the Body Table
    tableauTranspose = transposeArray(HalfBreadth_Table);
    bodyTable = adjustVectors(tableauTranspose);

    // Plot the Graph
    createBodyPlanChart(HalfBreadth_Waterlines, bodyTable);


    // Sélectionner l'élément pour afficher le nombre minimum de points
    let minPointsText = document.getElementById("minPointsText");

    // Mettre à jour le texte avec la valeur minimale des points
    minPointsText.textContent = "Minimum points : " + HalfBreadth_Stations.length;

    // Mettre à jour le curseur avec la taille de la variable stations
    pointsInput.value = HalfBreadth_Stations.length;

    // Mettre à jour le graphique avec les données initiales
    //updateChart();

  };

  reader.readAsText(file);

});





// Écouter l'événement clic sur le bouton pour activer/désactiver l'affichage des points
document.getElementById("togglePointsButton").addEventListener("click", function () {
  // Inverser l'état de l'affichage des points
  pointsVisible = !pointsVisible;

  // Mettre à jour le graphique avec le nouvel état de l'affichage des points
  updateChart(pointsVisible); // Appel de la fonction updateChart avec la nouvelle valeur de pointsVisible

});

document.getElementById("toggleLegendButton").addEventListener("click", function () {
  // Inverser l'état de l'affichage de la légende
  legendVisible = !legendVisible;

  // Mettre à jour le graphique avec le nouvel état de l'affichage de la légende
  updateChartLegend(legendVisible); // Appel de la fonction updateChartLegend avec la nouvelle valeur de legendVisible
})

document.getElementById("toggleReverseButton").addEventListener("click", function () {
  // Inverser l'état de l'affichage de la légende
  reverseVisible = !reverseVisible;

  // Mettre à jour le graphique avec le nouvel état de l'affichage de la légende
  updateChartReverse(reverseVisible); // Appel de la fonction updateChartLegend avec la nouvelle valeur de legendVisible
})




// Écouter l'événement input sur l'input de texte pour mettre à jour le nombre de points
document.getElementById('pointsInput').addEventListener('input', function (event) {
  // Récupérer la valeur saisie dans l'input de texte
  let inputPoints = parseInt(event.target.value);
  // Limiter la valeur saisie à un maximum de 100
  if (inputPoints > 100) {
    inputPoints = 100;
  }
  // Mettre à jour la variable desiredPoints avec la valeur saisie
  if (!isNaN(inputPoints)) {
    desiredPoints = inputPoints;
    // Mettre à jour le champ de texte avec la valeur saisie
    document.getElementById('pointsInput').value = inputPoints;
    // Mettre à jour la valeur du slider avec la valeur saisie
    document.getElementById('myRange').value = inputPoints;
    // Mettre à jour le graphique avec le nouveau nombre de points
    updateChart(pointsVisible);
  }
});


// Sélectionner l'élément de la barre de défilement
let slider = document.getElementById("myRange");

// Écouter l'événement input sur le slider pour mettre à jour le nombre de points
document.getElementById('myRange').addEventListener('input', function (event) {
  // Récupérer la valeur du slider
  const sliderValue = parseInt(event.target.value);
  // Mettre à jour la variable desiredPoints avec la valeur du slider
  desiredPoints = sliderValue;

  // Mettre à jour le champ de texte avec la valeur du slider
  document.getElementById('pointsInput').value = sliderValue;

  // Mettre à jour le graphique avec le nouveau nombre de points
  updateChart(pointsVisible);
});

