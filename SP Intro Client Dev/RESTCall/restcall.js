"use strict";
var RC = window.RC || {};
RC.currentSite = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;

RC.init = function () {
    var requests = [];

    var loadRequests = function() {
        $.ajax({
            url: RC.currentSite + "/_api/web/lists/getbytitle('IT Requests')/items",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: loadRequestsSuccess,
            error: loadRequestsError
        });
    };

    var loadRequestsSuccess = function (itResponse) {
        requests = [];
        var dataElement = document.getElementById('data');

        var it = itResponse.d.results;
        for (var i = 0; i < it.length; i++) {
            var item = {};
            item.ID = it[i].ID;
            item.BusinessUnit = it[i].BusinessUnit;
            item.Category = it[i].Category;
            item.Status = it[i].Status;
            if(it[i].DueDate != undefined)
                item.DueDate = new Date(it[i].DueDate);
            if(it[i].AssignedTo != undefined)
                item.Assigned = it[i].AssignedTo.Title.split(" ")[0];
            //Build an array
            requests.push(item);
            //Build DOM
            var newDiv = document.createElement("div");
            newDiv.innerText = item.BusinessUnit + " - " + item.Category + " - " + item.Status + " - " + item.DueDate + " - " + item.Assigned;
            dataElement.appendChild(newDiv);
        }
    };

    var loadRequestsError = function (sender, args) {
        alert(args.get_message());
    };

    loadRequests();
};

RC.init();