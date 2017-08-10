"use strict";
var DBD = window.DBD || {};
DBD.currentSite = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
DBD.Model;
DBD.DashboardModel = function () {
    var self = this;
    var REFRESH_SECONDS = 0; // 60000; //1 Minute
    var BUSINESSUNIT_DEFAULT = "All";
    var REQUESTS_LIST = "IT Requests";
    var itemObj = function() {
            return {Id: null, Title: null, Type: null, Abstract: null, Body: null, Application: null, Author: null, Created: null, Modified: null, Favorite: false, More: null};
        };
    var lastReload = ko.observable(new Date());
    var tics = new Date();
    var reloadHandle;

    self.selectedBusinessUnit = ko.observable(BUSINESSUNIT_DEFAULT);
    self.businessunit = ko.observableArray([BUSINESSUNIT_DEFAULT]);
    self.requests = [];

    self.lastReloadLabel = ko.computed(function () {
        return "Last Reload: " + (lastReload().getMonth() + 1) + "/" + lastReload().getDate() + "/" + lastReload().getFullYear() + " " + lastReload().getHours() + ":" + (lastReload().getMinutes().toString().length < 2?"0"+lastReload().getMinutes():lastReload().getMinutes());
    });

    var loadRequests = function() {
        $.ajax({
            url: DBD.currentSite + "/_api/web/lists/getbytitle('" + REQUESTS_LIST + "')/items?$top=5000&$select=ID,BusinessUnit,Category,Status,DueDate,AssignedTo/Title&$expand=AssignedTo/Title",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: loadRequestsSuccess,
            error: error
        });
    };

    var loadRequestsSuccess = function (itResponse) {
        lastReload(new Date());
        self.requests = [];

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
            self.requests.push(item);
        }
        
        loadBusinessUnits();
        self.chartRequestsByAssignee();
        self.chartAvgRequestWeekday();
        self.chartRequestByBusinessUnit();
        self.chartRequestStatusCount();
    };

    var loadBusinessUnits = function () {
        self.businessunit.removeAll();
        var allBU = []
        $(self.requests).each(function () {
            allBU.push(this.BusinessUnit);
        });
        var buList = []
        buList.push("All");
        $.each(allBU, function () {
            var bu = this.toString();
            if ($.inArray(bu, buList) == -1) {
                buList.push(bu);
            }
        });
        $.each(buList, function () {
            self.businessunit.push(this);
        });
    };

    self.chartRequestsByAssignee = function () {
        var assignedrequests = [];
        $.each(self.requests, function () {
            if (this.Assigned != null && (this.BusinessUnit == self.selectedBusinessUnit() || self.selectedBusinessUnit() == "All")) {
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
                    assignedrequests.push({ businessunit: bu, assigned: assigned, assignments: 1 });
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
            $.each(cat, function () {
                var bu = this;
                dataArray.push(getValueAssigned(assignedrequests, bu, assigned));
            });
            var item = { name: assigned, data: dataArray };
            val.push(item);
        });

        var Title = self.selectedBusinessUnit() == "All" ? "Requests by Assignee" : "Requests by Assignee for (" + self.selectedBusinessUnit() + ")";
        $('#RequestsByAssignee').highcharts({
            chart: { type: 'area', margin: [50, 50, 100, 80] }, title: { text: Title },
            legend: { enabled: true }, plotOptions: { bar: { dataLabels: { enabled: true } } },
            xAxis: { categories: cat, labels: { rotation: -30, align: 'right' } }, yAxis: { title: { text: 'Assignments' }, tickInterval: 50 }, series: val
        });
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

    self.chartAvgRequestWeekday = function () {
        var weeks = ((self.requests[self.requests.length - 1].DueDate - self.requests[0].DueDate) / (1000 * 60 * 60 * 24 * 7)).toFixed(0);
        var dailyRequests = [];

        $.each(self.requests, function () {
            if (this.BusinessUnit == self.selectedBusinessUnit() || self.selectedBusinessUnit() == "All") {
                var i = -1;
                var category = this.Category;
                $.each(dailyRequests, function (index) {
                    if (this.Category == category) {
                        i = index;
                        return false;
                    }
                });
                if (i == -1) {
                    dailyRequests.push({ Category: category, 
                        Data: [{ Day: 'Sunday', ReqCount: 0 }, 
                                { Day: 'Monday', ReqCount: 0 }, 
                                { Day: 'Tuesday', ReqCount: 0 }, 
                                { Day: 'Wednesday', ReqCount: 0 }, 
                                { Day: 'Thursday', ReqCount: 0 }, 
                                { Day: 'Friday', ReqCount: 0 }, 
                                { Day: 'Saturday', ReqCount: 0 }] });
                    dailyRequests[dailyRequests.length - 1].Data[this.DueDate.getDay()].ReqCount++;
                }
                else
                    dailyRequests[i].Data[this.DueDate.getDay()].ReqCount++;
            }
        });

        var cat = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var val = [];
        $.each(dailyRequests, function () {
            var dataArray = [];
            $.each(this.Data, function () {
                dataArray.push(Math.round((this.ReqCount / weeks) * 10) / 10);
            });
            val.push({ name: this.Category, data: dataArray });
        });

        var Title = self.selectedBusinessUnit() == "All" ? "Avg Requests per Day" : "Avg Requests per Day for (" + self.selectedBusinessUnit() + ")";
        $('#AvgRequestWeekday').highcharts({
            chart: { type: 'areaspline' }, title: { text: Title },
            legend: { enabled: true },
            xAxis: { categories: cat, plotBands: [{ from: -.5, to: .5, color: 'rgba(68, 170, 213, .2)' }, { from: 5.5, to: 6.5, color: 'rgba(68, 170, 213, .2)' }] },
            yAxis: { title: { text: 'Avg. Requests' } },
            plotOptions: { areaspline: { fillOpacity: 0.5 } },
            series: val
        });
    };

    self.chartRequestByBusinessUnit = function () {
        var catrequests = [];
        $.each(self.requests, function () {
            if (this.BusinessUnit == self.selectedBusinessUnit() || self.selectedBusinessUnit() == "All") {
                var i = -1;
                var cat = this.Category;
                var bu = this.BusinessUnit;
                $.each(catrequests, function (index) {
                    if (this.category == cat && this.businessunit == bu) {
                        i = index;
                        return false;
                    }
                });
                if (i == -1)
                    catrequests.push({ businessunit: bu, category: cat, requests: 1 });
                else
                    catrequests[i].requests++;
            }
        });

        var cat = [];
        var val = [];
        $.each(catrequests, function () {
            var bu = this.businessunit;
            if ($.inArray(bu, cat) == -1) {
                cat.push(bu);
            }
        });
        var c = [];
        $.each(catrequests, function () {
            var category = this.category;
            if ($.inArray(category, c) == -1) {
                c.push(category);
            }
        });
        $.each(c, function () {
            var category = this.toString();
            var dataArray = [];
            $.each(cat, function () {
                var bu = this;
                dataArray.push(getValueCategory(catrequests, bu, category));
            });
            var item = { name: category, data: dataArray };
            val.push(item);
        });

        var Title = self.selectedBusinessUnit() == "All" ? "Requests by Business Unit" : "Requests by Business Unit for (" + self.selectedBusinessUnit() + ")";
        $('#RequestByBusinessUnit').highcharts({
            chart: { type: 'column', margin: [50, 50, 100, 80] },
            title: { text: Title },
            legend: { enabled: true },
            tooltip: { formatter: function () { return '<b>' + this.x + '</b><br/>' + this.series.name + ': ' + this.y + '<br/>' + 'Total: ' + this.point.stackTotal; } },
            plotOptions: { column: { stacking: 'normal', dataLabels: { enabled: true, color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white' } } },
            xAxis: { categories: cat, labels: { rotation: -30, align: 'right' } },
            yAxis: { min: 0, title: { text: 'Requests' }, stackLabels: { enabled: true } },
            series: val
        });
    };

    function getValueCategory(lookupArray, bu, cat) {
        var retVal = 0;
        $.each(lookupArray, function () {
            if (this.category == cat && this.businessunit == bu) {
                retVal = this.requests;
                return false;
            }
        });
        return retVal;
    }

    self.chartRequestStatusCount = function () {
        var statusCount = [];
        $.each(self.requests, function () {
            if (this.BusinessUnit == self.selectedBusinessUnit() || self.selectedBusinessUnit() == "All") {
                var i = -1;
                var status = this.Status;
                $.each(statusCount, function (index) {
                    if (this[0] == status) {
                        i = index;
                        return false;
                    }
                });
                if (i == -1) {
                    statusCount.push([status, 0]);
                }
                else
                    statusCount[i][1]++;
            }
        });
        var dataArray = []
        for (var i = (statusCount.length - 1) ; i >= 0; i--) {
            dataArray.push(statusCount[i]);
        }

        var val = [{ name: 'Status Requests', data: dataArray }];

        var Title = self.selectedBusinessUnit() == "All" ? "Request Status" : "Request Status for (" + self.selectedBusinessUnit() + ")";
        $('#RequestStatusCount').highcharts({
            chart: { type: 'funnel', marginRight: 100 },
            title: { text: Title },
            plotOptions: { series: { dataLabels: { enabled: true, format: '<b>{point.name}</b> ({point.y:,.0f})', color: 'black', softConnector: true }, neckWidth: '30%', neckHeight: '25%' } },
            legend: { enabled: false },
            series: val
        });
    };

    var error = function (sender, args) {
        alert(args.get_message());
    };

    self.changeBusinessUnit = function () {
        localStorage.setItem("hcDemoBusinessUnit", JSON.stringify(self.selectedBusinessUnit()));
        self.chartRequestsByAssignee();
        self.chartAvgRequestWeekday();
        self.chartRequestByBusinessUnit();
        self.chartRequestStatusCount();
    };

    var reload = function (t) {
        reloadHandle = setTimeout("location.reload(true);", t);
    };

    self.InitData = function () {
        loadRequests();
        if (REFRESH_SECONDS > 0) {
            clearTimeout(reloadHandle);
            reload(REFRESH_SECONDS);
        }
    };
};

DBD.Initialize = function () {
    DBD.Model = new DBD.DashboardModel();
    var cookie = JSON.parse(localStorage.getItem("hcDemoBusinessUnit"))
    if (cookie != undefined) {
        $('#ddlBusinessUnit').val(cookie);
    }
    DBD.Model.InitData();
}


