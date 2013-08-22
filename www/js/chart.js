/**
 * Created with JetBrains WebStorm.
 * User: wa
 * Date: 8/21/13
 * Time: 1:05 PM
 * To change this template use File | Settings | File Templates.
 */

var margin = {t:30, r:50, b:20, l:60 },
    w = 800 - margin.l - margin.r,
    h = 600 - margin.t - margin.b,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([h - 60, 0]),
    color = d3.scale.category10();

var svg = d3.select("#chart").append("svg")
    .attr("width", w + margin.l + margin.r)
    .attr("height", h + margin.t + margin.b);

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(20)
    .tickSubdivide(true)
    .tickSize(6, 3, 0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(20)
    .tickSubdivide(true)
    .tickSize(6, 3, 0)
    .orient("left");

var groups = svg.append("g").attr("transform", "translate(" + margin.l + "," + margin.t + ")");

var yAxis_data = ["Title"];
var xAxis_data = ["Title"];

$.getJSON('data/data.json', function(json) {
    if (json) {
        json.sort(function(a, b) { return d3.ascending(a.Title, b.Title); })
        settingPanel(json);
        update(json);
    }
});


function update(dataToRender){
    var x_min = d3.min(dataToRender, function(d) { return d[xAxis_data[0]]; });
    var x_max = d3.max(dataToRender, function(d) { return d[xAxis_data[0]];});

    var y_min = d3.min(dataToRender, function(d) { return d[yAxis_data[0]];});
    var y_max = d3.max(dataToRender, function(d) { return d[yAxis_data[0]];});
    for(s in yAxis_data){
        if(d3.min(dataToRender, function(d) { return d[yAxis_data[s]];}) < y_min){
            y_min = d3.min(dataToRender, function(d) { return d[yAxis_data[s]];});
        }

        if(d3.max(dataToRender, function(d) { return d[yAxis_data[s]];}) > y_max){
            var y_max = d3.max(dataToRender, function(d) { return d[yAxis_data[s]];});
        }
    }

    x.domain([x_min,x_max]);
    y.domain([y_min,y_max]);

    // remove old chart data
    svg.selectAll("rect").remove();
    svg.selectAll("text").remove();
    svg.selectAll("g.x").remove();
    svg.selectAll("g.y").remove();
    groups.selectAll("circle").remove();

    // what to do when we mouse over a bubble
    var mouseOn = function() {
        var circle = d3.select(this);

        // transition to increase size/opacity of bubble
        circle.transition()
            .duration(800).style("opacity", 1)
            .attr("r",10).ease("elastic");

        // append lines to bubbles that will be used to show the precise data points.
        // translate their location based on margins
        svg.append("g")
            .attr("class", "guide")
            .append("line")
            .attr("x1", circle.attr("cx"))
            .attr("x2", circle.attr("cx"))
            .attr("y1", +circle.attr("cy") + 10)
            .attr("y2", h - margin.t - margin.b)
            .attr("transform", "translate(60,20)")
            .style("stroke", circle.style("fill"))
            .transition().delay(200).duration(400).styleTween("opacity",
            function() { return d3.interpolate(0, .5); })

        svg.append("g")
            .attr("class", "guide")
            .append("line")
            .attr("x1", +circle.attr("cx")-5)
            .attr("x2", 0)
            .attr("y1", circle.attr("cy"))
            .attr("y2", circle.attr("cy"))
            .attr("transform", "translate(60,30)")
            .style("stroke", circle.style("fill"))
            .transition().delay(200).duration(400).styleTween("opacity",
            function() { return d3.interpolate(0, .5); });

        // function to move mouseover item to front of SVG stage, in case
        // another bubble overlaps it
        d3.selection.prototype.moveToFront = function() {
            return this.each(function() {
                this.parentNode.appendChild(this);
            });
        };

        // skip this functionality for IE9, which doesn't like it
        if (!$.browser.msie) {
            circle.moveToFront();
        }
    };
    // what happens when we leave a bubble?
    var mouseOff = function() {
        var circle = d3.select(this);

        // go back to original size and opacity
        circle.transition()
            .duration(800).style("opacity", .5)
            .attr("r",5).ease("elastic");

        // fade out guide lines, then remove them
        d3.selectAll(".guide").transition().duration(100).styleTween("opacity",
            function() { return d3.interpolate(.5, 0); })
            .remove()
    };

    var seriesNames = d3.keys(dataToRender[0]);
    // style the circles, set their locations based on data
    var circles =
        groups.selectAll("circle")
            .data(dataToRender)
            .enter();
    for(yd in yAxis_data){
        circles.append("circle")
            .attr("class", "circles")
            .attr({
                cx: function(d) { return x(+d[xAxis_data[0]]); },
                cy: function(d) { return y(+d[yAxis_data[yd]]); },
                r: 5,
                id: function(d) { return d.Title+"_"+xAxis_data[0]+"_"+yAxis_data[yd]; }
            })
            .style("fill", function(d) { return color(yd); })
            .on("mouseover", mouseOn)
            .on("mouseout", mouseOff)
            .append("title")
            .text(function(d) { return "x:"+d[xAxis_data[0]]+" y:"+d[yAxis_data[yd]]; })
    }

    $(".circles").tipsy({ gravity: 's'});

    // the legend color guide

    var legend = svg.selectAll("rect")
        .data(yAxis_data)
        .enter().append("rect")
        .attr({
            y: function(d, i) { return (40 + i*15); },
            x: w,
            width: 25,
            height: 12
        })
        .style("fill", function(d,i) {return color(i); });

    // legend labels
    svg.selectAll("text")
        .data(yAxis_data)
        .enter().append("text")
        .attr({
            y: function(d, i) { return (50 + i*15); },
            x: w + 30
        })
        .text(function(d) { return d;});

    // draw axes and axis labels
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.l + "," + (h - 60 + margin.t) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.l + "," + margin.t + ")")
        .call(yAxis);
}

