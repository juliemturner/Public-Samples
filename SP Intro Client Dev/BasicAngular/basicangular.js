"use strict";
var BA = window.BA || {};
BA.currentSite = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;

var myModule = angular.module('myApp', []);

myModule.factory("myAppService", function ($http) {
    var getData = function (list) {
        return $http({
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;odata=verbose',
                'accept': 'application/json;odata=verbose'
            },
            url: BA.currentSite + "/_api/web/lists/getbytitle('" + list + "')/items?$top=5000&$select=ID,BusinessUnit,Category,Status,DueDate,AssignedTo/Title&$expand=AssignedTo/Title"
        });
    };

    return {
        getData: getData
    };

});

myModule.component("basicAngular", {
    controllerAs: "vm",
    templateUrl: "/sites/juliedemos/Style%20Library/_demos/basicangular/basicangular_tmpl.html",
    controller: function myAppCtrl($timeout, myAppService) {
        var REQUESTS_LIST = "IT Requests";
        var self = this;
        self.requests = [];

        myAppService.getData(REQUESTS_LIST).then(function (response) {
            var data = response.data.d.results;
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var item = {};
                    item.ID = data[i].ID;
                    item.BusinessUnit = data[i].BusinessUnit;
                    item.Category = data[i].Category;
                    item.Status = data[i].Status;
                    if (data[i].DueDate != undefined)
                        item.DueDate = new Date(data[i].DueDate);
                    if (data[i].AssignedTo != undefined)
                        item.Assigned = data[i].AssignedTo.Title.split(" ")[0];
                    //Build an array
                    self.requests.push(item);
                }
                $timeout(function () { }, 0);
            }
        });
    }
});
