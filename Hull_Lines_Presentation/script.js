

var JSON_data = {
	"attributes": {},
	"data": {},
	"structure": {
		"hull": {
			"halfBreadths": {
				"waterlines": [0,2,4,6,8,10,12,14,16,18],
				"stations": [0,10.2,20.4,30.6,40.8,51,61.2,71.4,81.6,91.8,102],
                "table": [
                    [3.72,null ,null ,null ,null ,null ,null ,null ,null ,null ,null],
                    [3.2,7.92,10.13,11.15,null ,null ,null ,null ,null ,null ,null],
                    [2.41,7.36,9.93,11.1,11.39,11.4,11.26,11.07,10.84,10.53,10.09],
                    [1.58,6.26,9.2,10.7,11.19,11.32,11.21,11.02,10.76,10.45,10.02],
                    [0.97,5.19,8.39,10.21,10.93,11.17,11.05,10.84,10.59,10.27,9.84],
                    [0.46,4.07,7.43,9.63,10.64,10.98,10.87,10.66,10.41,10.07,9.65],
                    [0,2.94,6.25,8.81,10.15,10.65,10.56,10.32,9.97,9.56,9.04],
                    [null ,1.8,4.6,7.23,8.88,9.65,9.67,9.25,8.5,7.27,3.08],
                    [null ,0.72,2.44,4.44,5.85,6.39,5.46,0.8,null ,null ,null ],
                    [null,0,0,0,0,0,0,0,0,0,0]
                ]
			},
			"style": {
				"upperColor": "green",
				"lowerColor": "pink",
				"opacity": 0.6
			},
			"buttockHeights": {
				"waterlines": [0,2,4,8,10],
				"stations": [0,10.2,20.4,30.6,40.8,51,61.2,71.4,81.6,91.8,102],
				"table": [
					[null,null,14.2,9.24,5.63,4.48,4.49,5.11,6.08,7.52,11.75],
                    [null,16.59,9.14,4.82,3.24,2.71,2.77,3.16,3.71,4.36,4.97],
                    [null,11.51,5.65,3,2.07,1.88,2.1,2.55,3.1,3.69,4.3],
                    [null,7.87,3.4,1.76,1.32,1.41,1.78,2.3,2.86,3.45,4.08],
                    [13.09,4.36,1.63,0.82,0.73,1.02,1.53,2.1,2.68,3.27,3.91 ],
                    [6,0.66,0.1,0.09,0.28,0.71,1.34,1.95,2.54,3.14,3.76]
                ]
		
			  }
		}
	}
}



let newStations = [];
let newTable = [];
let newWaterlines = [];
let desiredPoints = 0;
let HalfBreadthChart;
let BodyPlanChart;
let SheerPlanChart;
let pointsVisible = false;
let legendVisible = true;
let reverseVisible = false;
let tableauTranspose = [];
let bodyTable = [];
let HalfBreadth_Waterlines = JSON_data.structure.hull.halfBreadths.waterlines;
let HalfBreadth_Stations = JSON_data.structure.hull.halfBreadths.stations;
let HalfBreadth_Table = JSON_data.structure.hull.halfBreadths.table;
let Buttock_Waterlines = JSON_data.structure.hull.buttockHeights.waterlines;
let Buttock_Stations = JSON_data.structure.hull.buttockHeights.stations;
let Buttock_Table = JSON_data.structure.hull.buttockHeights.table;



document.addEventListener("DOMContentLoaded", function () {
    const modal_HalfBreadth = document.getElementById('halfBreadthModal');
    const btn_HalfBreadth = document.getElementById('Button_HalfBreadth');
	const spanHalf = document.getElementById('closeModalHalfBreadth');
	const modal_Sheer = document.getElementById('SheerModal');
    const btn_Sheer = document.getElementById('Button_Sheer');
    const spanSheer = document.getElementById('closeModalSheer');
	const modal_Body = document.getElementById('BodyModal');
    const btn_Body = document.getElementById('Button_Body');
	const spanBody = document.getElementById('closeModalBody');

    btn_HalfBreadth.addEventListener('click', function() {
        modal_HalfBreadth.style.display = 'block';
        createHalfBreadthChart(HalfBreadth_Stations, HalfBreadth_Table);
    });

	btn_Sheer.addEventListener('click', function() {
        modal_Sheer.style.display = 'block';
        createSheerPlanChart(Buttock_Stations, Buttock_Table);
    });

	btn_Body.addEventListener('click', function() {
        modal_Body.style.display = 'block';
		tableauTranspose = transposeArray(HalfBreadth_Table);
		bodyTable = adjustVectors(tableauTranspose);
        createBodyPlanChart(HalfBreadth_Waterlines, bodyTable);
    });


    spanHalf.addEventListener('click', function() {
        modal_HalfBreadth.style.display = 'none';
    });

    spanSheer.addEventListener('click', function() {
        modal_Sheer.style.display = 'none';
    });

	spanBody.addEventListener('click', function() {
        modal_Body.style.display = 'none';
    });

    // Fermer la fenêtre modale lorsqu'on clique en dehors du contenu
    window.addEventListener('click', function(event) {
        if (event.target === modal_HalfBreadth) {
            modal_HalfBreadth.style.display = 'none';
        }
		else if (event.target === modal_Sheer) {
            modal_Sheer.style.display = 'none';
        }
    });
});



