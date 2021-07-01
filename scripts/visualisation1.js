// VISUALISATION 1
// This JavaScript file contains the code for the first visualisation, the adjecency matrix. All changes made here will be reflexed on the visualisation1.html page.

// --- Constants ---
 // Dimenstions
const v1_width = 954;
const v1_radius = v1_width / 2;
 // Colors
const colorin = "#00f";
const colorout = "#f00";
const colornone = "#ccc";
const colorinout = "#f8f";
 // Color segments
const k_csc = 6;    // 2^k_csc colors segments per curve. We are using 2^6 = 64 color segments.

//Legend Const
const legend_h_keys1 = ["Incoming/Outgoing", "Incoming", "Outgoing"];
const legend_h_colors1 = ["#f8f", 'blue', 'red'];
const legend_h_size = 10;

// --- Variables ---
 // Svg
var svg;

 // Group for nodes
var groupNode;

 // Group for paths (edges)
var groupPath;

 // Group for ingoing paths of the selected nodes
var groupIn;

 // Group for outgoing paths of the selected nodes
var groupOut;

 // Define line to draw link between nodes
var line = d3.lineRadial()
    .curve(d3.curveBundle) // .beta(0.85))
    .radius(d => d.y)
    .angle(d => d.x);

 // Link between nodes
var link;


// --- Functions ---

// Called when data are loaded
function dataLoaded1(results) {
    // print the JSON result to the console
    console.log("JSON output:", results);  

    initVisual1();

    maildata = initRealData(results); 

    console.log(maildata);  // Debug
        
    // Init radio buttons
    radioButtonInit(refreshVisual1);
    // Init date slider
    sliderInit(d3.select('input[name="rb"]:checked').node().value, refreshVisual1);
    // Init filter From Job
    filterFromJobInit();
    console.log("BEFORE VIS 1", mapSliderVal.get(arrSliderVal[slider.value]), filterFromJob.value)       // Debug
    refreshVisual1(d3.select('input[name="rb"]:checked').node().value);
}

// Filter FromJob initialisation
function filterFromJobInit() {

    var mapFromJob = d3.rollup(maildata, v => 1 , d => d.fromJobtitle);

    console.log("Keys", mapFromJob.keys());   // Debug
    var arrJob = Array.from(mapFromJob.keys());
    arrJob.push("All");
    arrJob.sort();  
    
    var sel =  d3.select("#filterFromJob");            
    sel.selectAll("option")
        .data(arrJob).enter()
        .append('option')
            .text(function (d) { return d; });

    filterFromJob.onchange = function () {                
        refreshVisual1(d3.select('input[name="rb"]:checked').node().value);
    }
}

// Init Visual 1
function initVisual1() {
    // clear the previous visual, if any
    document.getElementById("legend_h" ).innerHTML = ""; // clear the legend
    document.getElementById("visual1").innerHTML = ""; // clear the visual

/*
    // Making the legend    
    var svgL = d3.select('#rect') //legend
        .append('svg')
        .attr('width', 500)
        .attr('height', 40)

    var g = svgL.selectAll("rect")
        .data([10])
        .enter()
        .append("g")
        .classed('rect', true);

    g.append("rect") //The purple rect
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 20)
        .attr("y", 20)
        .attr("fill", "#f8f")
        .attr('stroke', 'black'); //The black border of the rect

    g.append("rect") //The blue rect
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 200)
        .attr("y", 20)
        .attr("fill", "blue")
        .attr('stroke', 'black');

    g.append("rect") //The red rect
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', 320)
        .attr('y', 20)
        .attr('fill', 'red')
        .attr('stroke', 'black');

    g.append('text') //Text for first leg
        .attr('x', 50)
        .attr('y', 35)
        .text("Incoming/outgoing")
        .attr('fill', 'white');


    g.append('text') //Text for second leg
        .attr('x', 230)
        .attr('y', 35)
        .text('Incoming')
        .attr('fill', 'white');

    g.append('text') //Text for third leg
        .attr('x', 350)
        .attr('y', 35)
        .text('Outgoing')
        .attr('fill', 'white');
*/
showHLegend();

    // Svg
    svg = d3.select("#visual1")
        .append("svg")
        .attr("viewBox", [-v1_width / 2, -v1_width / 2, v1_width, v1_width]);

    // Group for nodes
    groupNode = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", "6")
        .attr("font-weight", "normal")
        .attr("fill", "white");

    // Group for paths (edges)
    groupPath = svg.append("g")
        .attr("fill", "none");

    // Group for ingoing paths of the selected nodes
    groupIn = svg.append("g")
        .attr("stroke", colorin)
        .attr("fill", "none");

    // Group for outgoing paths of the selected nodes
    groupOut = svg.append("g")
        .attr("stroke", colorout)
        .attr("fill", "none"); 
}

