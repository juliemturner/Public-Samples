"use strict";
var BK = window.BK || {};
BK.currentSite = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
BK.Model = function() {
    var self = this;
    self.requests = ko.observableArray([]);

    function loadRequestsSuccess (itResponse) {
        var it = itResponse.d.results;
        for (var i = 0; i < it.length; i++) {
            var item = {};
            item.ID = it[i].ID;
            item.BusinessUnit = it[i].BusinessUnit;
            item.Category = it[i].Category;
            item.Status = it[i].Status;
            item.DueDate = null;
            if(it[i].DueDate != undefined){
                item.DueDate = new Date(it[i].DueDate);
                item.DueDate = (item.DueDate.getMonth() + 1)  + "/" + item.DueDate.getDate() + "/" + item.DueDate.getFullYear();
            }
            item.Assigned = null;
            if(it[i].AssignedTo != undefined)
                item.Assigned = it[i].AssignedTo.Title.split(" ")[0];
            //Build an array
            self.requests.push(item);    
        }
    };

    function loadRequestsError(sender, args) {
        alert(args.get_message());
    };
    
    $.ajax({
        url: BK.currentSite + "/_api/web/lists/getbytitle('IT Requests')/items?$select=ID,BusinessUnit,Category,Status,DueDate,AssignedTo/Title&$expand=AssignedTo",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: loadRequestsSuccess,
        error: loadRequestsError
    });
};

$(document).ready(function() {
    var element = document.getElementById("BasicKO");
    ko.applyBindings(new BK.Model(), element);
});
