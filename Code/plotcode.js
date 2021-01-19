d3.select("body").append("p").text("New paragraph!");

function x(d) { return d["dmgtaken"]; }
function y(d) { return d["dmgdealt"]; }
function radius(d) { return d.games; }
function color(d) { return d.color; }
function key(d) { return d.name; }
function season(d) { return d.season; }
function patchnum(d) { return d.patchnum; }
// Dimensions for plot
//
			
// Chart dimensions.
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
	width = 960 - margin.right,
	height = 500 - margin.top - margin.bottom;

// Various scales. These domains make assumptions of data, naturally.
var xScale = d3.scaleLinear().domain([0, 6000]).range([0, width]),
	yScale = d3.scaleLinear().domain([0, 1200]).range([height, 0]),
	rScale = d3.scaleLinear().domain([0, 560000]).range([0, 50])

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
	.text("Patch 8.1");

// Trying to add hover label
var hover = svg.append("text")
	.attr("class", "champ label")
	.attr("text-anchor", "end")
	.attr("y", 24)
	.attr("x", width)
	.style("font-size", "40px")
	.text("");

	
var dataset = d3.json("formdata.json").then(function(dotdata) {
	

	console.log(dotdata);
	
	var dots = svg.append("g")
		.attr("class", "dots")
		.selectAll("dots")
		.data(interpolateData(1))
		.enter().append("circle")
		.attr("class", "dots")
		.style("fill", function(d) { return color(d) })
		.style("stroke", "black")
		.call(position)
		.sort(order)
		//.on("mouseover", handleMouseOver)
		//.on("mouseout", handleMouseOut);
		.on("mouseover", function(d) {
			d3.select(this).attr("r", function(d) { return rScale(radius(d)) * 1.2 }).style("fill", function(d) { return "red" });
			hover.text(d.name);
		})                  
		.on("mouseout", function(d) {
			d3.select(this).attr("r", function(d) { return rScale(radius(d)) }).style("fill", function(d) { return color(d) });
			hover.text("")
		});
		
	var title = dots.append("title")
      .text(function(d) { return d.name; });
	
	
	
	dots.transition()
      .duration(30000)
	  .ease(d3.easeLinear)
      .tween("internal", tweenPatch);
	  
	//Must change when accounting for multiple seasons
	var format = function(d) {
		var sea = 8;
		var pat = 1;
		if (d > 24) {
			sea = 9;
			pat = d - 24;
		} else {
			pat = d;
		}
		return (sea + "." + pat);
	}
	//Slider
	var slider = d3
		.sliderBottom()
		.min(1)
		.max(26)
		.width(width)
		.ticks(26)
		.step(1)
		.default(1)
		.tickFormat(format)
		.on('onchange', val => {
			dots.interrupt();
			displayPatch(val);
		});

	var gSimple = d3
		.select('div#slider')
		.append('svg')
		.attr('width', 1000)
		.attr('height', 100)
		.append('g')
		.attr('transform', 'translate(30,30)');

	gSimple.call(slider);
	
	function position(dot) {
		dot.attr("cx", function(d) { return xScale(x(d)); })
			.attr("cy", function(d) { return yScale(y(d)); })
			.attr("r", function(d) { return rScale(radius(d)); });
    }
	//using radius makes them not sort, using games makes them mislabelled
	//i wanna die
	function order(a, b) {
		return d3.descending(a.games, b.games);
    }
	//i hate d3
	
	function interpolateData(condition) {
		var rounded = Math.floor(condition);
		
		return dotdata.map(function(d) {
			
			return {
				name: d.champion,
				color: d.color,
				["dmgdealt"]: interpolateValues(d["dmgdealt"], condition),
				["dmgtaken"]: interpolateValues(d["dmgtaken"], condition),
				games: interpolateValues(d.games, condition),
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
		/*
		dots.data(interpolateData(patch)).call(position).sort(order).style("fill", function(d) { return color(d) });
		*/
		dots.data(interpolateData(patch), key).call(position).sort(order);
		dots.select("title").text(function(d) {  
			return d.name;
		});
		//Change for multiple seasons
		var inter = Math.floor(patch);
		var seas = 8;
		var patc = 1;
		if (inter > 24) {
			seas = 9;
			patc = inter - 24;
		} else {
			patc = inter;
		}
		
		label.text("Patch " + seas + "." + patc);
		//dot.data(interpolateData(patch), key).call(position).sort(order);
		
    }
	
	function interpolateValues(values, number) {
		old = Math.floor(number);
		upd  = Math.ceil(number);
		
		var old_data = values.filter(function(d) {return d.internal == old;});
		var new_data = values.filter(function(d) {return d.internal == upd;});
		
		var oobj = old_data[0];
		var nobj = new_data[0];
		
		var onum = oobj[Object.keys(oobj)[4]];
		var nnum = nobj[Object.keys(nobj)[4]];
		
		var difint = number - old;
		var difdis = 0;
		var newnum = nnum;
		
		if (nnum > onum) {	
			difdis = nnum - onum;
			newnum = ((difint) * difdis) + onum;
		} else if (onum > nnum) {
			difdis = onum - nnum;
			newnum = onum - ((difint) * difdis);
		}
		
		return newnum;
		
	}
    
});