// FUCK D3 LMFAO


document.body.innerHTML = "";

data = // cute subset of actual data; probably just hold all data tbh
[
  { time: "TTh 9:30am-10:45am",
    code: "CSCI 3434" },

  { time: "MW 3pm-4:15pm",
    code: "CSCI 4273" }
];





// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 30, bottom: 30, left: 80},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Parse the date / time
// var parseDate = d3.time.format("%d-%b-%y").parse;

//// d3.time.format( "%-H:%M%p" ).parse( "9:30am" ) // parses that kinda time into a date string thing

//// store list of days as [ 0, 2, 4 ] for MWF via MWF => 024 => [ 0, 2, 4 ]; everything MTWThF i think so simple replaces

// Set the ranges
var parseTime = d3.time.format( "%-H:%M%p" ).parse;
var parseTime2 = d3.time.format( "%-H%p" ).parse;
var midnight = parseTime( "0:00am" );

var x = d3.time.scale.utc().domain( [ midnight, d3.time.day.offset( midnight, 7 ) ] ).range( [ 0, width ] ); // one week
var y = d3.time.scale.utc().domain( [ midnight, d3.time.day.offset( midnight, 1 ) ] ).range( [ 0, height ] ); // each day // HERE IS THE RANGE TO MAKE MIN TO MAX

// Define the axes
// var xAxis = d3.svg.axis().scale(x)
    // .orient("top").tickFormat(d3.time.format( "%A" )).ticks( 7 );

var yAxis = d3.svg.axis().scale(y)
    .orient("left").tickFormat(d3.time.format( "%-I%p" )).ticks( 24 ); // change this to like to the right range i guess
    
// Adds the svg canvas
var svg = d3.select("body")
    .append("svg")
                                                                      .attr("style", "background:lightblue")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");


var daysToOffsets = t => t.split( " " )[0].replace("M",0).replace("T",1).replace("W",2).replace("Th",3).replace("F",4).split( "" );

var rectXpos = d => x( d3.time.day.offset( midnight, parseInt( d ) ) );
var beginTime = n => parseTime( c=data[n].time.split( " " )[1].split( "-" )[0] ) || parseTime2( c ) // of class n
var endTime = n => parseTime( c=data[n].time.split( " " )[1].split( "-" )[1] ) || parseTime2( c ) // of class n


var courseWidth = rectXpos( 1 ) - rectXpos( 0 );


var ds =
  svg.selectAll( "g" )
    .data( data )
  .enter().append( "g" )
    .selectAll( "g" )
      .data( d => daysToOffsets( d.time ) )
    .enter().append( "g" );
  ds
    .append( "rect" )
      .attr( "x", d => rectXpos( d ) )
      .attr( "y", (d, _, n) => y( beginTime( n ) ) )
      .attr( "width", courseWidth )
      .attr( "height", (d, _, n) => y( endTime( n ) ) - y( beginTime( n ) ) )
  ds
    .append( "text" )
      .attr( "x", d => rectXpos( d ) )
      .attr( "y", (d, _, n) => y( beginTime( n ) ) )
      .text( (d, _, n) => data[n].code ) // d gives day offset; n gives index of course in courses taking



// Add the X Axis
svg.append("g")
    .attr("class", "x axis")
    // .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
  .selectAll("text")
  	.style("text-anchor", "right")
  	// .attr("dx", -margin.right)
  // 	.attr("dy", "-.55em")
  // 	.attr("transform", "rotate(-15)");


// Add the Y Axis
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);