/**
 * Created with JetBrains WebStorm.
 * User: wa
 * Date: 8/21/13
 * Time: 12:30 PM
 * To change this template use File | Settings | File Templates.
 */

var HIDDEN_COLUMNS = ["StdDevDepth","TokensStopword","TokensPerSection","NetFlowPerSection"];

$.getJSON('data/data.json', function(json) {
    if (json) {
        // filter(json)
        UpdateTable(json);
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

function UpdateTable(json){

    var rows = "",headers = "",len = json.length;

    $('#tbodydata').html('');
    var i=1;
    var strHTMLCheckBoxes = "";
    for(h_name in json[0]){
        var test = document.getElementById("Test");
        test.innerHTML = h_name;
        var width = (test.clientWidth + 30) + "px";

        strHTMLCheckBoxes += '<li><input id="columnCheckbox_'+i+'" name="'+ h_name +'" type="checkbox" class="checkbox" checked  />    '+ h_name +'</li>';
        headers+='<th style="width:'+width+'!important;"><a href="javascript:void(0);" style="text-decoration:none" rel="tooltip" data-placement="bottom" title="' + h_name +'">' + h_name + ' </a><img style="right: 5px" src="img/selectcol2.png" class="menuclass" onclick="call(event)"/></th>';
        i++;
    }

    $('#ctxMenuCheckBoxes').html(strHTMLCheckBoxes);
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
            widthFixed: false,
            headerTemplate : '{content} {icon}',
            sortLocaleCompare: true,
            widgets : ["uitheme","filter"],
            widgetOptions : {
                filter_reset : ".reset"
            }
        });

    $("[rel='tooltip']").tooltip();
    // bind the checkboxs change event
    $("input[type='checkbox']").change(function(e) {
        toggleCheckBoxes(this);
    });

    defaultSetting();
}

function call(e){
//    e.preventDefault();
    $("#ctxMenu").hide();
    $("#ctxMenu").css('left', parseInt(e.pageX,10)-85);
    $("#ctxMenu").css('top', parseInt(e.pageY,10)+20);
    $("#ctxMenu").show();
}

function defaultSetting(){
    $("input[type='checkbox']").each(function(){
        columnName = this.name;
        if(HIDDEN_COLUMNS.indexOf(columnName) > -1){
            $(this).trigger('click');
        }
    });
    $("#ctxMenu").hide();
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
    //$("body").css("width",($('table').width() + parseInt((0.05 * screen.width),10)) + "px");
    //$("body").css("background-size",($('table').width() + parseInt((0.05 * screen.width),10) + 10) + "px");

    if(val)
        $('td:nth-child('+index+'),th:nth-child('+index+')').show();
    else
        $('td:nth-child('+index+'),th:nth-child('+index+')').hide();
}


$(document).ready(function(){
//    $("#ctxMenu").hide();
   // $("body").css("width",($('table').width() + parseInt((0.05 * screen.width),10)) + "px");
    //$("body").css("background-size",($('table').width() + parseInt((0.05 * screen.width),10)) + "px");
    $("body").bind('click', hide);
});
