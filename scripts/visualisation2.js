// VISUALISATION 2
// This JavaScript file contains the code for the second visualisation, the adjecency matrix. All changes made here will be reflexed on the visualisation2.html page.

// --- Constants ---
 //Legend Const
const legend_keys1 = ["Very Negative", "Medium Negative", "Slightly Negative", "Neutral", "Slightly Positive", "Medium Positive", "Very Positive"];
const legend_colors1 = ['BlueViolet', 'DodgerBlue', 'MediumSpringGreen', 'White', 'Gold', 'OrangeRed', 'DarkRed'];
const legend_keys2 = ["CEO", "Director", "Employee", "In House Lawyer", "Manager", "Managing Director", "President", 'Trader', 'Unknown', 'Vice President'];
const legend_colors2 = ['Gold', 'OrangeRed', 'DodgerBlue', 'BlueViolet', 'MediumSpringGreen', 'MediumVioletRed', 'DarkRed', 'GreenYellow', 'Aqua', 'IndianRed'];
const legend_width = 954;
const legend_size = 10;

 // Margins
const margin = {
  top: 120,
  right: 0,
  bottom: 0,
  left: 120
};

// --- Variables ---
var v2_width = 1700 - margin.left - margin.right;
var v2_height = 1700 - margin.top - margin.bottom;

var opacity = d3.scalePow()
  .domain([0, 50])
  .range([0.15, 1])
  .clamp(false);

var x = d3.scaleBand()
  .rangeRound([0, v2_width])
  .paddingInner(0.1)
  .align(0);

var mapEmail;
var arrEmailKeys;
var matrixEmail;

var svgDOM;

var selectColor = document.getElementById("colorBy");
var visual2 = document.getElementById("visual2")


// --- Functions ---

// Called when data are loaded
function dataLoaded2 (results){  
  visual2.innerHTML = ""; // clear the visual

  // Initializing the real data
  maildata = initRealData(results);

  // Radio buttons initialization
  console.log(d3.selectAll('input[name="rb"]')); // Debug 
  radioButtonInit(refreshVisual2);

  // Init slider  
  sliderInit(d3.select('input[name="rb"]:checked').node().value, refreshVisual2);

  // Select colorBy initializtion
  colorByInit();

  // Show legend
  showLegend();

  // Call initial visualisation      
  refreshVisual2(d3.select('input[name="rb"]:checked').node().value);
}

   // Select colorBy initializtion
function colorByInit() {   
   d3.selectAll('select[name="colorBy"]')
    .on("change", function () {
      console.log("On Change"); // Debug
      showLegend();
      var filterDateBy = d3.select('input[name="rb"]:checked').node().value;
      refreshVisual2(filterDateBy);
   });
}   


// Refresh Visual 2
function refreshVisual2(filterDateBy = "All") {
  // console.log("BEFORE VIS 1", filterFromJob.value); // Debug
  visualisation2(filterDateBy, mapSliderVal.get(arrSliderVal[slider.value]));
}

  // Visualisation
