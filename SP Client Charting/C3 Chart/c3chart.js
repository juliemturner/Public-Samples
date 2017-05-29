"use strict";
var C3C = window.C3C || {};
C3C.currentSite = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;

C3C.init = function () {
    var REQUESTS_LIST = "IT Requests";
    var requests = [];
    var businessunit = [];
    var itemObj = function() {
            return {ID: null, BusinessUnit: null, Category: null, Status: null, DueDate: null, Assigned: null};
        };

    function getValueAssigned(lookupArray, bu, assigned) {
        var retVal = 0;
        $.each(lookupArray, function () {
            if (this.assigned == assigned && this.businessunit == bu) {
                retVal = this.assignments;
                return false;
            }
        });
        return retVal;
    }

    var loadRequests = function() {
        $.ajax({
            url: C3C.currentSite + "/_api/web/lists/getbytitle('" + REQUESTS_LIST + "')/items?$top=5000&$select=ID,BusinessUnit,Category,Status,DueDate,AssignedTo/Title&$expand=AssignedTo/Title&$filter=(Status eq 'New') or (Status eq 'Active')",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: loadRequestsSuccess,
            error: error
        });
    };

    var loadRequestsSuccess = function (itResponse) {
        requests = [];

        var it = itResponse.d.results;
        for (var i = 0; i < it.length; i++) {
            var item = itemObj();
            item.ID = it[i].ID;
            item.BusinessUnit = it[i].BusinessUnit;
            item.Category = it[i].Category;
            item.Status = it[i].Status;
            if(it[i].DueDate != undefined)
                item.DueDate = new Date(it[i].DueDate);
            if(it[i].AssignedTo != undefined)
                item.Assigned = it[i].AssignedTo.Title.split(" ")[0];
            requests.push(item);
        }
        
        chartRequestsByAssignee();
    };

    var chartRequestsByAssignee = function () {
        var assignedrequests = [];
        $.each(requests, function () {
            if (this.Assigned != null) {
                var i = -1;
                var assigned = this.Assigned;
                var bu = this.BusinessUnit;
                $.each(assignedrequests, function (index) {
                    if (this.assigned == assigned && this.businessunit == bu) { 
                        i = index;
                        return false;
                    }
                });
                if (i == -1)
                    assignedrequests.push({businessunit: bu, assigned: assigned, assignments: 1 });  
                else
                    assignedrequests[i].assignments++;
            }
        });

        var cat = [];
        var val = [];
        $.each(assignedrequests, function () {
            var bu = this.businessunit;
            if ($.inArray(bu, cat) == -1) {
                cat.push(bu);
            }
        });
        var a = [];
        $.each(assignedrequests, function () {
            var assigned = this.assigned;
            if ($.inArray(assigned, a) == -1) {
                a.push(assigned);
            }
        });
        $.each(a, function () {
            var assigned = this.toString();
            var dataArray = [];
            dataArray.push(assigned);
            $.each(cat, function () {
                var bu = this;
                dataArray.push(getValueAssigned(assignedrequests, bu, assigned));
            });
            val.push(dataArray);
        });
        cat.splice(0,0,'x');
        val.splice(0,0,cat);

        var Title = "Requests by Assignee";
        var reqByAssignee = c3.generate({
            bindto: '#chart',
            data: {
                x: 'x',
                columns: val,
                type: 'area'
            },
            axis: {
                x: {
                    type: 'category'
                }
            }
        });
    };

    var error = function (sender, args) {
        alert(args.get_message());
    };

    loadRequests();
};

C3C.init();