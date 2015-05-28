(function() {

    var graph = d3.select("#graph")
        .append("svg")
        .chart("Streamgraph")
        .width($("#graph").parent().width())
        .height(800);

    d3.json('/job_category_by_date', function(err, json) {

        // .radius(600);

        graph.draw(json);
    });
    //   var xScale = new Plottable.Scales.Linear();
    //   var yScale = new Plottable.Scales.Linear();
    //   var plot = new Plottable.Plots.Scatter(xScale, yScale)
    //     .addDataset(json)
    //     .project("size", 7)
    //     .project("fill", "species", colorScale);
    //   plot.renderTo("#graph");
    // });
    //   var diameter = 600;

    //   var svg = d3.select('#graph').append('svg')
    //           .attr('width', diameter)
    //           .attr('height', diameter);

    //   var bubble = d3.layout.pack()
    //         .size([diameter, diameter])
    //         .value(function(d) {return d.size;})
    //         //  .sort(function(a, b) {
    //         //  return -(a.value - b.value)
    //         // }) 
    //         .padding(3);

    //   // generate data with calculated layout values
    //   var nodes = bubble.nodes(processData(json))
    //             .filter(function(d) { return !d.children; }); // filter out the outer bubble

    //   var vis = svg.selectAll('circle')
    //           .data(nodes);

    //   var tooltip = CustomTooltip("tooltip", 240);

    //   var layout_gravity = -0.01;
    //   var damper = 0.1;
    //   var force = d3.layout.force().nodes(this.nodes).size([diameter, diameter]);

    //   function display_group_all() {
    //     force.gravity(layout_gravity).charge(charge).friction(0.9).on("tick", (function(_this) {
    //       return function(e) {
    //         return _this.circles.each(_this.move_towards_center(e.alpha)).attr("cx", function(d) {
    //           return d.x;
    //         }).attr("cy", function(d) {
    //           return d.y;
    //         });
    //       };
    //     })(this));
    //     force.start();
    //   };

    //   vis.enter().append('circle')
    //       .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    //       .attr('r', function(d) { return d.r; })
    //       .style('fill', function(d) { return d.color; })
    //       .style('background', function(d) { return d.color; })
    //       .attr('class', function(d) { return d.className; })
    //       .on("mouseover", function(d, i) {
    //         return show_details(d, i, this);
    //       })
    //       .on("mouseout", function(d, i) {
    //         return hide_details(d, i, this);
    //       });

    //   display_group_all()

    //   function show_details(data, i, element) {
    //     var content;
    //     d3.select(element).attr("stroke", "black");
    //     content = "<span class=\"name\">Category:</span><span class=\"value\"> " + data.name + "</span><br/>";
    //     content += "<span class=\"name\">Count:</span><span class=\"value\"> " + data.size + "</span><br/>";
    //     return tooltip.showTooltip(content, d3.event);
    //   };

    //   function hide_details(data, i, element) {
    //     d3.select(element).attr("stroke", null);
    //     return tooltip.hideTooltip();
    //   };

    //   function processData(data) {
    //     var newDataSet = [];

    //     var length = data.length;
    //     var p = d3.scale.category10().range();
    //     for(var i = 0; i < length; i++) {
    //       newDataSet.push({name: data[i].category, className: data[i].category, size: data[i].count, color: p[i % p.length]});
    //     }
    //     return {children: newDataSet};
    //   }
    // });

})();