function visualisation2(filterDateBy, dateFilter) {
  mapEmail = generateMap(maildata, filterDateBy, dateFilter);
  arrEmailKeys = reorderKeys(mapEmail);
  matrixEmail = generateMatrix(mapEmail, arrEmailKeys);
  
  console.log(mapEmail); //Debug
  console.log(matrixEmail); //Debug  

  x.domain(d3.range(mapEmail.size));

    // Delete old visualisation        
  d3.select('#visual2').select("svg").remove();

  //v2_width = visual2.width - margin.left - margin.right;
  //v2_height = visual2.width - margin.top - margin.bottom;

    // Creating SVG element
  svgDOM = d3.select('#visual2')
    .append("svg")
      .attr('class','matrixdiagram')
      //.attr('width', v2_width + margin.left + margin.right)
      //.attr('height', v2_height + margin.top + margin.bottom)
      .attr("viewBox", [0, 0, v2_width + margin.left + margin.right, v2_height + margin.top + margin.bottom])
      .attr("font-family", "sans-serif")
      .attr("font-size", "8");

  var svg = svgDOM.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); 

  // Creating Rectangle
  /*
  svg.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", v2_width)
  .attr("height", v2_height)
  .attr("fill", "white")
  */

  var row = svg.selectAll('g.row')
    .data(matrixEmail)
    .enter().append('g')
    .attr('class', 'row')
    .attr('transform', function (d, i) { 
      return 'translate(0,' + x(i) + ')'; 
    })
    .each(makeRow);

  row.append('text')
    .attr('class', 'label')
    .attr('x', -4)
    .attr('y', x.bandwidth() / 2)
    .attr('dy', '0.32em')
    .attr('fill', 'white')
    .text(function (d, i) { 
      //console.log(d);
      return mapEmail.get(arrEmailKeys[i]).email; 
    })
    .call(text => text.append("title")
      .text((d,i) => "job  : " + mapEmail.get(arrEmailKeys[i]).jobTitle + "\n" +
        "mail : " + mapEmail.get(arrEmailKeys[i]).email + "\n" +
        "outgoing : " + mapEmail.get(arrEmailKeys[i]).cntOut + "\n" +
        "incoming : " + mapEmail.get(arrEmailKeys[i]).cntIn + "\n"

      ));

  var column = svg.selectAll('g.column')
    .data(mapEmail)
    .enter().append('g')
    .attr('class', 'column')
    .attr('transform', function(d, i) { return 'translate(' + x(i) + ', 0)rotate(-90)'; })
  .append('text')
    .attr('class', 'label')
    .attr('x', 4)
    .attr('y', x.bandwidth() / 2)
    .attr('dy', '0.32em')
    .attr('fill', 'white')
    .text(function (d, i) { 
      return d[1].email; 
    
    })
    .call(text => text.append("title")
      .text((d,i) => "job  : " + mapEmail.get(arrEmailKeys[i]).jobTitle + "\n" +
        "mail : " + mapEmail.get(arrEmailKeys[i]).email + "\n" +
        "outgoing : " + mapEmail.get(arrEmailKeys[i]).cntOut + "\n" +
        "incoming : " + mapEmail.get(arrEmailKeys[i]).cntIn + "\n"

      ));
}

function makeRow(rowData) {
  var cell = d3.select(this).selectAll('rect')
    .data(rowData)
    .enter().append('rect')
    .attr('x', function (d, i) { return x(i); })
    .attr('width', x.bandwidth())
    .attr('height', x.bandwidth())
    .style('fill-opacity', function (d) { return opacity(d.cntOut); })
    .style('fill', function (d) {
        if (selectColor.value == 'sentiment') {
          if (d.cntOut != 0){
            return getSentimentColor(d.sentiment/d.cntOut); 
          } else {
            return 'White';
          }
        } else if (selectColor.value == 'fromJob') {
          return getJobColor(mapEmail.get(d.fromEmail).jobTitle); 
        } else {
          return getJobColor(mapEmail.get(d.toEmail).jobTitle);   
        }
        
      })
    /*
    .on('mouseover', function (d) {
      row.filter(function (_, i) { return d.i === i; })
        .selectAll('text')
        .style('fill', '#d62333')
        .style('font-weight', 'bold');
      column.filter(function (_, j) { return d.j === j; })
        .style('fill', '#d62333')
        .style('font-weight', 'bold');
    })
    .on('mouseout', function () {
      row.selectAll('text')
        .style('fill', null)
        .style('font-weight', null);
      column
        .style('fill', null)
        .style('font-weight', null);
    })*/
  ;
  

  cell.append('title')
    .text ((d,i) => { 
      var avgS = 0;
      if (d.cntOut != 0){
        avgS = d.sentiment/d.cntOut; 
      };
      return "from mail : " + d.fromEmail + "\n" + 
            "from job : " + mapEmail.get(d.fromEmail).jobTitle + "\n" +
            "to mail : " + d.toEmail + "\n" +
            "to job : " + mapEmail.get(d.toEmail).jobTitle + "\n" +
            "count : " + d.cntOut + "\n" + 
            "avg sentiment : " + avgS + "\n"
    }
  );
  
}

// Transform Data
function generateMap(data, filterDateBy = "All", dateFilter) {

  var filterDateFn;
  switch (filterDateBy) {
    case "All":
      filterDateFn = date => true;
      break;
    case "Year":
      filterDateFn = date => (date.getFullYear() == dateFilter.getFullYear());
      break;
    case "Month":
      filterDateFn = date => (date.getFullYear() == (dateFilter.getFullYear()) && (date.getMonth() + 1) == (dateFilter.getMonth() + 1));
      break;
    case "Day":
      filterDateFn = date => (date.getFullYear() == (dateFilter.getFullYear()) && (date.getMonth() + 1) == (dateFilter.getMonth() + 1) && date.getDate() == dateFilter.getDate());
      break;

  }

    // Transforms array of objects data (maildata) into map
  var map = new Map;
  data.forEach(function find(dataEl) {

    // Add from            
    if (!map.has(dataEl.fromEmail)) {
      map.set(dataEl.fromEmail, {
        "email": dataEl.fromEmail,
        "index": 0,
        "jobTitle": dataEl.fromJobtitle,
        "cntOut": 0,
        "cntIn": 0,
        "linkIn": new Array(),
        "linkOut": new Array(),
        "mailOut": new Array()
      })
    }

    var q = map.get(dataEl.fromEmail);
    if (filterDateFn(dataEl.date)) {
      q.cntOut += 1;
      q.mailOut.push(dataEl); 
    }

    // Add to
    if (!map.has(dataEl.toEmail)) {
      map.set(dataEl.toEmail, {
        "email": dataEl.toEmail,
        "index": 0,
        "jobTitle": dataEl.toJobtitle,
        "cntOut": 0,
        "cntIn": 0,
        "linkIn": new Array(),
        "linkOut": new Array(),
        "mailOut": new Array()
      })
    }

    q = map.get(dataEl.toEmail);
    if (filterDateFn(dataEl.date)) {
      q.cntIn += 1;
    }
  });

  return map;
}

