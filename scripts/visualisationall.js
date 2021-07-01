// VISUALISATION ALL
// This JavaScript file contains the code for the both visualisations, the adjecency matrix. All changes made here will be reflexed on the visualisationall.html page.

// --- Functions ---

// Called when data are loaded
function dataLoadedAll(results) {
    // print the JSON result to the console
    console.log("JSON output:", results);  

    initVisual1();    // init visual1
    document.getElementById("visual2").innerHTML = ""; // clear visual2

    maildata = initRealData(results); 

    console.log(maildata);  // Debug
        
    // Init radio buttons
    radioButtonInit(refreshVisualAll);
    // Init date slider
    sliderInit(d3.select('input[name="rb"]:checked').node().value, refreshVisualAll);
    // Init filter From Job
    filterFromJobInit();
    // Select colorBy initializtion
    colorByInit();

    // Show legend for visualisation 2
    showLegend();

    console.log("BEFORE VIS ALL", mapSliderVal.get(arrSliderVal[slider.value]), filterFromJob.value)       // Debug
    refreshVisualAll(d3.select('input[name="rb"]:checked').node().value);
}

// Refresh Visual All
function refreshVisualAll(filterDateBy = "All") {   
    visualisation1(filterDateBy, mapSliderVal.get(arrSliderVal[slider.value]), filterFromJob.value);
    visualisation2(filterDateBy, mapSliderVal.get(arrSliderVal[slider.value]));
}