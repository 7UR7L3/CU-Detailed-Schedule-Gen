// SERIOUSLY WHY DO I DO THIS TO MYSELF

d = document.body.innerHTML =
`
<div class="grid-container">
  <div id="monH" class="header">Monday</div>
  <div id="tueH" class="header">Tuesday</div>
  <div id="wedH" class="header">Wednesday</div>  
  <div id="thuH" class="header">Thursday</div>
  <div id="friH" class="header">Friday</div>
  <div id="mon" class="courseHolder"></div>
  <div id="tue" class="courseHolder"></div>
  <div id="wed" class="courseHolder"></div>  
  <div id="thu" class="courseHolder"></div>
  <div id="fri" class="courseHolder"></div>
</div
`;

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

/*addStylesheetRules([
  ['h2', // Also accepts a second argument as an array of arrays instead
    ['color', 'red'],
    ['background-color', 'green', true] // 'true' for !important rules 
  ], 
  ['.myClass', 
    ['background-color', 'yellow']
  ]
]);*/

addStylesheetRules(
[
	[ '#monH', [ 'grid-area', 'M' ] ],
	[ '#tueH', [ 'grid-area', 'T' ] ],
	[ '#wedH', [ 'grid-area', 'W' ] ],
	[ '#thuH', [ 'grid-area', 'Th' ] ],
	[ '#friH', [ 'grid-area', 'F' ] ],
	[ '#mon', [ 'grid-area', 'Mon' ] ],
	[ '#tue', [ 'grid-area', 'Tue' ] ],
	[ '#wed', [ 'grid-area', 'Wed' ] ],
	[ '#thu', [ 'grid-area', 'Thu' ] ],
	[ '#fri', [ 'grid-area', 'Fri' ] ],

	[ '.header, .courseHolder', [ 'background-color', 'lightblue' ] ],

	[ '.header', [ 'margin-bottom', '5px' ] ],

	[ '.courseHolder', [ 'border-top', '1px solid black' ] ],

	[ '.grid-container',
		[ 'display', 'grid' ],
		[ 'grid-template-areas',
`'b M T W Th F'
'b Mon Tue Wed Thu Fri'
't t t t t t'
't t t t t t'
't t t t t t'
't t t t t t'
't t t t t t'
't t t t t t'
't t t t t t'
't t t t t t'` ],
		// [ 'grid-gap', "5px" ],
		[ 'width', '1000px' ],
		[ 'height', '800px' ],
		[ 'margin', '0 auto' ],
		[ 'margin-top', '5%' ]
	],
] )