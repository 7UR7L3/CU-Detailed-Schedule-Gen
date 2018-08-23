var userData = typeof userData  !== "undefined" ? userData
	: await sam.login().then( v => sam.fetchRecord() ); // collect user data

var currentDB = typeof currentDB !== "undefined" ? currentDB
	: _lfreq_('fose/client/builtin-panels/search').gatherSearchData().server.other.srcdb;

var schClassNums = typeof schClassNums !== "undefined" ? schClassNums
	: userData.reg[ currentDB ].map( s => s.split( "|" )[1] );

var allCourseInfo = typeof allCourseInfo !== "undefined" ? allCourseInfo
	: await _lfreq_( "fose/client/server-api/search" ).executeOn( fose.search.gatherSearchData().server );

var schCourseInfo = typeof schCourseInfo !== "undefined" ? schCourseInfo
	: allCourseInfo.results.filter( c => schClassNums.includes( c.crn ) );

var schCourseExtendedDetails = typeof schCourseExtendedDetails !== "undefined" ? schCourseExtendedDetails
	: await Promise.all( schCourseInfo.map( c => _lfreq_('fose/client/server-api/details').fetchFor( "code:"+c.code, "crn:"+c.crn, "crn:"+c.crn, currentDB ) ) );

var schCourseAll = typeof schCourseAll !== "undefined" ? schCourseAll // merge of schCourseInfo and schCourseExtendedDetails
	: schCourseInfo.map( (_, i) => ({ ...schCourseInfo[i], ...schCourseExtendedDetails[i] }) );

// from schCourseAll omits key, mpkey, srcdb, stat, total, all_sections, attributes, no, gmods, hours_min, xlist, inst, law, linkedhtml
var courseData = typeof courseData !== "undefined" ? courseData // somewhat parsed subset for schedule use https://stackoverflow.com/a/39333479 wow lol https://stackoverflow.com/a/171256 also wow lol
	: schCourseAll.map( e =>
		( ({code, section, title, schd, instructordetail_html, instr, eval_links, hours, meeting_html, meets, crn, isCancelled, books_html, campus,
			clssnotes, start_date, end_date, description, dates_html, exams_html, grd, hours_text, restrict_info, instmode_html, last_updated, seats}) =>
			({
				// general schedule view pertinent info
				code,
				section,
				title,
				class_type: schd,
				instr: (i=instructordetail_html).substring( i.indexOf( 'blank">' )+7, i.indexOf( "</a>" ) ),
				instr_short: instr,
				instr_oldfcq_html: instructordetail_html,
				course_oldfcq_html: eval_links,
				hours,
				meeting_html,
				location: (m=meeting_html).substring( m.indexOf( 'blank">' )+7, m.indexOf( "</a>" ) ),
				// TODO get meets_short i.e. ECCR 135; parse from meeting_html w/ bldg= and the plaintext?
				meetstime_short: meets,
				location_html: (m=meeting_html).substring( m.indexOf( "in " )+3, m.indexOf( "</a>" )+4 ), // these 5 lines must be kept in order
				meetstime: mt=m.substring( m.indexOf( 'meet">' )+6, m.indexOf( " in" ) ),
				meetsdays: md=(mts=mt.split( " " ))[0],
				meetsdaysindexstr: md.split( " " )[0].replace("M",0).replace("Th",3).replace("T",1).replace("W",2).replace("F",4), // to use with "024".includes( 0 ); yes this works
				meetsstarttime: (mtss=mts[1].split( "-" ))[0],
				meetsendtime: mtss[1],
				
				// general details view pertinent info / additional info that seems useful
				crn,
				isCancelled,
				books_html,
				campus,
				classnotes: clssnotes,
				start_date,
				end_date,
				description_html: description,
				daterange_html: dates_html,
				exams_html,
				grd,
				hours_text,
				restrict_info,
				instmode_html,
				last_updated,
				seats,
			})
		)(e) )


