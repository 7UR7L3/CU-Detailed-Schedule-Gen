// broken in firefox and safari at least
// firefox fix: https://wanago.io/2018/04/16/explaining-async-await-creating-dummy-promises/ differences in implementation
// print to pdf: chrome dev tools -> three dots -> more tools -> rendering -> emulate css media screen. then print

var userData = typeof userData  !== "undefined" ? userData
	: await sam.login().then( v => sam.fetchRecord() ); // collect user data

window.focus()

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
				instr: (i=instructordetail_html).substring( i.indexOf( 'blank">' )+7, i.indexOf( "</a>" ) ), // BROKEN; MULTIPLE INSTRS
				instr_short: instr,
				instr_oldfcq_html: instructordetail_html,
				course_oldfcq_html: eval_links,
				hours,
				meeting_html,
				location: (m=meeting_html).substring( m.indexOf( 'blank">' )+7, m.indexOf( "</a>" ) ),
				// TODO get meets_short i.e. ECCR 135; parse from meeting_html w/ bldg= and the plaintext?
				meetstime_short: meets,
				location_html: (m=meeting_html).substring( m.indexOf( "in " )+3, m.lastIndexOf( "<" ) ), // these 5 lines must be kept in order
				meetstime: mt=m.substring( m.indexOf( 'meet">' )+6, m.indexOf( " in" ) ),
				meetsdays: md=(mts=mt.split( " " ))[0],
				meetsdaysindexstr: md.split( " " )[0].replace("M",0).replace("Th",3).replace("T",1).replace("W",2).replace("F",4), // to use with "024".includes( 0 ); yes this works. should only need to replace first
				meetsstarttime: (mtss=(mts[1]||"").split( "-" ))[0], // ||"" for online classes / classes with meeting_html==""
				meetsendtime: mtss[1]||"",
				
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
	instr:				"Rafael Frongillo" // BROKEN THERE CAN BE MULTIPLE INSTRUCTORS
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
var courseWidthPx = 230;

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
	[ 'body', [ 'font-size', '10px' ], [ 'overflow', 'auto' ]/*, [ 'font-family', 'monospace' ]*/ ],

	[ 'table', [ 'margin', '10px' ], [ 'padding', '0px' ], [ 'width', ( courseWidthPx * 6 ) + 'px' ], [ 'position', 'relative' ], [ 'left', ( -courseWidthPx / 2 ) + 'px' ]/*, [ 'top', '100%' ], [ 'transform', 'translate( 0, -50% )' ]*//*, [ 'margin-left', 'auto' ], [ 'margin-right', 'auto' ]*/ ],

	[ 'th', [ 'width', courseWidthPx + 'px' ] ],

	[ 'div', [ 'position', 'absolute' ] ],
	[ '.courseBlock', /*[ 'position', 'absolute' ],*/ /*[ 'display', 'grid' ],*/ [ 'border-radius', '3px' ], [ 'border', 'solid rgba( 0, 0, 0, .1 ) 1px' ] ],
	[ '.courseBlock::before', [ 'background-color', 'blue' ] ],

	[ 'pre', [ 'margin', '0px' ], [ 'padding', '0px' ]],

	[ '#timeColumn', [ 'text-align', 'right' ], [ 'padding-right', '20px' ] ],

	// [ '.hourTimes', [] ],

	[ '.timeGap', [ 'width', courseWidthPx + 'px' ], [ 'text-align', 'center' ], [ 'font-style', 'italic' ], [ 'color', 'rgba( 0, 0, 0, .7 )' ] ],
	[ '.timeGap::after', [ 'position', 'absolute' ], [ 'content', '""' ], [ 'left', ( courseWidthPx - 60 ) + 'px' ], [ 'text-align', 'right' ], [ 'border', 'dashed 1px rgba( 0, 0, 0, .3 )' ] ],

	[ '.hourTimes', [ 'padding-right', '20px' ], [ 'width', courseWidthPx + 'px' ] ],
	[ '.hourTimes::before', [ 'position', 'absolute' ], [ 'width', ( courseWidthPx * 5 + 80 + 40 ) +'px' ], [ 'content', "''" ], [ 'left', ( courseWidthPx - 80 ) + 'px' ], [ 'text-align', 'right' ], [ 'border-top', 'solid 1px rgba( 0, 0, 0, .2 )' ] ],

	[ '.courseBlock', [ 'width', courseWidthPx + 'px' ], [ 'background-color', 'lightblue' ], [ 'line-height', '1.1' ] ],
	[ '.courseBlock > div', [ 'position', 'absolute' ] ],

	[ '.courseDetail', [ 'position', 'relative' ] ],

	[ '.notimeinfo', [ 'position', 'relative' ], [ 'background-color', '#ccebc5bb' ], [ 'width', courseWidthPx * 18 / 4 + "px" ], [ 'border-radius', '3px' ], [ 'padding', '3px' ], [ 'margin', '3px' ], [ 'border-width', '1px' ], [ 'border-style', 'solid' ], [ 'border-color', 'rgba(0,0,0,.1)' ] ],

	[ '.colGrp0',  [ 'background-color', '#8dd3c7bb' ] ], // http://colorbrewer2.org/#type=qualitative&scheme=Set3&n=12
	[ '.colGrp1',  [ 'background-color', '#ffffb3bb' ] ],
	[ '.colGrp2',  [ 'background-color', '#bebadabb' ] ],
	[ '.colGrp3',  [ 'background-color', '#fb8072bb' ] ],
	[ '.colGrp4',  [ 'background-color', '#80b1d3bb' ] ],
	[ '.colGrp5',  [ 'background-color', '#fdb462bb' ] ],
	[ '.colGrp6',  [ 'background-color', '#b3de69bb' ] ],
	[ '.colGrp7',  [ 'background-color', '#fccde5bb' ] ],
	[ '.colGrp8',  [ 'background-color', '#d9d9d9bb' ] ],
	[ '.colGrp9',  [ 'background-color', '#bc80bdbb' ] ],
	[ '.colGrp10', [ 'background-color', '#ccebc5bb' ] ],
	[ '.colGrp11', [ 'background-color', '#ffed6fbb' ] ]
] )