function reorderKeys(map){
  var arrKeys = Array.from(map.keys());
  for (var i=0; i<arrKeys.length; i++){
    map.get(arrKeys[i]).index = i;
  }
  return arrKeys;
}

function generateMatrix(map, arrKeys){
  var matrix = new Array(map.size);
  for(var i = 0; i<arrKeys.length; i++){
    matrix[i] = new Array(map.size);
    for (var j = 0; j<arrKeys.length; j++){
      var el = {
        "fromEmail" : arrKeys[i],
        "toEmail" : arrKeys[j],
        "cntOut": 0,
        "sentiment": 0
      };
      matrix[i][j] = el;
    }
    var el = map.get(arrKeys[i]);        
    // DOES NOT WORK :(
    for (var k = 0; k<el.mailOut.length; k++){
      var elM = matrix[i][map.get(el.mailOut[k].toEmail).index];
      elM.cntOut += 1;
      elM.sentiment += el.mailOut[k].sentiment;
    }        
  }

  return matrix;
}

function getSentimentColor(sent){         
  
  if (-1 <= sent && sent < -0.05){
    return 'BlueViolet';
  } else if (-0.05 <= sent && sent < -0.02){
    return 'DodgerBlue';
  } else if (-0.02 <= sent && sent < -0.005){
    return 'MediumSpringGreen';
  } else if (-0.005 <= sent && sent < 0.005){
    return 'White';
  } else if (0.005 <= sent && sent < 0.02){
    return 'Gold';
  } else if (0.02 <= sent && sent < 0.05){
    return 'OrangeRed';
  } else{
    return 'DarkRed';
  }

} 

function getJobColor(job){         
  
  switch(job){
    case 'CEO':
      return 'Gold'
      break;
    case 'Director':
      return 'OrangeRed'
      break;
    case 'Employee':
      return 'DodgerBlue'
      break;
    case 'In House Lawyer':
      return 'BlueViolet'
      break;
    case 'Manager':
      return 'MediumSpringGreen'
      break;
    case 'Managing Director':
      return 'MediumVioletRed'
      break;
    case 'President':
      return 'DarkRed'
      break;
    case 'Trader':
      return 'GreenYellow'
      break;
    case 'Unknown':
      return 'Aqua'
      break;
    case 'Vice President':
      return 'IndianRed'
      break;
    default:
      return 'White'  
  }
} 

//LEGEND Function
function mLegend(keys, colors, size){
  // select the svg area
  var legendSVG = d3.select("#legend")
  legendSVG.selectAll("rect").remove();
  legendSVG.selectAll("text").remove();
  
  legendSVG.attr("viewBox", [0, 0, v2_width, 2 * size]);
  // Usually you have a color scale in your chart already
  
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(colors);  
  
  // Add one dot in the legend for each name.
  legendSVG.selectAll("mydots")
    .data(keys)
    .enter()
    .append("rect")
      .attr("y", 0)
      .attr("x", function(d,i){ return 20 + i*(size+130)}) // 20 is where the first dot appears. 25 is the distance between dots
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d){ return color(d)})

  // Add one dot in the legend for each name.
  legendSVG.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
      .attr("y", 0 + size*0.65)
      .attr("x", function(d,i){ return 30 + i*(size+130) + (size/2)}) // 30 is where the first dot appears. 25 is the distance between dots
      .style("fill", "white")
      .attr("font-family", "sans-serif")
      .attr("font-size", "smaller")
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
}

function showLegend(){ 
  if (selectColor.value == 'sentiment') {
    mLegend(legend_keys1, legend_colors1, legend_size);
  } else{
    mLegend(legend_keys2, legend_colors2, legend_size);
  }
}
  