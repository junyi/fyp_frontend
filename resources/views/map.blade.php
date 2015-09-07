<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

	<title>Jobsbank Visualisation</title>
	<meta name="description" content="D3">
	<meta name="author" content="Hee Jun Yi">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

</head>

<body>
	<header>
		<h1>Jobsbank</h1>
	</header>

	<div id="container" style="position: relative; width: 100%; height: 900px;"></div>

	<script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.min.js"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.js"></script>
	<script src="/js/datamaps.none.min.js"></script>
	<script>
	    var map = new Datamap({
	        element: document.getElementById('container'),
	        geographyConfig: {
	            dataUrl: '/data/district.topojson'
	        },
	        scope: 'districts',
	        aspectRatio: 0.5625,
	        fills: {
	            HIGH: '#afafaf',
	            LOW: '#123456',
	            MEDIUM: 'blue',
	            UNKNOWN: 'rgb(0,0,0)',
	            defaultFill: 'green'
	        },
	        data: {
	        	'D22': {
	                fillKey: 'MEDIUM',
	                districts: 100
	            },
	            'D24': {
	                fillKey: 'LOW',
	                districts: 1
	            }
	        },
	        // projection: 'mercator',
	        setProjection: function(element, options) {
	            var projection, path;
	            projection = d3.geo.mercator()
	                .center([103.58617823176368, 1.013358453152594])
                    .scale(5E6)
	                .translate([element.offsetWidth/2, element.offsetHeight/2]);
	            path = d3.geo.path()
	                .projection( projection );

	            return {path: path, projection: projection};
	        },
	        done: function(datamap) {
	            console.log(datamap);
	            datamap.svg.call(d3.behavior.zoom() 
				        .on("zoom", redraw));

				 function redraw() {
				      datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
				 }
	        }
	    });

	    map.legend();
</script>
</body>
</html>