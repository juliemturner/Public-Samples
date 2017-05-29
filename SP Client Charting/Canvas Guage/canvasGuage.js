'use strict'
window.CG = window.CG || {};
CG.currentSite = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;

CG.canvasDemo = angular.module('CanvasDemo', []);

CG.canvasDemo.controller('CDCtrl',['$scope', 'serviceCanvas', function CDCtrl($scope, serviceCanvas) {
        $scope.MaxRequests = 500;
        $scope.Users = [];
        var requests = [];

        var itemObj = function() {
            return {ID: null, BusinessUnit: null, Category: null, Status: null, DueDate: null, Assigned: null, Username: null, UserId: null};
        };

        serviceCanvas.getRequests().then(function successResponse (itResponse){
            var it = itResponse.data.d.results;
            for (var i = 0; i < it.length; i++) {
                var item = itemObj();
                item.ID = it[i].ID;
                item.BusinessUnit = it[i].BusinessUnit;
                item.Category = it[i].Category;
                item.Status = it[i].Status;
                if(it[i].DueDate != undefined)
                    item.DueDate = new Date(it[i].DueDate);
                item.UserId = it[i].AssignedToId;
                if(it[i].AssignedTo != undefined){
                    item.Assigned = it[i].AssignedTo.Title;
                    item.Username = it[i].AssignedTo.SipAddress;
                }
                requests.push(item);
            }

            for(var r = 0; r < requests.length; r++) {
                var req = requests[r];
                if (req.Assigned != null) {
                    var idx = -1;
                    var assigned = req.Assigned;
                    var bu = req.BusinessUnit;
                    for(var u = 0; u < $scope.Users.length; u++){
                        if (assigned === $scope.Users[u].assigned) { 
                            idx = u;
                            break;
                        }
                    }

                    if (idx === -1){
                        var userImage = "/_layouts/15/userphoto.aspx?size=L&accountname=" + req.Username + "&url=";
                        $scope.Users.push({assigned: assigned, userid: req.userid, firstname: assigned.split(" ")[0], image: userImage, assignments: 1 });  
                    }else{
                        $scope.Users[idx].assignments++;
                    }
                }
            }
        });
    }]);