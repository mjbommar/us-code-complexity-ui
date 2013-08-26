/**
 * Created with JetBrains WebStorm.
 * User: wa
 * Date: 8/21/13
 * Time: 12:30 PM
 * To change this template use File | Settings | File Templates.
 */


$.getJSON('data/data.json', function(json) {
    if (json) {
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
    for(h_name in json[0]){
        headers+='<th class="centeralign"><a href="javascript:void(0);" style="text-decoration:none" rel="tooltip" data-placement="bottom" title="' + h_name +'">' + h_name + '</a></th>';
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
            widthFixed: false,
            headerTemplate : '{content} {icon}',
            sortLocaleCompare: true,
            widgets : ["uitheme","filter"],
            widgetOptions : {
                filter_reset : ".reset"
            }
        });


    $("[rel='tooltip']").tooltip();

}
