var Sympraxis = window.Sympraxis || {};

// Get an array of values from the query string
Sympraxis.getQueryString = function() {

	var queryStringVals = {};
	var qs = location.search.slice(1).split('&');

	for (var i = 0; i < qs.length; i++) {
		var param = qs[i].split('=');
		var paramName = param[0];
		queryStringVals[paramName] = decodeURIComponent(param[1] || "");
	}
	return queryStringVals;

}

// Get current site url
Sympraxis.getCurrentSite = function(arr, attr, val) {
	return window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
};

//Get site collection url
Sympraxis.getCurrentSiteCollection = function() {
	return window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
}

// Returns a list item from an array
Sympraxis.getListItemByAttr = function(arr, attr, val) {
	var findNull = false;
	if(val === null)
		findNull = true;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i][attr] === val || (findNull && arr[i][attr] === null)) {
			return arr[i];
		}
	}
	return null;

};

// Returns a list item index from an array
Sympraxis.getListIdxByAttr = function(arr, attr, val) {

	for (var i = 0; i < arr.length; i++) {
		if (arr[i][attr] === val) {
			return i;
		}
	}
	return null;

};

//Updates a date field with time from text field
Sympraxis.amendTimeString = function(timeVal, dateVal, defaultDate){
	if(defaultDate != undefined && defaultDate instanceof Date && timeVal != undefined && timeVal.indexOf(":")>0){
		if(!(dateVal instanceof Date))
			dateVal = defaultDate;   
		var aTime = timeVal.split(":");
		if(aTime.length < 3){
			for(var t=0;t<3;t++){
				if(aTime.length <= t){
					aTime.push("0");
				}else{
					if(Number(aTime[t]) == NaN || Number(aTime[t]) > 60){
						aTime[t] = "0";
					}
				} 
			}
		}
		dateVal.setHours(Number(aTime[0]), Number(aTime[1]), Number(aTime[2]));
	}
	return dateVal;
};

//Encode + Decode XML
Sympraxis.encodeXml = function encodeXml(string) {
	var xml_special_to_escaped_one_map = {
		'&': '&amp;',
		'"': '&quot;',
		'<': '&lt;',
		'>': '&gt;'
	};
    return string.replace(/([\&"<>])/g, function(str, item) {
        return xml_special_to_escaped_one_map[item];
    });
};

Sympraxis.decodeXml = function decodeXml(string) {
	var escaped_one_to_xml_special_map = {
		'&amp;': '&',
		'&quot;': '"',
		'&lt;': '<',
		'&gt;': '>'
	};
    return string.replace(/(&quot;|&lt;|&gt;|&amp;)/g,
        function(str, item) {
            return escaped_one_to_xml_special_map[item];
    });
};
;