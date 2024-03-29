<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

	<title>Jobsbank Visualisation</title>
	<meta name="description" content="D3">
	<meta name="author" content="Hee Jun Yi">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="http://fonts.googleapis.com/css?family=Lobster+Two:400,700italic" rel="stylesheet" type="text/css">
	<link rel="stylesheet" href="css/style.css">
</head>

<body>
	<header>
		<h1>Jobsbank</h1>
	</header>

	<select id="dataopt">
		<option value="jc">Job category</option>
		<option value="i">Industry</option> 
		<option value="et">Employment type</option>
		<option value="l">Location</option>
		<option value="jl" selected="selected">Job level</option>
	</select>   

	<div id="graph"></div>
		
	<script src="js/jquery-1.11.3.min.js"></script>
	<script src="js/CustomTooltip.js"></script>
	<script src="js/d3.min.js"></script>
	<script src="js/colorbrewer.v1.min.js"></script>
	<script src="js/d3.chart.min.js"></script>
	<script src="js/bubblechart.js"></script>
	<script src="js/streamgraph.js"></script>
	<script src="js/app.js"></script>

</body>
</html>