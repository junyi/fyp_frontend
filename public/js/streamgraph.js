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

        this.color = d3.scale.category10();

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
            .tickFormat(d3.time.format('%Y-%m-%d'))

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

        this.streamBase = this.base.append("g")
            .classed("streamgraph", true)
            .attr('width', this.w)
            .attr('height', this.h);

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

                // D3's axis functionality usually works great
                // however, I was having some aesthetic issues
                // with the tick placement
                // here I extract out every other day - and 
                // manually specify these values as the tick 
                // values
                var dates = data[0].values.map(function(v) {
                    return v.date;
                });

                var index = 0;
                dates = dates.filter(function(d) {
                    index += 1;
                    return (index % 2) == 0;
                });

                chart.xAxis.tickValues(dates);


                // the axis lines will go behind
                // the rest of the display, so create
                // it first
                this.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + chart.h + ")")
                    .call(chart.xAxis);

                // 'wiggle' is the offset to use 
                // for streamgraphs.
                chart.stack.offset("wiggle");

                // the stack layout will set the count0 attribute
                // of our data
                chart.stack(data);

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


                // now we bind our data to create
                // a new group for each series
                var svg = this.selectAll(".series")
                    .data(data);

                return svg;

            },
            insert: function() {
                var series = this.append("g")
                    .attr("class", "series")

                // add some paths that will
                // be used to display the lines and
                // areas that make up the charts
                series.append("path")
                    .attr("class", "area")
                    .style("fill", function(d) {
                        return chart.color(d.key)
                    })
                    .attr("d", function(d) {
                        return chart.area(d.values)
                    });

                series.append("path")
                    .attr("class", "line")
                    .style("stroke-opacity", 1e-6);

                series.on("mouseover", function(d, i) {
                        series.transition()
                            .duration(250)
                            .attr("opacity", function(d, j) {
                                return j != i ? 0.6 : 1;
                            });
                        return chart.showDetails(d, i, this);

                    })
                    .on("mouseout", function(d, i) {
                        series.transition()
                            .duration(250)
                            .attr("opacity", "1");
                        return chart.hideDetails(d, i, this);
                    });

                return series;
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
        this.trigger('change:width', newWidth, newWidth);
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
        this.trigger('change:height', newHeight, this.h);
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
    },
    setupUsingWidth: function() {

        this.x.range([0, this.w]);

        this.xAxis.scale(this.x);

        this.streamBase.attr('width', this.w);

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

        this.streamBase.attr('height', this.h);
    },
    showDetails: function(data, i, element) {
        var content;
        d3.select(element).attr("stroke", "black");
        content = "<span class=\"name\">Category:</span><span class=\"value\"> " + data.key + "</span><br/>";
        content += "<span class=\"name\">Count:</span><span class=\"value\"> " + data.count + "</span><br/>";
        return this.tooltip.showTooltip(content, d3.event);
    },
    hideDetails: function(data, i, element) {
        d3.select(element).attr("stroke", null);
        return this.tooltip.hideTooltip();
    }
});