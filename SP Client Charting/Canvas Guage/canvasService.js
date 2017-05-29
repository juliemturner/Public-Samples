'use strict'
CG.canvasDemo.factory("serviceCanvas", function ($http) {
    var REQUESTS_LIST = "IT Requests";

    var getRequests = function () {
        return $http({
            method: 'GET',
			headers: {
				'Content-Type': 'application/json;odata=verbose',
				'accept': 'application/json;odata=verbose'
			},
            url: CG.currentSite + "/_api/web/lists/getbytitle('" + REQUESTS_LIST + "')/items?$top=5000&$select=ID,BusinessUnit,Category,Status,DueDate,AssignedToId,AssignedTo/Title,AssignedTo/SipAddress&$expand=AssignedTo/Title,AssignedTo/SipAddress&$filter=(Status eq 'New') or(Status eq 'Active')",
            withCredentials: true
        });
    }
       
    return {
        getRequests: getRequests
    };
});