/* courseData[ course_i ]
{
	books_html:			"<a class="btn" target="_blank" href="https://www.cubookstore.com/booklist.aspx?catalogid=17248&uterm=Fall2018">PURCHASE BOOKS</a>"
	campus:				"Boulder Main Campus"
	class_type:			"LEC"
	classnotes:			"Enrollment restricted to Computer Science majors only until 4/23/18, then open to all majors. Non-majors can waitlist before this date.↵-</br>Students may be administratively dropped for non-attendance or for failure to complete prerequisites as stated in course catalog.↵-↵The waitlist for this class is automatically re-sequenced to allow priority to Computer Science majors."
	code:				"CSCI 3434"
	course_oldfcq_html:	"<a href="https://fcq.colorado.edu/scripts/broker.exe?_PROGRAM=fcqlib.fcqdata.sas&subj=CSCI&crse=3434" target="_blank">Course Evaluations</a><br/>"
	crn:				"17248" //// CLASS NUMBER
	daterange_html:		"2018-08-27 through 2018-12-13"
	description_html:	"Introduces the foundations of formal language theory, computability, and complexity. Shows relationship between automata and various classes of languages. Addresses the issue of which problems can be solved by computational means, and studies complexity of solutions."
	end_date:			"2018-12-13"
	exams_html:			""
	grd:				"Student Option"
	hours:				"3"
	hours_text:			"3 Credit Hour Lecture"
	instmode_html:		"In Person"
	instr:				"Rafael Frongillo"
	instr_oldfcq_html:	"<div class="instructor-detail"><a href="https://fcq.colorado.edu/scripts/broker.exe?_PROGRAM=fcqlib.fcqdata.sas&iname=Frongillo,Rafael" target="_blank">Rafael Frongillo</a></div>"
	instr_short:		"R. Frongillo"
	isCancelled:		"" //// i don't know what would appear if it is cancelled but probably best to check for this in some form
	last_updated:		"Wed Aug 22 2018 19:05:12 GMT-0500 (CDT)"
	location:			"Engineering Classroom Wing 135"
	location_html:		"<a href="http://www.colorado.edu/campusmap/map.html?bldg=ECCR" target="_blank">Engineering Classroom Wing 135</a>"
	meeting_html:		"<div class="meet">TTh 9:30am-10:45am in <a href="http://www.colorado.edu/campusmap/map.html?bldg=ECCR" target="_blank">Engineering Classroom Wing 135</a></div>"
	meetsdays:			"TTh"
	meetsdaysindexstr:	"13"
	meetsendtime:		"10:45am"
	meetsstarttime:		"9:30am"
	meetstime:			"TTh 9:30am-10:45am"
	meetstime_short:	"TTh 9:30-10:45a"
	restrict_info:		"Requires prerequisite course of CSCI 3104 (minimum grade C-)."
	seats:				"<strong>Maximum Enrollment</strong>: 50 / <strong>Seats Avail</strong>: 6"
	section:			"001"
	start_date:			"2018-08-27"
	title:				"Theory of Computation"
}
*/

document.body.innerHTML =
`
<table>
<tr>
	<th id='timeColumn'><i>time</i></th> <th> Monday </th> <th> Tuesday </th> <th> Wednesday </th> <th> Thursday </th> <th> Friday </th>
</tr>
</table>
`;
var courseWidthPx = 150;

function addStylesheetRules (rules) {
  var styleEl = document.createElement('style'),
      styleSheet;

  // Append style element to head
  document.head.appendChild(styleEl);

  // Grab style sheet
  styleSheet = styleEl.sheet;

  for (var i = 0, rl = rules.length; i < rl; i++) {
    var j = 1, rule = rules[i], selector = rules[i][0], propStr = '';
    // If the second argument of a rule is an array of arrays, correct our variables.
    if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
      rule = rule[1];
      j = 0;
    }

    for (var pl = rule.length; j < pl; j++) {
      var prop = rule[j];
      propStr += prop[0] + ':' + prop[1] + (prop[2] ? ' !important' : '') + ';\n';
    }

    // Insert CSS Rule
    styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
  }
}


