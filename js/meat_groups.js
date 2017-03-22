var DATA_FILE_LOC = "data/meat.tsv";
var START_YEAR = 1970;
var CURR_YEAR = 1970;
var PAUSED = false;
var USER_SPEED = 750;
var USER_SCALE = "group";

var num_rows = 520
  , num_cols = 1;

// var num_rows = 7
// 	, num_cols = 5;

//can be safely changed.
var food_groups = {
    "meat": {
        "max": 12
    }
    // "veg": {
    //     "max": 3
    // },
    // "fruit": {
    //     "max": 1.2
    // },
    // "grain": {
    //     "max": 8
    // },
    // "dairy": {
    //     "max": 3
    // },
    // "sugar":{
    //   "max": 80
    // },
    // "fat": {
    //     "max": 900
    // }
};

// Dimensions of each multiple
var margin = {
    top: 0,
    right: 20,
    bottom: 10,
    left: 250
}
  , width = 880 - margin.left - margin.right //20+15= the gap between 2 graphs
  , height = 300 - margin.top - margin.bottom;

var bisectYear = d3.bisector(function(d) {
    return d.year;
}).left;


var numberFormat = d3.format(".2f");

// Horizontal scale for full grid
var x0 = d3.scale.ordinal().rangeRoundPoints([0, 890]).domain(Object.keys(food_groups));

// Vertical scale for full grid
var y0 = d3.scale.ordinal().domain(d3.range(10)).rangeRoundPoints([0, 520]);

var x = d3.scale.linear().range([0, width]);

var y = d3.scale.linear().range([height, 0]);
var scale_factor = 1.4;

var xAxis = d3.svg.axis().scale(x).orient("bottom");

var yAxis = d3.svg.axis().scale(y).orient("left").ticks(6).tickPadding(4);

var area = d3.svg.area().x(function(d) {
    return x(d.year);
}).y0(height).y1(function(d) {
    return y(d.value);
});





var line = d3.svg.line().x(function(d) {
    return x(d.year);
}).y(function(d) {
    return y(d.value);
});