// Refresh Visual 1
function refreshVisual1(filterDateBy = "All") {
    // console.log("BEFORE VIS 1", filterFromJob.value); // Debug
    visualisation1(filterDateBy, mapSliderVal.get(arrSliderVal[slider.value]), filterFromJob.value);
}

// Visualisation 1
function visualisation1(filterDateBy, dateFilter, fromJobFilter = "All") {
    console.log("visualisation1", filterDateBy, dateFilter, fromJobFilter);

    // Transform data into hierarchy

    //  use custom function generateMap1
    var mapEmail = generateMap1(maildata, filterDateBy, dateFilter, fromJobFilter);
    console.log("Group All:", mapEmail.size, mapEmail); // Debug            

    var hierarchyData = d3.hierarchy(mapEmail)
        .sort((a, b) => d3.ascending(a.data[0], b.data[0]));
    console.log(hierarchyData); // Debug

    var bl = bilink(hierarchyData);

    var root = d3.cluster()
        .size([2 * Math.PI, v1_radius - 100])(hierarchyData);
    console.log(root); // Debug        


    // Delete old visualisation
    groupNode.selectAll("g").remove();
    groupPath.selectAll().remove();
    groupIn.selectAll().remove();
    groupOut.selectAll().remove();


    // Draw nodes (representing email addresses) in a circle (use the cluster layout for the leaves)
    var node = groupNode.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => d.data[0])

        .each(function (d) {

            d.htmlText = this;
        })
        .on("mouseover", overed)
        .on("mouseout", outed)
        .call(text => text.append("title")
            .text(d => "job  : " + d.parent.data[0] + "\n" +
                "mail : " + d.data[0] + "\n" +
                "outgoing : " + d.data[1].cntOut + "\n" +
                "incoming : " + d.data[1].cntIn + "\n"

            )
        );

    // Draw the links between nodes (representing the e-mails)

    //    == Gray vertsion ==
    // link = groupPath.attr("stroke", colornone)
    // .selectAll("path")
    // .data(root.leaves().flatMap(leaf => leaf.data[1].linkOut))
    // .join("path")
    //   .style("mix-blend-mode", "multiply")
    //   .attr("d", ([i, o]) => line(i.path(o)))
    //   .each(function(d) { d.htmlPath = this; });

    //   == Color vertsion ==
    var color = t => d3.interpolateRdBu(1 - t)

    link = groupPath.selectAll("path")
        .data(d3.transpose(root.leaves()
            .flatMap(leaf => leaf.data[1].linkOut.map(path))
            .map(path => Array.from(path.split(k_csc)))))
        .join("path")
        .style("mix-blend-mode", "overlay") // hue, color, overlay, normal
        .attr("stroke", (d, i) => color(d3.easeQuad(i / ((1 << k_csc) - 1))))
        .attr("d", d => d.join(""))

        .each(function (d) {

            d.htmlPath = this;
        });
}

function path([source, target]) {
    var p = new Path;
    line.context(p)(source.path(target));
    return p;
};

function overed(event, d) {
    //link.style("mix-blend-mode", "darken");
    d3.select(this).attr("font-weight", "bold");

    d3.selectAll(d.data[1].linkIn.map(d => d[0].htmlText)).attr("fill", colorin).attr("font-weight", "bold");
    d3.selectAll(d.data[1].linkOut.map(d => d[1].htmlText))
        .attr("fill",

            function (d) {
                return d3.select(this).attr("fill") == colorin ? colorinout : colorout;
            }
        )
        .attr("font-weight", "bold");

    var line = d3.lineRadial()
        .curve(d3.curveBundle) // .beta(0.85))
        .radius(d => d.y)
        .angle(d => d.x);

    groupIn.selectAll("path")
        .data(d.data[1].linkIn)
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", ([i, o]) => line(i.path(o)))

        .each(function (d) {

            d.htmlPath = this;
        });

    groupOut.selectAll("path")
        .data(d.data[1].linkOut)
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", ([i, o]) => line(i.path(o)))

        .each(function (d) {

            d.htmlPath = this;
        });
}