addStylesheetRules(
[
	[ 'body', [ 'font-size', '10px' ], [ 'overflow', 'auto' ] ],

	[ 'table', [ 'margin', '10px' ], [ 'padding', '0px' ], [ 'width', '1200px' ], [ 'position', 'relative' ]/*, [ 'margin-left', 'auto' ], [ 'margin-right', 'auto' ]*/ ],

	[ 'th', [ 'width', courseWidthPx + 'px' ] ],

	[ 'div', [ 'position', 'absolute' ] ],
	[ '.courseBlock', [ 'position', 'absolute' ], /*[ 'display', 'grid' ],*/ [ 'border-radius', '3px' ], [ 'border', 'solid rgba( 0, 0, 0, .1 ) 1px' ] ],
	[ '.courseBlock::before', [ 'background-color', 'blue' ] ],

	[ 'pre', [ 'margin', '0px' ], [ 'padding', '0px' ]],

	[ '#timeColumn', [ 'text-align', 'right' ], [ 'padding-right', '20px' ] ],

	// [ '.hourTimes', [] ],

	[ '.timeGap', [ 'width', '200px' ], [ 'text-align', 'center' ], [ 'font-style', 'italic' ], [ 'color', 'rgba( 0, 0, 0, .7 )' ] ]
] )




// !! REMOVE THESE TWO THINGS
var UID = {
	_current: 0,
	getNew: function(){
		this._current++;
		return this._current;
	}
};
HTMLElement.prototype.pseudoStyle = function(element,prop,value){
	var _this = this;
	var _sheetId = "pseudoStyles";
	var _head = document.head || document.getElementsByTagName('head')[0];
	var _sheet = document.getElementById(_sheetId) || document.createElement('style');
	_sheet.id = _sheetId;
	var className = "pseudoStyle" + UID.getNew();
	
	_this.className +=  " "+className; 
	
	_sheet.innerHTML += " ."+className+":"+element+"{"+prop+":"+value+"}";
	_head.appendChild(_sheet);
	return this;
};

// data = // cute subset of actual data; probably just hold all data tbh
// [
//   { time: "TTh 9:30am-10:45am",
//     code: "CSCI 3434" },

//   { time: "MW 3pm-4:15pm",
//     code: "CSCI 4273" }
// ];

var parseTime = d3.time.format( "%-H:%M%p" ).parse;
var parseTime2 = d3.time.format( "%-H%p" ).parse;
var midnight = parseTime( "8:00am" );//parseTime( "11:00pm" );

//!! go through all class times, take 1 less than the part before the first colon as beginning, take 2 more than the part after the - before the colon, gives domain directly

// dunno what height is so; make this a setting probably
var height = 1200;
var y = d3.time.scale.utc().domain( [ midnight, d3.time.day.offset( midnight, 1 ) ] ).range( [ 0, height ] );

var getTimeString = n => ( h=schCourseExtendedDetails[ n ].meeting_html ).substring( h.indexOf( ">" ) + 1, h.indexOf( " in" ) )
var beginTime = n => parseTime( c=getTimeString( n ).split( " " )[1].split( "-" )[0] ) || parseTime2( c ) // of class n
var endTime = n => parseTime( c=getTimeString( n ).split( " " )[1].split( "-" )[1] ) || parseTime2( c ) // of class n
















// times

var d;
for( var i = 1; i <= 12; i++ )
{
	d = document.createElement( "div" );

	var t = d3.time.hour.offset( midnight, i )
	d.style.top = y( t ) + "px";
	d.style.paddingRight = "20px";
	d.style.width = "200px";
	d.innerText = d3.time.format( "%I %p" )( t ).toLowerCase()
	$( d ).addClass( "hourTimes" )
	d.pseudoStyle( "before", "position", "absolute" )
	d.pseudoStyle( "before", "width", 150*8-100+"px" )
	// d.pseudoStyle( "before", "z-index", "1" )
	d.pseudoStyle( "before", "content", "''" )
	d.pseudoStyle( "before", "left", "120px" )
	d.pseudoStyle( "before", "text-align", "right" )
	d.pseudoStyle( "before", "border-top", "solid 1px rgba( 0, 0, 0, .2 )" )

	document.querySelectorAll( "th" )[0].appendChild( d );
	d.innerHTML = " " + d.innerHTML + " "; // selection weirdness
}





