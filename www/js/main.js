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
var data;
var txtBoxMapping = [];
var headerarray = [];
var resultData = [];
var arrayProperties = [];
$("#resultDisplay").hide();
var pagerOption = {
			container: $(".pager"),
			output: '{startRow} - {endRow} / {filteredRows} ({totalRows})',
			updateArrows: true,
			page: 0,
			size: 10,
			fixedHeight: false,
			removeRows: false,
			positionFixed: false,
			cssGoto:".pagenum",
			cssNext:'.next',
			cssPrev:'.prev',
			cssFirst:'.first',
			cssLast:'.last',
			cssPageDisplay:'.pagedisplay', 
			cssPageSize:'.pagesize', 
			cssErrorRow:'tablesorter-errorRow',
			cssDisabled:'disabled'
		}

	$.getJSON('data/data.json', function(json) {
		if (json) {
			UpdateTable(json);
			// scatter chart
			json.sort(function(a, b) { return d3.ascending(a.Title, b.Title); })
			settingPanel(json);
			data = json;
			update(data);
			weightCaculationUI(headerarray);
		}
	});

	$.extend($.tablesorter.themes.bootstrap, {
		table      : 'table table-bordered',
		header     : 'bootstrap-header',
		footerRow  : '',
		footerCells: '',
		icons      : '',
		sortNone   : 'bootstrap-icon-unsorted',
		sortAsc    : 'icon-chevron-up',
		sortDesc   : 'icon-chevron-down',
		active     : '',
		hover      : '',
		filterRow  : '',
		even       : '',
		odd        : ''
	});
		
	function UpdateTable(json){
		
		var rows = "",headers = "",len = json.length;
		
		$('#tbodydata').html('');
		for(h_name in json[0]){
		headers+='<th class="centeralign"><a href="javascript:void(0);" style="text-decoration:none" rel="tooltip" data-placement="bottom" title="' + h_name +'">' + h_name + '</a></th>';
		headerarray.push(h_name);
		}

		$('#tHeaders').html(headers);
		$('#tFooter').html(headers);

		for ( r=0; r < len; r++ ) {
			row = "";
			for ( c in json[r] ) {
				var editValue = fnConvertToValidValue(json[r][c]);
				row+="<td class='centeralign'>"+editValue+"</td>";
			}
			rows+="<tr>"+row+"</tr>"
		}
		$('#tbodydata').html(rows);

		$("#dataT")
		.tablesorter({
			theme: 'bootstrap',
			widthFixed: true,
			headerTemplate : '{content} {icon}',
			sortLocaleCompare: true,
			widgets : [ "uitheme", "filter", "zebra"],
			widgetOptions : {
			  zebra : ["even", "odd"],
			  filter_reset : ".reset"
			}		
		})		
		.tablesorterPager(pagerOption);
		
		$("[rel='tooltip']").tooltip();
	
	}

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
	
	
	function weightCaculationUI(headerdata){		
		var datapercol = Math.ceil((headerdata.length - 1)/3);
		var weightcalUIhtml = '<div class="row-fluid"><div class="span2"></div><div class="span3">';
		var columnbreak = 0;
		var spanheight = 14;
		var spanpadding = 0;
		if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
			spanheight = 24;
		}	
		for(var intIndex=1; intIndex < headerdata.length; intIndex++){
			weightcalUIhtml += '<div><div class="span5">' + headerdata[intIndex] + '</div><div class="span7"><div class="input-append span7"><input type="text" onkeypress="return numbersOnly(this,event,true,false);" id="' + headerdata[intIndex] +'"></input> <span class="add-on" style="height:'+spanheight+'px;padding-top:'+spanpadding+'px;">%</span></div></div></div>';
			columnbreak++;
			if(columnbreak == 5){
				columnbreak = 0;
				weightcalUIhtml += '</div><div class="span3">';
			}
		}	
		weightcalUIhtml += '</div></div>';
		$("#weightUI").html(weightcalUIhtml);
		var btnUI = '<div class="span1" ><input type="button" class="btn btn-success" value="Calculate" id="btncalc" onClick="calculateweight()"> </input></div>&nbsp;&nbsp;&nbsp;<div class="span1" ><input type="button" class="btn btn-danger" value="Reset" id="btncanc" onClick="cancelcalc()"> </input></div>';
		
		$("#btnspace").html(btnUI);
		clearData()
	}
	
	function calculateweight(){
		resultData = [];
		resultproperties = []; 
		for(var Index=0; Index < txtBoxMapping.length; Index++)
			arrayProperties.push(txtBoxMapping[Index].name);	
		var rowWeight;
		
		if(validateData()){
			$("#errortxt").hide();
			fnCopyArrayOfObjects(resultData, data, arrayProperties, arrayProperties, null);
			for(var intIndex=0; intIndex< resultData.length; intIndex++){
				rowWeight = 0;
				eachdataObj = resultData[intIndex];
				for(var intInnerIndex=0; intInnerIndex< txtBoxMapping.length; intInnerIndex++){
					var eachMapObj = txtBoxMapping[intInnerIndex];
					rowWeight += ((parseFloat(eachMapObj.value) / 100) * parseFloat(Math.abs(eachdataObj[eachMapObj.name])));
				}
				
				resultData[intIndex].RowWeight = rowWeight;  
			}	
			
			resultproperties.push('Title');
			for(var index=1; index < arrayProperties.length; index++){
				var ObjPropName = "Rank OF " + arrayProperties[index]; 
				resultproperties.push(ObjPropName);
				fnSortObjectDESC(resultData, arrayProperties[index]);
				for(var intIndex=0; intIndex < data.length; intIndex++){
					resultData[intIndex][ObjPropName] = intIndex + 1;
				}
			
			}
			fnSortObjectDESC(resultData, "RowWeight");
			for(var intIndex=0; intIndex < data.length; intIndex++){
				resultData[intIndex]["Over All Rank"] = intIndex + 1;
			}
			refreshAll(resultproperties);	
		}
		else{
			$("#errortxt").show();
			$("#resultDisplay").hide();
		}
	}
		
	function validateData(){
		var totalCount = 0;
		var validateData = true;
		var txtBoxes = $("#weightUI :input");
		var eachValue;
		var tempObj;
		txtBoxMapping = [];
		arrayProperties = ['Title'];
		for(var intIndex=0; intIndex < txtBoxes.length; intIndex++){
			tempObj = {};
			eachValue = (txtBoxes[intIndex].value == "" || txtBoxes[intIndex].value == "0") ? 0 : parseFloat(txtBoxes[intIndex].value);
			if(eachValue != 0){
				tempObj.name = txtBoxes[intIndex].id;
				tempObj.value = txtBoxes[intIndex].value;
				arrayProperties.push(txtBoxes[intIndex].id);
				txtBoxMapping.push(tempObj);
			}	
			totalCount = totalCount + eachValue;
		}
		if(totalCount > 100){
			$("#errortxt").html("Your total percentage value exceed than 100%, caculation cannot be continued. Please try again.");
			validateData = false;
		}
		if(totalCount == 0){
			$("#errortxt").html("Your total percentage value supplied is 0%, caculation cannot be continued. Please try again.");
			validateData = false;
		}
	return validateData; 		
	}
	
	function refreshAll(propertiestoshow){
		propertiestoshow.push("Over All Rank");
		var datadisplay = [];
		fnCopyArrayOfObjects(datadisplay, resultData, propertiestoshow, propertiestoshow, null);
		
		$("#resultset").trigger("destroy");
		var rows = "",headers = "",len = datadisplay.length;
		
		$('#tbodyresult').html('');
		for(h_name in datadisplay[0]){
			headers+='<th class="centeralign"><a href="javascript:void(0);" style="text-decoration:none" rel="tooltip" data-placement="bottom" title="' + h_name +'">' + h_name + '</a></th>';
			headerarray.push(h_name);
		}

		$('#tHeadersresult').html(headers);
		$('#tFooterresult').html(headers);

		for ( r=0; r < len; r++ ) {
			row = "";
			for ( c in datadisplay[r] ) {
				row+="<td class='centeralign'>"+datadisplay[r][c]+"</td>";
			}
			rows+="<tr>"+row+"</tr>"
		}
		$('#tbodyresult').html(rows);

		$("#resultset")
		.tablesorter({
			theme: 'bootstrap',
			widthFixed: true,
			headerTemplate : '{content} {icon}',
			sortLocaleCompare: true,
			widgets : [ "uitheme", "filter", "zebra"],
			
			widgetOptions : {
			  zebra : ["even", "odd"],
			  filter_reset : ".reset"
			}
		})		
		.tablesorterPager(pagerOption);
		
		$("[rel='tooltip']").tooltip();
		$("#resultDisplay").show();
		xrows = ["Title"];
		yrows = ["Title"];
		settingPanel(data);
		update(data);
		setGraph(data);
	}
		
	function clearData(){
		var txtBoxes = $("#weightUI :input");
		for(var intIndex=0; intIndex < txtBoxes.length; intIndex++){
			txtBoxes[intIndex].value = "";
		}		
	}
	
	function cancelcalc(){
		clearData();
		$("#errortxt").hide();
		$("#resultDisplay").hide();
		resultData = [];
		datadisplay = [];
		xrows = ["Title"];
		yrows = ["Title"];
		settingPanel(data);
		update(data);
		setGraph(data);
	}
	
	$(document).ready(function(){
		$("#bottompadding").html("<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>");
	});
	