// [ 'font-family', 'tahoma' ], [ 'font-size', '13.5px' ], [ 'font-weight', '100' ], [ 'font-variant', 'all-small-caps' ], [ 'line-height', '.6' ], [ 'color', 'black' ]




// only used for the time gaps
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

// a, b are both times (parseTime(string)); a before b else 60*24
var timeBetween = (a, b) => (r=d3.time.minute.range( a, b ).length) == 0 ? 60*24 : r;

//!! go through all class times, take 1 less than the part before the first colon as beginning, take 2 more than the part after the - before the colon, gives domain directly

// dunno what height is so; make this a setting probably
var height = 700;




// gets the floored/ceiled start/end time of class n
var floorStartTime = n => d3.time.hour.floor( parseTime( courseData[ n ].meetsstarttime ) || parseTime2( courseData[ n ].meetsstarttime ) );
var ceilEndTime = n => d3.time.hour.ceil( parseTime( courseData[ n ].meetsendtime ) || parseTime2( courseData[ n ].meetsendtime ) );

var earliest = floorStartTime( 0 );
var latest = ceilEndTime( 0 );

for( var i = 1; i < courseData.length; i++ )
{
	if( courseData[ i ].meetsstarttime && timeBetween( earliest, ft=floorStartTime( i ) ) == 60*24 ) earliest = ft;
	if( courseData[ i ].meetsendtime && timeBetween( ct=ceilEndTime( i ), latest ) == 60*24 ) latest = ct;
}

earliest = d3.time.hour.offset( earliest, -1 );
latest = d3.time.hour.offset( latest, 1 );


//var midnight = parseTime( "8:00am" );//parseTime( "11:00pm" );
var y = d3.time.scale.utc().domain( [ earliest, latest ] ).range( [ 0, height ] );


// REMOVE THESE !!
var getTimeString = n => ( h=schCourseExtendedDetails[ n ].meeting_html ).substring( h.indexOf( ">" ) + 1, h.indexOf( " in" ) )
var beginTime = n => parseTime( c=getTimeString( n ).split( " " )[1].split( "-" )[0] ) || parseTime2( c ) // of class n
var endTime = n => parseTime( c=getTimeString( n ).split( " " )[1].split( "-" )[1] ) || parseTime2( c ) // of class n




// times

var d;
for( var i = 1; ; i++ )
{
	var t = d3.time.hour.offset( earliest, i );

	d = document.createElement( "div" );
	d.style.top = y( t ) + "px";
	d.innerText = d3.time.format( "%I %p" )( t ).toLowerCase()
	$( d ).addClass( "hourTimes" )


	document.querySelectorAll( "th" )[0].appendChild( d );
	d.innerHTML = " " + d.innerHTML + " "; // selection weirdness

	if( timeBetween( t, latest ) == 24*60 ) break;
}





