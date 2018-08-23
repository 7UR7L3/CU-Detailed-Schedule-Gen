var userData = await sam.login().then( v => sam.fetchRecord() ); // collect user data

var currentDB = _lfreq_('fose/client/builtin-panels/search').gatherSearchData().server.other.srcdb;

var schClassNums = userData.reg[ currentDB ].map( s => s.split( "|" )[1] );

var allCourseInfo = await _lfreq_( "fose/client/server-api/search" ).executeOn( fose.search.gatherSearchData().server );

var schCourseInfo = allCourseInfo.results.filter( c => schClassNums.includes( c.crn ) );

var schCourseExtendedDetails = await Promise.all( schCourseInfo.map( c => _lfreq_('fose/client/server-api/details').fetchFor( "code:"+c.code, "crn:"+c.crn, "crn:"+c.crn, currentDB ) ) );

document.body.innerHTML = "";





// var svgContainer = d3.select( "body" ).append( "svg" ).attr( "width", 1000 ).attr( "height", 1000 );