d3.tsv(DATA_FILE_LOC, type, function(error, data) {
    if (error)
        throw error;

    var fields = d3.keys(data[0]).filter(function(key) {
        return key !== "year";
    });

    // var cities = data.columns.slice(1).map(function(id) {
    //   return {
    //     id: id,
    //     values: data.map(function(d) {
    //       return {date: d.date, temperature: d[id]};
    //     })
    //   };
    // });



    var foods = fields.map(function(fname, i) {
        var words = fname.split("_");
        var food_group = words[0];
        var real_name = words.slice(1, words.length).join(" ");
        return {
            field: real_name,
            food_group: food_group,
            values: data.map(function(d) {
                return {
                    year: d.year,
                    value: d[fname]
                };
            })
        };
    });
    // console.log(foods);
    // Min and max year
    x.domain([d3.min(foods, function(s) {
        return s.values[0].year;
    }), d3.max(foods, function(s) {
        return s.values[s.values.length - 1].year;
    })]);

    // Max for each food item
    foods.forEach(function(f) {
        f.max_servings = d3.max(f.values, function(d) {
            return d.value;
        });
    });

    // Fixed y domain (servings i.e. ounces)
    // y.domain([0, 3.75]);

    // Start chart for each food
    var svg = d3.select("#charts").selectAll("svg").data(foods).enter().append("svg").attr("id", function(d) {
        return d.field;
    }).attr("class", function(d) {
        return d.food_group;
    }).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
    // .style("left", function(d, i) {
    //     return x0(d.food_group) + "px";
    // })// .style("top", function(d,i) { return y0(i) + "px"; })
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect").attr("class", "chartbg").attr("width", width).attr("height", height);
    svg.append("path").attr("class", "area").attr("d", function(d) {
        y.domain([0, food_groups[d.food_group].max]);
        return area(d.values);
    });
    svg.append("path").attr("class", "line").attr("d", function(d) {
        y.domain([0, food_groups[d.food_group].max]);
        return line(d.values);
    });
    svg.append("text").attr("class", "foodname").attr("dy", "1.1em").attr("dx", "0.4em").text(function(d) {
        return d.field;
    });
    // Focusing on mouseovers
    var focus = svg.append("g").attr("class", "focus").style("display", "none");
    focus.append("circle").attr("class", "marker").attr("r", 3);
    focus.append("text").attr("class", "value").attr("text-anchor", "middle").attr("dy", "-0.5em");

    svg.append("rect").attr("class", "overlay").attr("width", width).attr("height", height).on("mouseover", mouseover).on("mouseout", mouseout).on("mousemove", mousemove).on("click", mouseclick);

    // Scale control buttons
    d3.selectAll("#scalecontrol .button").on("click", function() {
        USER_SCALE = d3.select(this).attr("data-scale");
        d3.select("#scalecontrol .current").classed("current", false);
        d3.select(this).classed("current", true);

        rescale();
    });

    // Speed control buttons
    d3.selectAll("#speedcontrol .button").on("click", function() {
        var speed = d3.select(this).attr("data-speed");
        d3.select("#speedcontrol .current").classed("current", false);
        d3.select(this).classed("current", true);

        if (speed == "pause") {
            PAUSED = true;
        } else {
            USER_SPEED = +speed;
            if (PAUSED) {
                PAUSED = false;
                timer();
            }
        }
    });

    resort();

    function timer() {

        if (!PAUSED) {
            CURR_YEAR += 1;
            d3.select("#yearvalue").text(CURR_YEAR);

            // Resort accordingly
            resort();

            // Tick focus markers
            focus.style("display", null);
            var index = 0;

            focus.select("circle").attr("cx", x(CURR_YEAR)).attr("cy", function(d) {
                index = bisectYear(d.values, CURR_YEAR, 1);

                if (USER_SCALE == "item") {
                    y.domain([0, d.max_servings * scale_factor]);
                } else {
                    y.domain([0, food_groups[d.food_group].max]);
                }
                return y(d.values[index].value);
            });
            focus.select("text").attr("x", x(CURR_YEAR)).attr("y", function(d) {
                if (USER_SCALE == "item") {
                    y.domain([0, d.max_servings * scale_factor]);
                } else {
                    y.domain([0, food_groups[d.food_group].max]);
                }
                return y(d.values[index].value);
            }).text(function(d) {
                return numberFormat(d.values[index].value);
            });

            // Go again.
            if (CURR_YEAR == 2010) {
                CURR_YEAR = 1969;
                setTimeout(timer, USER_SPEED * 5);
            } else {
                setTimeout(timer, USER_SPEED);
            }

        }

    }
    timer();
    // setTimeout(timer, 1000);

    function resort() {

        var year_index = CURR_YEAR - START_YEAR;

        Object.keys(food_groups).forEach(function(grp, i) {

            var partial_domain = foods.filter(function(d) {
                return d.food_group == grp;
            }).sort(function(a, b) {
                return d3.descending(a.values[year_index].value, b.values[year_index].value);
            }).map(function(d, i) {
                return d.field;
            });
            var num_left = num_rows - partial_domain.length;

            if (num_left > 0) {
                var full_domain = partial_domain.concat(d3.range(num_left));
            } else {
                var full_domain = partial_domain;
            }

            var y1 = y0.domain(full_domain).copy();

            d3.select("#charts").selectAll("svg." + grp).sort(function(a, b) {
                return y1(a.field) - y1(b.field);
            });

            // if (PAUSED) {
            // 	var move_duration = 750;
            // } else {
            // 	var move_duration = USER_SPEED;
            // }

            var transition = d3.select("#charts").transition().duration(USER_SPEED)
              , delay = function(d, i) {
                return i * 50;
            };

            transition.selectAll("svg." + grp).delay(delay).style("top", function(d) {
                return y1(d.field) + "px";
            });

        });
    }

    function rescale() {
        svg.select("path.area").transition().duration(600).attr("d", function(d) {
            if (USER_SCALE == "item") {
                y.domain([0, d.max_servings * scale_factor]);
            } else {
                y.domain([0, food_groups[d.food_group].max]);
            }

            return area(d.values);
        });
        svg.select("path.line").transition().duration(600).attr("d", function(d) {
            if (USER_SCALE == "item") {
                y.domain([0, d.max_servings * scale_factor]);
            } else {
                y.domain([0, food_groups[d.food_group].max]);
            }
            return line(d.values);
        });

        focus.select("circle").transition().duration(600).attr("cy", function(d) {
            var index = CURR_YEAR - START_YEAR;
            if (USER_SCALE == "item") {
                y.domain([0, d.max_servings * scale_factor]);
            } else {
                y.domain([0, food_groups[d.food_group].max]);
            }
            return y(d.values[index].value);
        });
        focus.select("text").transition().duration(600).attr("y", function(d) {
            var index = CURR_YEAR - START_YEAR;
            if (USER_SCALE == "item") {
                y.domain([0, d.max_servings * scale_factor]);
            } else {
                y.domain([0, food_groups[d.food_group].max]);
            }
            return y(d.values[index].value);
        });
    }

    function mouseover() {
        if (PAUSED) {
            focus.style("display", null);
        }
    }

    function mouseout() {
        if (PAUSED) {
            focus.style("display", "none");
            d3.select("#yearvalue").text(CURR_YEAR);
        }
    }

    function mouseclick() {
        if (PAUSED) {

            var xmove = x.invert(d3.mouse(this)[0]);
            var index = bisectYear(focus.datum().values, xmove, 1);
            CURR_YEAR = START_YEAR + index;

            resort();
        }
    }

    function mousemove() {

        if (PAUSED) {
            var xmove = x.invert(d3.mouse(this)[0]);
            var index = 0;

            focus.select("circle").attr("cx", x(xmove)).attr("cy", function(d) {
                index = bisectYear(d.values, xmove, 1);

                d3.select("#yearvalue").text(START_YEAR + index);

                if (USER_SCALE == "item") {
                    y.domain([0, d.max_servings * scale_factor]);
                } else {
                    y.domain([0, food_groups[d.food_group].max]);
                }
                return y(d.values[index].value);
            });
            focus.select("text").attr("x", x(xmove)).attr("y", function(d) {
                if (USER_SCALE == "item") {
                    y.domain([0, d.max_servings * scale_factor]);
                } else {
                    y.domain([0, food_groups[d.food_group].max]);
                }
                return y(d.values[index].value);
            }).text(function(d) {
                return numberFormat(d.values[index].value);
            });
        }

        // var xmove = x.invert(d3.mouse(this)[0]),
        // 	i = bisectYear(data, xmove, 1);
        // var d0 = data[i - 1],
        // 	d1 = data[i],
        // 	d = xmove - d0.year > d1.year - xmove ? d1 : d0;
        // focus.attr("transform", "translate(" + x(d.year) + "," + y(d[field]) + ")");
        // focus.select("text.value").text(d[field]);
    }

});
// @end d3.tsv()

// For SVG text-wrapping
function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this), words = text.text().split(/\s+/).reverse(), word, line = [], lineNumber = 0, lineHeight = 1.2, // ems
        y = text.attr("y"), dy = parseFloat(text.attr("dy")), tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
                // tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

function type(d, i) {

    d3.keys(d).map(function(key) {
        d[key] = +d[key];
    });
    return d;

}
