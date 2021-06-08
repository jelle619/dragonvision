// VISUALISATION 1
// This JavaScript file contains the code for the first visualisation, the adjecency matrix. All changes made here will be reflexed on the visualisation1.html page.

document.getElementById('input').addEventListener('change', function selectedFileChanged() { // when the state of the HTML input changes (a file gets selected), this function will trigger
    if (this.files.length === 0) { // This statement will be true when the user cancels out of the upload dialog.
        console.log('No file selected.'); // Log to the console that the user has selected no file.
        return; // Exit the function, no need to do anything
    }

    // create the file object

    var file = this.files[0]; // this variable will contain the file object, with this.files[0] = document.getElementById('input').files[0]

    // printing CSV to the console

    const reader = new FileReader();
    reader.onload = function fileReadCompleted() { // when the reader is done, the content is in reader.result.
        console.log("CSV input:", reader); // print the CSV input in the console
    };
    reader.readAsText(file); // we will tell reader to interpret the file as text, so reader.result will be text also

    // parsing the CSV into JSON using Papa Parse

    var config = { // we will define the config that Papa Parse is going to use
        delimiter: "", // auto-detect
        newline: "", // auto-detect
        quoteChar: '"',
        escapeChar: '"',
        header: true,
        transformHeader: undefined,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: false,
        comments: false,
        step: undefined,
        complete: undefined,
        error: undefined,
        download: false,
        downloadRequestHeaders: undefined,
        downloadRequestBody: undefined,
        skipEmptyLines: false,
        chunk: undefined,
        chunkSize: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
        withCredentials: undefined,
        transform: undefined,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    };

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => visual(results)
    });

    function visual(results) {
        // print the JSON result to the console
        console.log("JSON output:", results);

        // clear the previous visual, if any
        document.getElementById("rect").innerHTML = ""; // clear the legend
        document.getElementById("visual").innerHTML = ""; // clear the visual

        // Making the legend
        svg = d3.select('#rect') //legend
            .append('svg')
        var g = svg.selectAll("rect")
            .data([10])
            .enter()
            .append("g")
            .classed('rect', true)

        g.append("rect") //The purple rect
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", 20)
            .attr("y", 20)
            .attr("fill", "#f8f")
            .attr('stroke', 'black') //The black border of the rect

        g.append("rect") //The blue rect
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", 20)
            .attr("y", 70)
            .attr("fill", "blue")
            .attr('stroke', 'black')

        g.append("rect") //The red rect
            .attr('width', 20)
            .attr('height', 20)
            .attr('x', 20)
            .attr('y', 120)
            .attr('fill', 'red')
            .attr('stroke', 'black')

        g.append('text') //Text for first leg
            .attr('x', 50)
            .attr('y', 35)
            .text("Incoming/outgoing")
            .attr('fill', 'white')


        g.append('text') //Text for second leg
            .attr('x', 50)
            .attr('y', 85)
            .text('Incoming')
            .attr('fill', 'white')

        g.append('text') //Text for third leg
            .attr('x', 50)
            .attr('y', 135)
            .text('Outgoing')
            .attr('fill', 'white')

        // =====================================================
        // Class and functions used to draw change-color paths between nodes.
        // Source from https://observablehq.com/@d3/hierarchical-edge-bundling/2
        function dot([ka, kb, kc, kd], {
            a,
            b,
            c,
            d
        }) {
            return [
                ka * a[0] + kb * b[0] + kc * c[0] + kd * d[0],
                ka * a[1] + kb * b[1] + kc * c[1] + kd * d[1]
            ];
        }

        class Line {
            constructor(a, b) {
                this.a = a;
                this.b = b;
            }
            split() {
                const {
                    a,
                    b
                } = this;
                const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
                return [new Line(a, m), new Line(m, b)];
            }
            toString() {
                return `M${this.a}L${this.b}`;
            }
        };

        const l1 = [4 / 8, 4 / 8, 0 / 8, 0 / 8];
        const l2 = [2 / 8, 4 / 8, 2 / 8, 0 / 8];
        const l3 = [1 / 8, 3 / 8, 3 / 8, 1 / 8];
        const r1 = [0 / 8, 2 / 8, 4 / 8, 2 / 8];
        const r2 = [0 / 8, 0 / 8, 4 / 8, 4 / 8];

        class BezierCurve {
            constructor(a, b, c, d) {
                this.a = a;
                this.b = b;
                this.c = c;
                this.d = d;
            }
            split() {
                const m = dot(l3, this);
                return [
                    new BezierCurve(this.a, dot(l1, this), dot(l2, this), m),
                    new BezierCurve(m, dot(r1, this), dot(r2, this), this.d)
                ];
            }
            toString() {
                return `M${this.a}C${this.b},${this.c},${this.d}`;
            }
        };

        class Path {
            constructor(_) {
                this._ = _;
                this._m = undefined;
            }
            moveTo(x, y) {
                this._ = [];
                this._m = [x, y];
            }
            lineTo(x, y) {
                this._.push(new Line(this._m, this._m = [x, y]));
            }
            bezierCurveTo(ax, ay, bx, by, x, y) {

                this._.push(new BezierCurve(this._m, [ax, ay], [bx, by], this._m = [x, y]));
            }
            * split(k = 0) {
                const n = this._.length;
                const i = Math.floor(n / 2);
                const j = Math.ceil(n / 2);
                const a = new Path(this._.slice(0, i));
                const b = new Path(this._.slice(j));
                if (i !== j) {
                    const [ab, ba] = this._[i].split();
                    a._.push(ab);
                    b._.unshift(ba);
                }
                if (k > 1) {
                    yield* a.split(k - 1);
                    yield* b.split(k - 1);
                } else {
                    yield a;
                    yield b;
                }
            }

            toString() {
                return this._.join("");
            }
        };

        function path([source, target]) {
            var p = new Path;
            line.context(p)(source.path(target));
            return p;
        };

        // =====================================================

        // Initialize test data

        /*          
                  var maildata = [{
                      "date": new Date('2000-08-13'),
                      "fromId": 96,
                      "fromEmail": "matthew.lenhart@enron.com",
                      "fromJobtitle": "Employee",
                      "toId": 77,
                      "toEmail": "eric.bass@enron.com",
                      "toJobtitle": "Trader",
                      "messageType": "CC",
                      "sentiment": 0.01369863
                    },
                    {
                      "date": new Date('2001-11-22'),
                      "fromId": 64,
                      "fromEmail": "danny.mccarty@enron.com",
                      "fromJobtitle": "Vice President",
                      "toId": 121,
                      "toEmail": "rod.hayslett@enron.com",
                      "toJobtitle": "Vice President",
                      "messageType": "TO",
                      "sentiment": 0
                    },
                    {
                      "date": new Date('2000-08-12'),
                      "fromId": 64,
                      "fromEmail": "danny.mccarty@enron.com",
                      "fromJobtitle": "Vice President",
                      "toId": 121,
                      "toEmail": "rod.hayslett@enron.com",
                      "toJobtitle": "Vice President",
                      "messageType": "TO",
                      "sentiment": 0
                    }
                  ];
                  
                  var empCnt = 150;
                  for (var i = 0; i < empCnt; i++) {
                    var jobFrom = "Employee";
                    var jobTo = "Employee";
                    var res = i % 3;
                    if (res == 0) {
                      jobFrom = "Trader"
                    } else if (res == 1) {
                      jobFrom = "Manager"
                    }
        
                    res = (empCnt - i - 1) % 3;
                    if (res == 0) {
                      jobTo = "Trader"
                    } else if (res == 1) {
                      jobTo = "Manager"
                    }
        
                    var m = {
                      "date": new Date('2000-08-1' + i % 3),
                      "fromId": i,
                      "fromEmail": "mail" + i + "@enron.com",
                      "fromJobtitle": jobFrom,
                      "toId": i + 10,
                      "toEmail": "mail" + (empCnt - i - 1) + "@enron.com",
                      "toJobtitle": jobTo,
                      "messageType": "CC",
                      "sentiment": 0
                    }
                    maildata.push(m)
        
                    m = {
                      "date": new Date('2000-08-1' + i % 3),
                      "fromId": 64,
                      "fromEmail": "danny.mccarty@enron.com",
                      "fromJobtitle": "Vice President",
                      "toId": i,
                      "toEmail": "mail" + i + "@enron.com",
                      "toJobtitle": jobFrom,
                      "messageType": "CC",
                      "sentiment": 0
                    }
                    maildata.push(m)
                  }
        
                  //  Debug
                  for (var i = 0; i < maildata.length; i++) {
                    console.log("maildata[" + i + "]=" + maildata[i].fromJobtitle + ", " + maildata[i].fromEmail + ", " + maildata[i].toJobtitle + ", " + maildata[i].toEmail)
                  }
        */

        // Initializing the real data          
        var maildata = results.data;
        // Convert .date from string to Date
        for (var i = 0; i < maildata.length; i++) {
            maildata[i].date = new Date(maildata[i].date);
        }

        console.log(maildata);  // Debug

        // Dimenstions
        const width = 954;
        const radius = width / 2;
        const colorin = "#00f";
        const colorout = "#f00";
        const colornone = "#ccc";
        const colorinout = "#f8f";
        const k_csc = 6; // 2^k_csc colors segments per curve. We are using 2^6 = 64 color segments.

        // Svg
        var svg = d3.select("#visual")
            .append("svg")
            .attr("viewBox", [-width / 2, -width / 2, width, width]);
        // Define line to draw link between nodes
        var line = d3.lineRadial()
            .curve(d3.curveBundle) // .beta(0.85))
            .radius(d => d.y)
            .angle(d => d.x);

        // Group for nodes
        const groupNode = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", "6")
            .attr("font-weight", "normal")
            .attr("fill", "white")

        // Group for paths (edges)
        var groupPath = svg.append("g")
            .attr("fill", "none");

        // Group for ingoing paths of the selected nodes
        var groupIn = svg.append("g")
            .attr("stroke", colorin)
            .attr("fill", "none");

        // Group for outgoing paths of the selected nodes
        var groupOut = svg.append("g")
            .attr("stroke", colorout)
            .attr("fill", "none");

        var link;
        var mapSliderVal;
        var arrSliderVal;
        var slider = document.getElementById("myRange");
        var output = document.getElementById("demo");

        slider.oninput = function () {

            output.innerHTML = arrSliderVal[slider.value];
            visualisation1(d3.select('input[name="rb"]:checked').node().value, mapSliderVal.get(arrSliderVal[slider.value]));
        }

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
        console.log(d3.selectAll('input[name="rb"]')); // Debug
        d3.selectAll('input[name="rb"]')

            .on("input", function () {

                console.log("On Input" + d3.select('input[name="rb"]:checked').node().value); // Debug
                var filterDateBy = d3.select('input[name="rb"]:checked').node().value;
                sliderInit(filterDateBy);
                console.log("BEFORE VIS 2", mapSliderVal.get(arrSliderVal[slider.value])); // Debug
                visualisation1(filterDateBy, mapSliderVal.get(arrSliderVal[slider.value]));
            });

        console.log(d3.selectAll("rb"));
        sliderInit(d3.select('input[name="rb"]:checked').node().value);
        console.log("BEFORE VIS 1", mapSliderVal.get(arrSliderVal[slider.value]))
        visualisation1(d3.select('input[name="rb"]:checked').node().value, mapSliderVal.get(arrSliderVal[slider.value]));

        // Slider initialization
        function sliderInit(filterDateBy) {
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

            console.log("mapSliderVal = ", mapSliderVal); // Debug
            arrSliderVal = Array.from(mapSliderVal.keys());
            arrSliderVal.sort();
            console.log("arrSliderVal = ", arrSliderVal); // Debug

            console.log(d3.select("input[id=myRange]").node()); //Debug

            d3.select("#myRange")
                .attr("max", arrSliderVal.length - 1)
                .attr("value", 0);

            output.innerHTML = arrSliderVal[slider.value];
        }



        // Visualisation
        function visualisation1(filterDateBy = "All", dateFilter) {
            console.log("visualisation1", filterDateBy, dateFilter);

            // Transform data into hierarchy
            //  Test rollup data
            // var rollupData = d3.rollup(maildata, v => v.length, d => d.fromJobtitle, d => d.fromEmail);
            // console.log(rollupData.size, rollupData);

            //  Test group data
            //var groupFrom =  d3.group(maildata, d => d.fromJobtitle, d => d.fromEmail);
            //console.log(groupFrom.size, groupFrom);
            // var groupTo =  d3.group(maildata, d => d.toJobtitle, d => d.toEmail);
            // console.log(groupTo.size, groupTo);

            // var groupAll = new Map([...groupFrom, ...groupTo]);
            // console.log(groupAll.size, groupAll, groupAll.has("Trader"), groupAll.has("danny.mccarty@enron.com"));

            //  use custom function generateMap
            var groupAll = generateMap(maildata, filterDateBy, dateFilter);
            console.log(groupAll.size, groupAll); // Debug

            var hierarchyData = d3.hierarchy(groupAll)
                .sort((a, b) => d3.ascending(a.data[0], b.data[0]));
            console.log(hierarchyData); // Debug

            var bl = bilink(hierarchyData);

            var root = d3.cluster()
                .size([2 * Math.PI, radius - 100])(hierarchyData);
            console.log(root); // Debug

            // Delete old visualisation
            groupNode.selectAll("g").remove();
            groupPath.selectAll().remove();
            groupIn.selectAll().remove();
            groupOut.selectAll().remove();

            // Draw nodes (representing email addresses) in a circle (use the cluster layout for the leaves)
            node = groupNode.selectAll("g")
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
                if (filterDateFn(dataEl.date)) {
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
                if (filterDateFn(dataEl.date)) {
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
    }

});