function settingPanel(dataToRender){
    $("#xrows").html('');
    $("#yrows").html('');
    var radiobtnHTML = '<div class="row-fluid"><div class="span1"></div><div class="span2">';
    var chkboxHTML = '<div class="row-fluid"><div class="span1"></div><div class="span2">';
    var datapercol = Math.ceil((Object.keys(dataToRender[0]).length)/5);
    var columnbreak = 0;
    for(name in dataToRender[0]){

        radiobtnHTML += '<div><input type="radio" name="xAxis" value="'+name+'" /><span class="check">'+name+'</span></div>';
        chkboxHTML += '<div><input type="checkbox" name="yAxis" value="'+name+'" /><span class="check">'+name+'</span></div>';
        columnbreak++
        if(columnbreak == datapercol){
            radiobtnHTML += '</div><div class="span2">';
            chkboxHTML += '</div><div class="span2">';
            columnbreak = 0;
        }

    }
    radiobtnHTML += '</div></div>';
    chkboxHTML += '</div></div>';

    $("#xrows").html(radiobtnHTML);
    $("#yrows").html(chkboxHTML);
    $('#yrows :input:checkbox').live('change', function(){
        if($(this).is(':checked')){
            setGraph(dataToRender);
        } else {
            setGraph(dataToRender);
        }
    });

    $('#xrows :input:radio').live('change', function(){
        if($(this).is(':checked')){
            setGraph(dataToRender);
        }
    });
}

function setGraph(dataToRender){
    var yrows = [],xrows = [];
    $.each($("input[name='yAxis']:checked"), function() {
        yrows.push($(this).val());
    });
    if(yrows.length < 1){yrows = ["Title"]}
    yAxis_data = yrows;

    $.each($("input[name='xAxis']:checked"), function() {
        xrows.push($(this).val());
    });
    if(xrows.length < 1){xrows = ["Title"]}
    xAxis_data = xrows;
    update(dataToRender);
}
