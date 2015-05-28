d3.chart("Bubble", {

	// initialize height and width from parent
	// as backup if the user doesn't configure
	// the chart parameters.
	initialize: function() {


		this.h = this.base.attr("height");
		this.w = this.base.attr("width");
		this.r = 300;

		var bubbleBase = this.base.append("g")
			.classed("bubble", true)
			.attr('width', this.w)
			.attr('height', this.h);

		this.layer("bubble", bubbleBase, {
			dataBind: function(data) {
				function processData(data) {
					var newDataSet = [];

					var length = data.length;
					var p = d3.scale.category10().range();
					for (var i = 0; i < length; i++) {
						newDataSet.push({
							name: data[i].category,
							className: data[i].category,
							size: data[i].count,
							color: p[i % p.length]
						});
					}
					return {
						children: newDataSet
					};
				}

				var chart = this.chart();

				var bubble = d3.layout.pack()
					.size([chart.r, chart.r])
					.value(function(d) {
						return d.size;
					})
					.padding(3);

				// generate data with calculated layout values
				var nodes = bubble.nodes(processData(data))
					.filter(function(d) {
						return !d.children;
					}); // filter out the outer bubble

				// return a data bound selection for the passed in data.
				return this.selectAll("circle")
					.data(nodes);

			},
			insert: function() {
				// setup the elements that were just created
				return this.append('circle')
					.attr('transform', function(d) {
						return 'translate(' + d.x + ',' + d.y + ')';
					})
					.attr('r', function(d) {
						return d.r;
					})
					.style('fill', function(d) {
						return d.color;
					})
					.style('background', function(d) {
						return d.color;
					})
					.attr('class', function(d) {
						return d.className;
					})
			}
		});

	},

	// configures the width of the chart.
	// when called without arguments, returns the
	// current width.
	width: function(newWidth) {
		if (arguments.length === 0) {
			return this.w;
		}
		this.w = newWidth;
		this.base.attr("width", this.w);
		return this;
	},

	// configures the height of the chart.
	// when called without arguments, returns the
	// current height.
	height: function(newHeight) {
		if (arguments.length === 0) {
			return this.h;
		}
		this.h = newHeight;
		this.base.attr("height", this.h);
		return this;
	},

	// configures the radius of the circles in the chart.
	// when called without arguments, returns the
	// current radius.
	radius: function(newRadius) {
		if (arguments.length === 0) {
			return this.r;
		}
		this.r = newRadius;
		return this;
	}
});