var daysToOffsets = t => t.split( " " )[0].replace("M",0).replace("Th",3).replace("T",1).replace("W",2).replace("F",4);


// courses

for( var i = 0; i < schCourseInfo.length; i++ )
{

	var d = document.createElement( "div" );
	// d.innerHTML = schCourseInfo[ i ].code + "\n" + (s=schCourseExtendedDetails[ i ].meeting_html).substring( s.indexOf( ">" )+1, s.lastIndexOf( "a>" )+2 );

	var a;

	a = document.createElement( "div" );
	a.innerHTML = courseData[ i ].code + "-" + courseData[ i ].section + ( courseData[ i ].hours ? ( "(" + courseData[ i ].hours + ")" ) : "(0)" );
	a.style.top = "2px";
	a.style.left = "4px";
	d.appendChild( a );
	a.innerHTML  = " " + a.innerHTML + " "; // selection weirdness

	a = document.createElement( "div" );
	a.innerHTML = courseData[ i ].meetstime;
	a.style.top = "2px";
	a.style.right = "4px";
	d.appendChild( a );
	a.innerHTML = " " + a.innerHTML + " ";

	a = document.createElement( "div" ); // !! MAKE THAT SHIT THE SHIT IN courseData PROBABLY BECAUSE instr_oldfcq_html SUCKS
	a.innerHTML =  courseData[ i ].title + " (" + courseData[ i ].class_type + ")<br>" + $( "<div/>" ).append( $( courseData[ i ].instr_oldfcq_html ).find( "a" ) ).html().replace( /></g, ">, <" );
	a.style.width = "100%"
	a.style.top = "50%";
	a.style.transform = "translate( 0, -50% )";
	// a.style.fontSize = "12px"
	d.appendChild( a );
	a.innerHTML  = " " + a.innerHTML + " "; // selection weirdness

	a = document.createElement( "div" ); // meeting time and location
	//a.innerHTML = (s=schCourseExtendedDetails[ i ].meeting_html).substring( s.indexOf( ">" )+1, s.lastIndexOf( "<" ) );
	a.innerHTML = courseData[ i ].location_html;
	a.style.bottom = "1px";
	a.style.width = "100%"
	d.appendChild( a );
	a.innerHTML  = " " + a.innerHTML + " "; // selection weirdness


	if( !getTimeString( i ) ) continue; // course doesn't have a time, is probably online

	d.style.top = y( beginTime( i ) ) + "px";
	d.style.height = ( y( endTime( i ) ) - y( beginTime( i ) ) ) + "px";
	$( d ).addClass( "courseBlock" )

	$( d ).addClass( "colGrp" + i );

	for( let day of daysToOffsets( getTimeString( i ) ) )
	{
		document.querySelectorAll( "th" )[parseInt(day)+1].appendChild( d.cloneNode( true ) ); // which column
	}
}


// timebetween spacers


var formatMins = m => d3.time.format( "%-Hh%Mm" )( new Date( 2012, 0, 1, 0, m ) );

for( var i = 0; i < schCourseInfo.length; i++ )
	for( let day of daysToOffsets( getTimeString( i ) ) )
	{
		// course i meeting on day day

		var minMins = 60*24;

		for( var j = 0; j < schCourseInfo.length; j++ )
			if( i != j && daysToOffsets( getTimeString( j ) ).includes( day ) && (t=timeBetween( endTime( i ), beginTime( j ) )) < minMins )
				minMins = t;

		if( minMins != 60*24 ) // a space between course i and course j on day d
		{
			var d = document.createElement( "div" );
			d.innerHTML = formatMins( minMins ) + " - " + minMins + "m";
			d.style.top = y( d3.time.minute.offset( endTime( i ), minMins / 2 ) ) - 6 + "px";
			$( d ).addClass( "timeGap" )

			d.pseudoStyle( "after", "height", ( y( d3.time.minute.offset( endTime( i ), minMins ) ) - y( endTime( i ) ) - 6 ) + "px" );
			d.pseudoStyle( "after", "bottom", -( y( d3.time.minute.offset( endTime( i ), minMins / 2 ) ) - y( endTime( i ) ) - 7.3 - 3 ) + "px" ) // this is stupid and will involve changing based on font...
			document.querySelectorAll( "th" )[parseInt(day) + 1].appendChild( d ) // which column
			d.innerHTML = " " + d.innerHTML + " ";
		}
	}




// classes with no times that couldn't be added to the courses

