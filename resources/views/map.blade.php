<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

	<title>Jobsbank Visualisation</title>
	<meta name="description" content="D3">
	<meta name="author" content="Hee Jun Yi">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/8.0.2/nouislider.min.css">
	<link rel="stylesheet" href="css/d3.slider.css">
	<link rel="stylesheet" href="css/style.css">
	<style>

		body {
			margin: 0;
		}

		#container {
			margin-top: 100px;
		}

		.wrapper {
			width: 800px;
			margin-top: 100px;
			margin-left: auto;
			margin-right: auto;
		}

		#date {
			text-align: center;
		}

		#slider {
			margin-top: 100px;
			border: 1px solid #5399FF;
		}

		#date {
			margin-top: 20px;
		}

		.hoverinfo {
			color: black;
		}

		.noUi-base {
			background: #5399FF;
		}

		.datamaps-legend {
			right: 200px;
			left: 200px !important;
		}

	</style>
</head>

<body>
	<header>
		<h1 style="margin: 1em;">Jobsbank</h1>
	</header>

	<div id="container" style="position: relative; width: 100%; height: 500px;"></div>

	<div class="wrapper">
		<div id="slider"></div>
		<div id="date"></div>
	</div>
	<script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.min.js"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.js"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/queue-async/1.0.7/queue.min.js"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/noUiSlider/8.0.2/nouislider.min.js"></script>
	<script src="js/colorbrewer.v1.min.js"></script>
	<script src="js/d3.slider.js"></script>
	<script src="js/datamaps.none.min.js"></script>
	<script>
	queue()
	    .defer(d3.json, "/fyp/location_by_date")
	    .await(ready);

	var array = [];
	for (var i = 0; i < 9; i++) {
		array.push(25 + 25 * i);
	};

	var color = d3.scale.threshold()
    		.domain(array)
    		.range(colorbrewer.Blues[9]);

    var colorKey = d3.scale.threshold()
    		.domain(array)
    		.range(array);

	function ready(error, json){
		console.log(json);

		reverseMap = {};
		_.each(json, function(list, key, map){
			_.each(list, function(value, child_index, child_list){
				if (!(value.date in reverseMap)){
					reverseMap[value.date] = {};
				}

				newKey = key.split(" ")[0];

				if (newKey[0] == 'D'){
					reverseMap[value.date][newKey] = {
						fillKey: colorKey(value.count),
						name: key,
						count: value.count
					};
				}
			})
		})

		fills = _.object(color.domain(), color.range());
		fills['defaultFill'] = color.range()[color.range().length - 1];

		var initialDate = Object.keys(reverseMap)[0];
		data = reverseMap[initialDate];
		console.log(data);
		d3.select('#date').html(initialDate);

		// console.log(Object.keys(reverseMap));
		// console.log(Math.min.apply(null, Object.keys(reverseMap)))

		// var dates = _.map(Object.keys(reverseMap), function(i){
		// 	return new Date(i);
		// }).sort();
		// console.log(dates);

		// var format = d3.time.format("%Y-%m-%d");

	    // d3.select('#slider')
	    // 	.call(d3.slider()
	    // 		.min(0)
	    // 		.max(dates.length - 1)
	    // 		.step(1)
	    // 		.on("slide", function(event, value){
	    // 			d3.select('#date').html(format(dates[value]));
					// data = reverseMap[Object.keys(reverseMap)[value]];
					// map.updateChoropleth(data);
	    // 		}));

	    var slider = document.getElementById('slider');

		noUiSlider.create(slider, {
			start: 0,
			step: 1,
			range: {
			  'min': 0,
			  'max': Object.keys(reverseMap).length - 1
			}
		});


		slider.noUiSlider.on('slide', function(){
			var value = parseInt(slider.noUiSlider.get());
			var date = Object.keys(reverseMap)[value];
			d3.select('#date').html(date);
			data = reverseMap[date];
			console.log(reverseMap);
			console.log(date, data);
			map.updateChoropleth(data);
		});

	    var map = new Datamap({
	        element: document.getElementById('container'),
	        geographyConfig: {
	            dataUrl: 'data/district.topojson',
	            popupTemplate: function(geo, data) {
	                return ['<div class="hoverinfo"><strong>',
	                        'District ' + data.name + '<br/>',
	                        'Count: ' + data.count,
	                        '</strong></div>'].join('');
	            }
	        },
	        scope: 'districts',
	        aspectRatio: 0.5625,
	        fills: fills,
	        data: data,
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
	}
	</script>
</body>
</html>