// Global variables and functions for each visualisation

var maildata;   // data for all mails, imported from .csv

var mapSliderVal;   // map for slider values
var arrSliderVal;   // array for slider values
var slider = document.getElementById("myRange");        // slider control
var output = document.getElementById("demo");       // slider output control

 // Showing/ Hiding the slider div
function hideSlider() {
    var x = document.getElementById("rb1");
    var y = document.getElementById("sliderDiv");
    if (x.checked === true) {
        y.style.display = "none";
    } else {
        y.style.display = "inline";
    }
}

// Radio buttons initialization
function radioButtonInit(refreshVisualFn) {    
    console.log(d3.selectAll('input[name="rb"]')); // Debug
    d3.selectAll('input[name="rb"]')
        .on("input", function () {
            // console.log("On Input" + d3.select('input[name="rb"]:checked').node().value); // Debug
            var filterDateBy = d3.select('input[name="rb"]:checked').node().value;
            sliderInit(filterDateBy, refreshVisualFn);            
            // console.log("BEFORE VIS 1", filterFromJob.value); // Debug
            //visualisation1(filterDateBy, mapSliderVal.get(arrSliderVal[slider.value]), filterFromJob.value);
            refreshVisualFn(filterDateBy);
        });
}        

// Slider initialisation
function sliderInit(filterDateBy, refreshVisualFn) {
    console.log("refreshVisualFn = ", refreshVisualFn); // Debug
    hideSlider();

    switch (filterDateBy) {
        case "All":
            mapSliderVal = d3.rollup(maildata, v => 1, d => 1);
            break;

        case "Year":
            mapSliderVal = d3.rollup(maildata, v => new Date(v[0].date.getFullYear(), 0, 1), d => d.date.getFullYear());
            break;

        case "Month":
            mapSliderVal = d3.rollup(maildata, v => new Date(v[0].date.getFullYear(), v[0].date.getMonth(), 1), d => d.date.getFullYear() + "-" + (d.date.getMonth() + 1));
            break;

        case "Day":
            mapSliderVal = d3.rollup(maildata, v => new Date(v[0].date.getFullYear(), v[0].date.getMonth(), v[0].date.getDate()), d => d.date.getFullYear() + "-" + (d.date.getMonth() + 1) + "-" + d.date.getDate());
            break;
    }

    
    arrSliderVal = Array.from(mapSliderVal.keys());
    arrSliderVal.sort();
    console.log("arrSliderVal = ", arrSliderVal); // Debug

    d3.select("#myRange")
        .attr("max", arrSliderVal.length - 1)
        .attr("value", 0);

    output.innerHTML = arrSliderVal[slider.value];

    // Set on inpit function
    slider.oninput = function () {
        output.innerHTML = arrSliderVal[slider.value];
        //visualisation1(d3.select('input[name="rb"]:checked').node().value, mapSliderVal.get(arrSliderVal[slider.value]), filterFromJob.value);        
        refreshVisualFn(filterDateBy);
    }
}