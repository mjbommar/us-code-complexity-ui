	function fnCopyArrayOfObjects(ArrayTo, ArrayFrom, ArrayToProperties, ArrayFromProperties, DefaultTemplate){
		var strErrorMessage = "";
		if (ArrayFrom == null){
			alert("Source Array is null.");
			return;
		}

		if (ArrayFromProperties == null){
			alert("Property array of source is not specified");
			return;
		}

		if (ArrayToProperties == null){
			alert("Property array of destination is not specified");
			return;
		}

		if (ArrayToProperties.length != ArrayFromProperties.length){
			alert("Source and Destination property information length is not same.");
			return;
		}

		if (ArrayTo == null)
			ArrayTo = new Object();

		if (ArrayFrom.length <= 0)
			return;

		for (var intRowIndex = 0; intRowIndex < ArrayFrom.length; intRowIndex++){
			drSynchFrom = ArrayFrom[intRowIndex];

			var drNewRow = null;
			if (DefaultTemplate == null)
				drNewRow = new Object();
			
			for (var intPropertyIndex = 0; intPropertyIndex < ArrayFromProperties.length; intPropertyIndex++){
				var strSourcePropertyName = ArrayFromProperties[intPropertyIndex];
				if (drSynchFrom[strSourcePropertyName] == undefined) // Requested property isn't defined into source object.
					continue;

				var strTargetPropertyName = ArrayToProperties[intPropertyIndex];
				drNewRow[strTargetPropertyName] = drSynchFrom[strSourcePropertyName];
			}
			ArrayTo.push(drNewRow);
		}
	}

	
	function numbersOnly(Sender,evt,isFloat,isNegative) {
		if(Sender.readOnly) return false;       

		var key   = evt.which || !window.event ? evt.which : event.keyCode;
		var value = Sender.value;
		
		if(key == 13){	//Enter Pressed
			calculateweight();
			return;
		}
			

		if((key == 46 || key == 44) && isFloat){                
			var selected = document.selection ? document.selection.createRange().text : "";
			if(selected.length == 0 && value.indexOf(".") == -1 && value.length > 0) Sender.value += ".";
			return false;
		}
		if(key == 45) { // minus sign '-'
			if(!isNegative) return false;
			if(value.indexOf('-')== -1) Sender.value = '-'+value; else Sender.value = value.substring(1);
			if(Sender.onchange != null) {
				if(Sender.fireEvent){
					Sender.fireEvent('onchange');
				} else {
					var e = document.createEvent('HTMLEvents');
						e.initEvent('change', false, false);
					Sender.dispatchEvent(e);
				}
			}

			var begin = Sender.value.indexOf('-') > -1 ? 1 : 0;
			if(Sender.setSelectionRange){
				Sender.setSelectionRange(begin,Sender.value.length);
			} else {
				var range = Sender.createTextRange();
				range.moveStart('character',begin);
				range.select();                 
			}

			return false;
		}
		if(key > 31 && (key < 48 || key > 57)) return false;
		
		
	}
	
	function fnSortObjectASC(SourceArray, Property){
		SourceArray.sort(function(obj1, obj2){
			if (obj1[Property] == null)
				return -1;

			if (obj2[Property] == null)
				return 1;

			if (obj1[Property] == obj2[Property])
				return 0; // 0 means 'obj1' & 'obj1' both are equal property  do nothing

			if (obj1[Property] > obj2[Property])
				return 1; // 1 means 'obj1' should be placed after 'obj2'.

			if (obj1[Property] < obj2[Property])
				return -1; // -1 means 'obj2' should be placed after 'obj1'.
		});
	}
	
	function fnSortObjectDESC(SourceArray, Property){
		fnSortObjectASC(SourceArray, Property);
		SourceArray.reverse();
	}
	
	function fnConvertToValidValue(SourceValue) {
		if(fnIsValidFloat(SourceValue)){
			return parseFloat(SourceValue.toFixed(4));
		}
		return SourceValue;
	}
	
	function fnIsValidFloat(SourceValue) {
    if (arguments.length != 1) // Only one argument needs to supply.
        alert("One argument needs to supply to check it's valid float.double or not.");
	
	if(SourceValue.toString().indexOf('.') < 0)
		return false;
		
    if (isNaN(SourceValue))
        return false;

    return true;
}

function filter(arrValue){
    for(var intIndex=0; intIndex< arrValue.length; intIndex++){
        var eachObj = arrValue[intIndex];
        for(var eachproperty in eachObj){
            if(eachproperty.trim() == "StdDevDepth" || eachproperty.trim() == "TokensStopword" || eachproperty.trim() == "TokensPerSection" || eachproperty.trim() == "NetFlowPerSection" ){
                delete eachObj[eachproperty];
            }
        }
    }
}