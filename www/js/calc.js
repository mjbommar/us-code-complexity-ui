/**
 * Created with JetBrains WebStorm.
 * User: wa
 * Date: 8/21/13
 * Time: 12:50 PM
 * To change this template use File | Settings | File Templates.
 */

var headerarray = [];
var data = [];
var txtBoxMapping = [];
var resultData = [];
var arrayProperties = [];
$("#resultDisplay").hide();

$.getJSON('data/data.json', function(json) {
    if (json) {
        headerarray = new Array();
        for(h_name in json[0]){
            headerarray.push(h_name);
        }
        data = json;
        weightCaculationUI(headerarray);
    }
});

$.extend($.tablesorter.themes.bootstrap, {
    table      : 'table',
    header     : '',
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
        weightcalUIhtml += '<div><div class="span6" style="font-weight:bold">' + headerdata[intIndex] + '</div><div class="span6"><div class="input-append span7"><input type="text" onkeypress="return numbersOnly(this,event,true,false);" id="' + headerdata[intIndex] +'"></input> <span class="add-on" style="height:'+spanheight+'px;padding-top:'+spanpadding+'px;">%</span></div></div></div>';
        columnbreak++;
        if(columnbreak == 5){
            columnbreak = 0;
            weightcalUIhtml += '</div><div class="span3">';
        }
    }
    weightcalUIhtml += '</div></div>';
    $("#weightUI").html(weightcalUIhtml);
    var btnUI = '<input type="button" class="btn btn-primary" value="Calculate" id="btncalc" onClick="calculateweight()"><input style="margin-left: 10px;" type="button" class="btn" value="Reset" id="btncanc" onClick="cancelcalc()"> </input>';

    $("#btnspace").html(btnUI);
    clearData()
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
    $('#ctxMenuCheckBoxes').html('');
    var i=1;
    var strHTMLCheckBoxes = "";

    for(h_name in datadisplay[0]){
        // strHTMLCheckBoxes += '<li><input type="checkbox" class="checkbox" checked onchange="toggleCheckBoxes(' + i +',this.checked)" />    '+ h_name +'</li>';
        // headers+='<th class="centeralign"><a href="javascript:void(0);" style="text-decoration:none" rel="tooltip" data-placement="bottom" title="' + h_name +'">' + h_name + '</a><img style="right: 5px;" src="img/selectcol2.png" class="menuclass" onclick="call(event)"/></th>';
        strHTMLCheckBoxes += '<li><input id="columnCheckbox_'+i+'" name="'+ h_name +'" type="checkbox" class="checkbox" checked  />    '+ h_name +'</li>';
        headers+='<th class="centeralign"><a href="javascript:void(0);" style="text-decoration:none" rel="tooltip" data-placement="bottom" title="' + h_name +'">' + h_name + ' </a><img style="right: 5px;height:12px;" src="img/selectcol2.png" class="menuclass" onclick="call(event)"/></th>';
        i++;
    }
    $('#ctxMenuCheckBoxes').html(strHTMLCheckBoxes);
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
            widgets : [ "uitheme", "filter"],

            widgetOptions : {
                filter_reset : ".reset"
            }
        });

    $("[rel='tooltip']").tooltip();
    $("#resultDisplay").show();
    // bind the checkboxs change event
    $("input[type='checkbox']").change(function(e) {
        toggleCheckBoxes(this);
    });
}

function call(e){
    $("#ctxMenu").hide();
    e.preventDefault();

    $("#ctxMenu").css('left', parseInt(e.pageX,10)-85);
    $("#ctxMenu").css('top', parseInt(e.pageY,10));
    $("#ctxMenu").show();
}

function hide(event){
    if(event.target.className == "menuclass" || event.target.className == "checkbox" )
        $("#ctxMenu").show();
    else
        $("#ctxMenu").hide();


}

function toggleCheckBoxes(checkbox){
    id = checkbox.id;
    index = id.substr(id.indexOf('_')+1)
    val = checkbox.checked;
    if(val)
        $('td:nth-child('+index+'),th:nth-child('+index+')').show();
    else
        $('td:nth-child('+index+'),th:nth-child('+index+')').hide();
}


$(document).ready(function(){
    $("#ctxMenu").hide();
    $("body").bind('click', hide);
});