var nontimes = document.createElement( "div" );
nontimes.innerHTML = "<b>Courses with Unassigned Time:</b>";
var add = false;

for( var i = 0; i < schCourseInfo.length; i++ )
	if( !getTimeString( i ) )
	{
		add = true;

		var d = document.createElement( "div" );
		d.innerHTML  = courseData[ i ].code + "-" + courseData[ i ].section + ( courseData[ i ].hours ? ( "(" + courseData[ i ].hours + ")" ) : "(0)" );
		d.innerHTML += " ● " + courseData[ i ].title + " (" + courseData[ i ].class_type + ") ● " + $( "<div/>" ).append( $( courseData[ i ].instr_oldfcq_html ).find( "a" ) ).html().replace( /></g, ">, <" );
		d.innerHTML += "<br> ● " + courseData[ i ].campus + " ● " + courseData[ i ].instmode_html + " (" + courseData[ i ].meetstime_short + ")";
		$( d ).addClass( "notimeinfo" );
		nontimes.appendChild( d );
		d.innerHTML = " " + d.innerHTML + " ";
	}

nontimes.style.top = height + "px";
nontimes.style.left = courseWidthPx*3/4 + "px";
nontimes.style.padding = "0px";
nontimes.style.fontSize = "14px";
nontimes.style.position = "relative"
nontimes.style.width = "65%";
// d.style.fontFamily = `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`;
if( add ) document.body.appendChild( nontimes );
nontimes.innerHTML = " " + nontimes.innerHTML + " ";




// details at the end

var details = document.createElement( "div" );

for( var i = 0; i < courseData.length; i++ )
{
	var d = document.createElement( "div" );
	d.innerHTML = "<b style='float: left; width: 100%'>" + courseData[ i ].code + " - " + courseData[ i ].section + ": " + courseData[ i ].title + " (" + courseData[ i ].class_type + ")</b>";
	$( d ).addClass( "courseDetail" );

	var ul = document.createElement( "ul" );
	ul.style.width = "300px"
	ul.style.float = "left";
	// ul.style.marginBottom = "0px"

	var b;

	b = document.createElement( "li" );
	b.innerHTML = "<a href=" + (c=courseData[ i ].books_html).substring( c.indexOf( 'href="' )+6, c.lastIndexOf( '">' ) ) + ">Textbooks</a>";
	ul.appendChild( b );

	b = document.createElement( "li" );
	b.innerHTML = "Campus: " + courseData[ i ].campus;
	ul.appendChild( b );

	// new fcq link style, idk if names will work since they expect middle names too
	// https://public.tableau.com/profile/fcq.office#!/vizhome/FCQ/Boulder?Instructor=ABBOTT\, LON&Term=
	// also see https://onlinehelp.tableau.com/current/pro/desktop/en-us/embed_list.htm
	// https://public.tableau.com/views/FCQ/Boulder?:showVizHome=no&:tabs=no&:highdpi=false&:customViews=no
	// https://public.tableau.com/views/FCQ/Boulder?:showVizHome=no&:tabs=no&:customViews=no&Term=&Instructor=ABBOTT%5C,%20LON

	b = document.createElement( "li" );
	b.innerHTML = "Old FCQ Evaluations: " + courseData[ i ].course_oldfcq_html;
	ul.appendChild( b );

	b = document.createElement( "li" );
	b.innerHTML = "Class Number: " + courseData[ i ].crn;
	ul.appendChild( b );

	b = document.createElement( "li" );
	b.innerHTML = courseData[ i ].daterange_html;
	ul.appendChild( b );

	b = document.createElement( "li" );
	b.innerHTML = courseData[ i ].grd;
	ul.appendChild( b );

	b = document.createElement( "li" );
	b.innerHTML = "Instructor Google Search"
	ul.appendChild( b );

	// both fcq links, all above information too so time and location too

	d.appendChild( ul );


	var desc = document.createElement( "div" );
	desc.innerHTML = courseData[ i ].description_html + "<br><br>" + courseData[ i ].classnotes;
	desc.style.float = "left";
	desc.style.position = "relative"
	desc.style.width = "65%";
	desc.style.minWidth = "600px"
	d.appendChild( desc );

	details.appendChild( d );
	d.innerHTML = " " + d.innerHTML + " ";
}

details.style.top = height + "px";
details.style.padding = "50px"
details.style.fontSize = "14px";
details.style.position = "relative"
// d.style.fontFamily = `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`;
document.body.appendChild( details );
details.innerHTML = " " + details.innerHTML + " ";