function outed(event, d) {
    link.style("mix-blend-mode", "overlay");
    d3.select(this).attr("font-weight", null);

    d3.selectAll(d.data[1].linkIn.map(d => d[0].htmlText)).attr("fill", null).attr("font-weight", null);
    d3.selectAll(d.data[1].linkOut.map(d => d[1].htmlText)).attr("fill", null).attr("font-weight", null);

    d3.selectAll(d.data[1].linkIn.map(d => d.htmlPath)).remove();
    d3.selectAll(d.data[1].linkOut.map(d => d.htmlPath)).remove();
}


function generateMap1(data, filterDateBy = "All", dateFilter, fromJobFilter = "All") {

    // Filter by Periode & Date
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

    // Filter by FromJobTitle
    var filterFromJobFn;
    if (fromJobFilter == "All") {
        filterFromJobFn = s => true;
    } else {
        filterFromJobFn = s => (s == fromJobFilter);
    }


    // Transforms array of objects data (maildata) into map
    var map = new Map;
    data.forEach(function find(dataEl) {
        // Add from
        if (!map.has(dataEl.fromJobtitle)) {
            map.set(dataEl.fromJobtitle, new Map());
        }

        var p = map.get(dataEl.fromJobtitle);
        if (!p.has(dataEl.fromEmail)) {
            p.set(dataEl.fromEmail, {
                "email": dataEl.fromEmail,
                "cntOut": 0,
                "cntIn": 0,
                "linkIn": new Array(),
                "linkOut": new Array(),
                "mailOut": new Array()
            })
        }

        var q = p.get(dataEl.fromEmail);
        if (filterDateFn(dataEl.date) && filterFromJobFn(dataEl.fromJobtitle)) {
            q.cntOut += 1;

            if (dataEl.fromEmail != dataEl.toEmail) {
                q.mailOut.push(dataEl);

            }
        }

        // Add to
        if (!map.has(dataEl.toJobtitle)) {
            map.set(dataEl.toJobtitle, new Map());
        }

        p = map.get(dataEl.toJobtitle);
        if (!p.has(dataEl.toEmail)) {
            p.set(dataEl.toEmail, {

                "email": dataEl.toEmail,

                "cntOut": 0,
                "cntIn": 0,
                "linkIn": new Array(),
                "linkOut": new Array(),
                "mailOut": new Array()
            })
        }

        q = p.get(dataEl.toEmail);
        if (filterDateFn(dataEl.date) && filterFromJobFn(dataEl.fromJobtitle)) {
            q.cntIn += 1;
        }
    });
    return map;
}

function bilink(root) {
    // Fills the outgoing and incoming mails (links) for each node
    const map = new Map(root.leaves().map(d => [d.data[0], d]));
    // console.log("bilink: ");   // Debug
    // console.log(map);       // Debug
    // console.log("bilink begin for: ");    // Debug
    for (const d of root.leaves()) {

        // group by toEmail (to reduce the drawn edges if there is several mails between nodes)
        var mapMailOut = d3.rollup(d.data[1].mailOut, v => v.length, d => d.toEmail)
        var aMailOut = Array.from(mapMailOut.keys());

        // generate the links out
        d.data[1].linkOut = aMailOut.map(i => [d, map.get(i)]);
        // console.log(d.data[1].linkOut);   // Debug
    }

    // generates the links in

    for (const d of root.leaves()) {
        for (const o of d.data[1].linkOut) {
            // console.log(o);     // Debug
            o[1].data[1].linkIn.push(o);
        }
    }
    return root;
}
//LEGEND Function
function hLegend(keys, colors, size){
    // select the svg area
    var legendSVG = d3.select("#legend_h")    
    legendSVG.selectAll("rect").remove();
    legendSVG.selectAll("text").remove();
    
    legendSVG.attr("viewBox", [0, 0, v1_width, 2 * size]);
  
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
        .attr("x", function(d,i){ return 100 + i*(size+140)}) // 100 is where the first dot appears. 140 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
  
    // Add one dot in the legend for each name.
    legendSVG.selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
        .attr("y", 0 + size*0.65)
        .attr("x", function(d,i){ return 110 + i*(size+140) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", "white")
        .attr("font-family", "sans-serif")
        .attr("font-size", "smaller")
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
  }
  
  function showHLegend(){ 
    hLegend(legend_h_keys1, legend_h_colors1, legend_h_size)
  }