var daysToOffsets = t => t.split( " " )[0].replace("M",0).replace("Th",3).replace("T",1).replace("W",2).replace("F",4);


// courses

for( var i = 0; i < schCourseInfo.length; i++ )
{

	var d = document.createElement( "div" );
	// d.innerHTML = schCourseInfo[ i ].code + "\n" + (s=schCourseExtendedDetails[ i ].meeting_html).substring( s.indexOf( ">" )+1, s.lastIndexOf( "a>" )+2 );

	var a;

	a = document.createElement( "div" ); // course code and instructor
	a.innerHTML = schCourseInfo[ i ].code + " - " + schCourseInfo[ i ].instr;
	a.style.position = "absolute";
	d.appendChild( a );
	a.innerHTML  = " " + a.innerHTML + " "; // selection weirdness

	a = document.createElement( "div" ); // meeting time and location
	a.innerHTML = (s=schCourseExtendedDetails[ i ].meeting_html).substring( s.indexOf( ">" )+1, s.lastIndexOf( "<" ) );
	a.style.position = "absolute";
	a.style.bottom = "0px";
	a.style.textAlign = "left"
	d.appendChild( a );
	a.innerHTML  = " " + a.innerHTML + " "; // selection weirdness


	d.style.top = y( beginTime( i ) ) + "px";
	d.style.width = "200px";
	d.style.height = ( y( endTime( i ) ) - y( beginTime( i ) ) ) + "px";
	d.style.backgroundColor = "lightblue";
	$( d ).addClass( "courseBlock" )

	for( let day of daysToOffsets( getTimeString( i ) ) )
	{
		document.querySelectorAll( "th" )[parseInt(day)+1].appendChild( d.cloneNode( true ) ) // which column
	}
}


// timebetween spacers


// a, b are both 
var timeBetween = (a, b) => (r=d3.time.minute.range( a, b ).length) == 0 ? 60*24 : r;

var formatMins = m => d3.time.format( "%-Hh%Mm" )( new Date( 2012, 0, 1, 0, m ) )

for( var i = 0; i < schCourseInfo.length; i++ )
{
	for( let day of daysToOffsets( getTimeString( i ) ) )
	{
		// course i meeting on day day

		var minMins = 60*24;

		for( var j = 0; j < schCourseInfo.length; j++ )
		{
			if( i != j && daysToOffsets( getTimeString( j ) ).includes( day ) && (t=timeBetween( endTime( i ), beginTime( j ) )) < minMins )
				minMins = t;
		}

		if( minMins != 60*24 ) // a space between course i and course j on day d
		{
			var d = document.createElement( "div" );
			d.innerHTML = formatMins( minMins ) + " - " + minMins + "m";
			d.style.top = y( d3.time.minute.offset( endTime( i ), minMins / 2 ) ) - 6 + "px";
			$( d ).addClass( "timeGap" )

			d.pseudoStyle( "after", "position", "absolute" )
			d.pseudoStyle( "after", "height", ( y( d3.time.minute.offset( endTime( i ), minMins ) ) - y( endTime( i ) ) - 6 ) + "px" );
			d.pseudoStyle( "after", "content", "''" )
			d.pseudoStyle( "after", "left", "140px" )
			d.pseudoStyle( "after", "text-align", "right" )
			d.pseudoStyle( "after", "border", "dashed 1px rgba( 0, 0, 0, .3 )" )
			d.pseudoStyle( "after", "bottom", -( y( d3.time.minute.offset( endTime( i ), minMins / 2 ) ) - y( endTime( i ) ) - 7.3 - 3 ) + "px" ) // this is stupid and will involve changing based on font...
			document.querySelectorAll( "th" )[parseInt(day) + 1].appendChild( d ) // which column
			d.innerHTML = " " + d.innerHTML + " ";
		}
	}
}