d3.chart("Streamgraph", {

    // initialize height and width from parent
    // as backup if the user doesn't configure
    // the chart parameters.
    initialize: function() {
        var chart = this;

        this.h = this.base.attr("height");
        this.w = this.base.attr("width");

        this.x = d3.time.scale()
            .range([0, this.w]);

        this.y = d3.scale.linear()
            .range([this.h, 0]);

        this.paddingH = 20;

        // this.color = d3.scale.category20();
        this.color = d3.scale.ordinal()
            .range(colorbrewer.RdYlGn[9]);
        this.tooltip = CustomTooltip("tooltip", 240);

        // area generator to create the
        // polygons that make up the
        // charts
        this.area = d3.svg.area()
            .interpolate("basis")
            .x(function(d) {
                return this.x(d.date);
            });

        // line generator to be used
        // for the Area Chart edges
        this.line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) {
                return this.x(d.date);
            });

        // axis to simplify the construction of
        // the day lines
        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .tickSize(-this.h)
            .tickFormat(d3.time.format('%a %d'))

        // stack layout for streamgraph
        // and stacked area chart
        this.stack = d3.layout.stack()
            .values(function(d) {
                return d.values;
            })
            .x(function(d) {
                return d.date;
            })
            .y(function(d) {
                return d.count;
            })
            .out(function(d, y0, y) {
                d.count0 = y0;
            })
            .order("reverse");


        // I want the streamgraph to emanate from the
        // middle of the chart. 
        // we can set the area's y0 and y1 values to 
        // constants to achieve this effect.
        this.area.y0(this.h / 2)
            .y1(this.h / 2);

        this.on('change:width', function(newWidth) {
            this.setupUsingWidth();
        });

        this.on('change:height', function(newHeight) {
            this.setupUsingHeight();
        });

        this.zoom = d3.behavior.zoom()
            .x(this.x)
            .on('zoom', function(){
                var zoom = chart.zoom;
                var xScale = chart.x;
                // var t = zoom.translate(),
                //     tx = t[0],
                //     ty = t[1];
                    
                // tx = Math.min(tx, 0);
                // tx = Math.max(tx, chart.w - chart.x(chart.maxDate));
                // console.log(tx);
                // zoom.translate([tx, ty]);
                if (xScale.domain()[0] < chart.minDate) {
                    var x = zoom.translate()[0] - xScale(chart.minDate) + xScale.range()[0];
                    zoom.translate([x, 0]);
                } else if (xScale.domain()[1] > chart.maxDate) {
                    var x = zoom.translate()[0] - xScale(chart.maxDate) + xScale.range()[1];
                    zoom.translate([x, 0]);
                }
                chart.updateGraph();
            })

        this.streamBase = this.base.append("g")
            .classed("streamgraph", true)
            .attr('width', this.w)
            .attr('height', this.h)
            .style('padding-left', this.paddingH)
            .style('padding-right', this.paddingH)
            .call(this.zoom);

        this.bisectDate = d3.bisector(function(d) {
            return d;
        }).left;

        // the axis lines will go behind
        // the rest of the display, so create
        // it first
        this.streamBase.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.h + ")");

        this.layer("streamgraph", this.streamBase, {
            dataBind: function(data) {
                // a parser to convert our date string into a JS time object.
                var parseTime = d3.time.format("%Y-%m-%d").parse;

                // tranform original data in object form to array
                function transformData(data) {
                    var newData = [];
                    for (var key in data) {
                        var value = data[key];
                        var tempObject = {
                            key: key
                        };
                        tempObject.values = value;
                        newData.push(tempObject);
                    }

                    return newData;
                }

                data = transformData(data);

                // go through each data entry and set its
                // date and count property
                data.forEach(function(s) {

                    s.values.forEach(function(d) {
                        d.key = s.key;
                        d.date = parseTime(d.date);
                        d.count = parseFloat(d.count);
                    });

                    s.maxCount = d3.max(s.values, function(d) {
                        return d.count;
                    });

                });

                data.sort(function(a, b) {
                    return b.maxCount - a.maxCount;
                });

                // first, lets setup our x scale domain
                // this assumes that the dates in our data are in order
                chart.minDate = d3.min(data, function(d) {
                    return d.values[0].date;
                });

                chart.maxDate = d3.max(data, function(d) {
                    return d.values[d.values.length - 1].date;
                });


                chart.x.domain([chart.minDate, chart.maxDate]);
                chart.zoom
                    .x(chart.x)
                    .scaleExtent([chart.x(chart.minDate), chart.x(chart.maxDate)]);
                // D3's axis functionality usually works great
                // however, I was having some aesthetic issues
                // with the tick placement
                // here I extract out every other day - and 
                // manually specify these values as the tick 
                // values
                var dates = data[0].values.map(function(v) {
                    return v.date;
                });

                // var index = 0;
                // dates = dates.filter(function(d) {
                //     index += 1;
                //     return (index % 2) == 0;
                // });

                // chart.xAxis.tickValues(dates);

                this.selectAll('.x.axis').call(chart.xAxis);

                // 'wiggle' is the offset to use 
                // for streamgraphs.
                chart.stack.offset("silhouette");

                // the stack layout will set the count0 attribute
                // of our data
                chart.layer = chart.stack(data);

                // reset our y domain and range so that it 
                // accommodates the highest value + offset
                chart.y.domain([0, d3.max(data[0].values.map(function(d) {
                        return d.count0 + d.count;
                    }))])
                    .range([chart.h, 0])

                // the line will be placed along the 
                // baseline of the streams, but will
                // be faded away by the transition below.
                // this positioning is just for smooth transitioning
                // from the area chart
                chart.line.y(function(d) {
                    return chart.y(d.count0);
                });

                // setup the area generator to utilize
                // the count0 values created from the stack
                // layout
                chart.area.y0(function(d) {
                        return chart.y(d.count0);
                    })
                    .y1(function(d) {
                        return chart.y(d.count0 + d.count);
                    });

                chart.data = data;

                // now we bind our data to create
                // a new group for each series
                var svg = this.selectAll(".series")
                    .data(data);

                svg.transition()
                    .duration(750);

                return svg;

            },
            insert: function() {
                console.log("Insert called");

                var series = this.append("g")
                    .attr("class", "series")
                    .on("mouseover", function(d, i) {
                        chart.base.selectAll('.series').transition()
                            .duration(250)
                            .attr("opacity", function(d, j) {
                                return j != i ? 0.2 : 1;
                            });
                    })
                    .on("mouseout", function(d, i) {
                        chart.base.selectAll('.series').transition()
                            .duration(250)
                            .attr("opacity", "1");

                        chart.base.selectAll('.tick').transition()
                            .duration(100)
                            .style("opacity", "1");
                        return chart.hideDetails(d, i, this);
                    })
                    .on("mousemove", function(d, i) {
                        var selected = d.values;
                        var datearray = [];
                        for (var k = 0; k < selected.length; k++) {
                            datearray[k] = selected[k].date;
                        }

                        var x0 = chart.x.invert(d3.mouse(this)[0]),
                            i = chart.bisectDate(datearray, x0),
                            d0 = selected[i - 1],
                            d1 = selected[i],
                            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

                        chart.base.selectAll('.tick').transition()
                            .duration(100)
                            .style("opacity", function(d, j) {
                                return j != i ? 0.2 : 1;
                            });

                        d3.select(this)
                            .classed("hover", true)
                            .attr("stroke", "#fff")
                            .attr("stroke-width", "0.5px");
                        // tooltip.html("<p>" + d.key + "<br>" + invertedx + "</p>").style("visibility", "visible");

                        return chart.showDetails(d, i, this);

                    });

                return series;
            },
            events: {
                enter: function() {
                    // add some paths that will
                    // be used to display the lines and
                    // areas that make up the charts
                    console.log("Enter called");
                    this.append("path")
                        .attr("class", "area")
                        .style("fill", function(d) {
                            return chart.color(d.key)
                        })
                        .attr("d", function(d) {
                            return chart.line(d.values);
                        })

                    var series = this;
                    this.append("path")
                        .attr("class", "line")
                        .style("stroke-opacity", 1e-6)
                        .attr("d", function(d) {
                            return chart.area(d.values);
                        })

                    chart.base.selectAll("path.line")
                        .data(chart.layer)
                        .transition()
                        .duration(750)
                        .attr("d", function(d) {
                            return chart.line(d.values);
                        });

                    chart.base.selectAll("path.area")
                        .data(chart.layer)
                        .transition()
                        .duration(750)
                        .attr("d", function(d) {
                            return chart.area(d.values);
                        });

                },
                update: function() {
                    console.log("Update called");

                    chart.base.selectAll("path.line")
                        .data(chart.layer)
                        .transition()
                        .duration(750)
                        .attr("d", function(d) {
                            return chart.line(d.values);
                        });

                    chart.base.selectAll("path.area")
                        .data(chart.layer)
                        .transition()
                        .duration(750)
                        .attr("d", function(d) {
                            return chart.area(d.values);
                        });
                },
                exit: function() {
                    console.log("Exit called");

                    this.transition().remove();
                }
            }
        });

    },
    updateGraph: function(){
        var chart=this;
        chart.base.selectAll("path.line")
            .data(chart.layer)
            .attr("d", function(d) {
                return chart.line(d.values);
            });

        chart.base.selectAll("path.area")
            .data(chart.layer)
            .attr("d", function(d) {
                return chart.area(d.values);
            });
        this.streamBase.selectAll('.x.axis').call(this.xAxis);
    },

    // configures the width of the chart.
    // when called without arguments, returns the
    // current width.
    width: function(newWidth) {
        newWidth = newWidth - this.paddingH * 2;
        if (arguments.length === 0) {
            return this.w;
        }
        this.w = newWidth;
        this.base.attr("width", this.w);
        this.trigger('change:width', newWidth, newWidth);
        return this;
    },

    // configures the height of the chart.
    // when called without arguments, returns the
    // current height.
    height: function(newHeight) {
        newHeight = newHeight - 20;
        if (arguments.length === 0) {
            return this.h;
        }
        this.h = newHeight;
        this.base.attr("height", this.h);
        this.trigger('change:height', newHeight, this.h);
        return this;
    },

    setupUsingWidth: function() {

        this.x.range([0, this.w]);

        this.xAxis.scale(this.x);

        this.base.attr('width', this.w);

        // this.area.x(function(d) {
        //  return this.x(d.date);
        // });

        // // line generator to be used
        // // for the Area Chart edges
        // this.line.x(function(d) {
        //  return this.x(d.date);
        // });

    },
    setupUsingHeight: function() {
        this.y.range([this.h, 0]);

        this.xAxis.tickSize(-this.h);

        this.area.y0(this.h / 2)
            .y1(this.h / 2);

        this.base.attr('height', this.h + 20);

        this.base.selectAll(".x.axis")
            .attr("transform", "translate(0," + this.h + ")");

    },
    showDetails: function(data, i, element) {
        var content;
        var formatDate = d3.time.format("%Y-%m-%d");
        d3.select(element).attr("stroke", "black");
        content = "<span class=\"name\">Category:</span><span class=\"value\"> " + data.key + "</span><br/>";
        content += "<span class=\"name\">Date:</span><span class=\"value\"> " + formatDate(data.date) + "</span><br/>";
        content += "<span class=\"name\">Count:</span><span class=\"value\"> " + data.count + "</span><br/>";
        return this.tooltip.showTooltip(content, d3.event);
    },
    hideDetails: function(data, i, element) {
        d3.select(element).attr("stroke", null);
        return this.tooltip.hideTooltip();
    }
});