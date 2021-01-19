d3.select("body").append("p").text("New paragraph!");

function x(d) { return d["dmgtaken"]; }
function y(d) { return d["dmgdealt"]; }
function radius(d) { return d.games; }
function color(d) { return d.color; }
function key(d) { return d.champion; }
function season(d) { return d.season; }
function patchnum(d) { return d.patchnum; }
// Dimensions for plot

			
// Chart dimensions.
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
	width = 960 - margin.right,
	height = 500 - margin.top - margin.bottom;

// Various scales. These domains make assumptions of data, naturally.
var xScale = d3.scaleLinear().domain([0, 6000]).range([0, width]),
	yScale = d3.scaleLinear().domain([0, 1200]).range([height, 0]),
	rScale = d3.scaleLinear().domain([0, 560000]).range([5, 50])

// The x & y axes.
var xAxis = d3.axisBottom(xScale).ticks(12, d3.format(",d")),
	yAxis = d3.axisLeft(yScale);

// Create the SVG container and set the origin.
var svg = d3.select("#chart").append("svg")
	.attr("width", width + margin.left + margin.right + 20)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	

// Add the x-axis.
svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

// Add the y-axis.
svg.append("g")
	.attr("class", "y axis")
	.call(yAxis);

// Add an x-axis label.
svg.append("text")
	.attr("class", "x label")
	.attr("text-anchor", "end")
	.attr("x", width)
	.attr("y", height - 6)
	.text("Damage taken per minute");

// Add a y-axis label.
svg.append("text")
	.attr("class", "y label")
	.attr("text-anchor", "end")
	.attr("y", 6)
	.attr("dy", ".75em")
	.attr("transform", "rotate(-90)")
	.text("Damage dealt per minute");

// Add the year label; the value is set on transition.
var label = svg.append("text")
	.attr("class", "patch label")
	.attr("text-anchor", "end")
	.attr("y", height - 24)
	.attr("x", width)
	.style("font-size", "40px")
	.text(8.1);

var actdata = function(d) {
	return {
		dmgtaken: +d["dmgtaken/min"],
		dmgdealt: +d["dmgdealt/min"],
		games: +d.games,
		color: d.Class,
		champion: d.champion,
		patch: +d.patch,
		season: +d.season,
		patchnum: +d.patchnum,
		internal: +d.internal
	};
};
	
var dataset = d3.json("formdata.json").then(function(dotdata) {
	
	
	//var bisect = d3.bisector(function(d) { return d[0]; });

	console.log(dotdata);
	
	var dots = svg.append("g")
		.attr("class", "dots")
		.selectAll("dots")
		.data(interpolateData(1))
		.enter().append("circle")
		.attr("class", "dots")
		.style("fill", function(d) { return color(d) })
		.style("stroke", "black")
		.call(position);
		//.sort(order);
	dots.append("title")
      .text(function(d) { return d.name; });
	
	dots.transition()
      .duration(10000)
	  .ease(d3.easeLinear)
      .tween("internal", tweenPatch);

	function position(dot) {
		dot.attr("cx", function(d) { return xScale(x(d)); })
			.attr("cy", function(d) { return yScale(y(d)); })
			.attr("r", function(d) { return rScale(radius(d)); });
    }
	
	function order(a, b) {
		return radius(b) - radius(a);
    }
	//i hate d3
	
	function interpolateData(condition) {
		var rounded = Math.floor(condition);
		
		return dotdata.map(function(d) {
			
			return {
				name: d.champion,
				color: d.color,
				["dmgdealt"]: interpolateValues(d["dmgdealt"], rounded),
				["dmgtaken"]: interpolateValues(d["dmgtaken"], rounded),
				games: interpolateValues(d.games, rounded),
				patchnum: d.patchnum,
				season: d.season,
				internal: d.internal
			};
		});
	}
	
	function tweenPatch() {
		var patch = d3.interpolateNumber(1, 26);
		return function(t) { displayPatch(patch(t)); };
    }
	function displayPatch(patch) {
		dots.data(interpolateData(patch)).call(position)//.sort(order);
		label.text(Math.floor(patch));
    }
	
	function interpolateValues(values, number) {
		var new_data = values.filter(function(d) {return d.internal == number;});
		
		var obj = new_data[0];
		var num = obj[Object.keys(obj)[4]];
		
		return num;
		
		/*
		console.log(values.length - 1);
		var i = bisect.left(values, number, 0, values.length - 1),
			a = values[i];
		console.log(i);
		console.log(a);
		if (i > 0) {
			var b = values[i - 1],
				t = (number - a[0]) / (b[0] - a[0]);
			console.log(a[1] * (1 - t) + b[1] * t);
			return a[1] * (1 - t) + b[1] * t;
		}
		console.log(a[1]);
		return a[1];*/
	}
    
});