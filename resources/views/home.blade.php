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
		<h1>PubNub &#10084; D3</h1>
		<h2>D3 Bubble Chart with PubNub Data Stream!</h2>
	</header>

	<fieldset>
		<section id="graph"></section>
		
	</fieldset>

	<footer>So what does this chart indicates? It shows message volume per country from an each PubNub data center.<br>
	The size of each bubble corresponds with volume. To simplify the tutorial, the country names are not labeled, however, you can take a look at the generated source code in dev console to see abbriviated country codes as class name!</footer>

	<script src="js/jquery-1.11.3.min.js"></script>
	<script src="js/CustomTooltip.js"></script>
	<script src="js/d3.min.js"></script>	
	<script src="js/app.js"></script>

</body>
</html>