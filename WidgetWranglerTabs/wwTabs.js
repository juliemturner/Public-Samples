'use strict';
window.Sympraxis = window.Sympraxis || {};

Sympraxis.webPartTabs = angular.module('wwTabs', []);

Sympraxis.webPartTabs.controller('wwTabsCtr', ['$scope',
    function wwTabsCtr($scope) {
        function isDesignMode() {
            var pubEdit, wikiEdit = false;
            if (document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode != undefined)
                pubEdit = document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value;
            if (document.forms[MSOWebPartPageFormName]._wikiPageMode != undefined)
                wikiEdit = document.forms[MSOWebPartPageFormName]._wikiPageMode.value;
            var retVal = (pubEdit || wikiEdit).length > 0 ? true : false;
            return retVal;
        }

        $scope.editMode = isDesignMode();
        $scope.tabs = [];
        $scope.zones = [];
        $scope.tabSelected = null;
        $scope.isSelected = function(tab) {
            return $scope.tabSelected === tab;
        }
        $scope.tabClick = function (tab) {
            if (!$scope.editMode) {
                $scope.tabSelected = tab;
                $($scope.zones.join(', ')).hide();
                $(tab.zone).fadeIn(); //Fade in the active content
            }
            return false;
        };
    }
    ]).directive('wwTabs', function($timeout) {
        return {
            restrict: 'E',
            template: '<li ng-repeat="t in tabs" class="tab-title" ng-class="{active : isSelected(t)}"><a ng-click="tabClick(t)">{{t.title}}</a></li>',
            link: function link(scope, element, attrs) {
                var objTab = function() {
                    var obj = { zone: null, title: null };
                    return obj;
                }
                //Force delay so that page has completed loading all webparts
                $timeout(function() {
                    var elementWP = $(element).closest("div.ms-webpartzone-cell");
                    var root = $(element).closest("div.ms-webpart-zone");
                    var webParts = root.children();
                    var tabsCount = attrs.wwTabsCount;
                    if (tabsCount == undefined)
                        tabsCount = webParts.length;
                    else
                        tabsCount++; //Add one for wwTabs
                    var tabsIndex = $(webParts).index(elementWP);
                    if (tabsCount > (webParts.length - tabsIndex)) {
                        tabsCount = (webParts.length - tabsIndex);
                    }
                    tabsCount = tabsCount + tabsIndex;
                    $(webParts[tabsIndex]).css("margin", "0");
                    tabsIndex++;
                    for (var i = tabsIndex; i < tabsCount; i++) {
                        if (!scope.editMode) {
                            $(webParts[i]).find(".ms-webpart-chrome-title").addClass("hideWWTabs");
                        }
                        var t = new objTab();
                        t.zone = "#" + $(webParts[i]).attr("id");
                        var titleElement = $(webParts[i]).find("span.js-webpart-titleCell");
                        t.title = "Not Found";
                        if (titleElement.length > 0) {
                            t.title = titleElement.attr("title").split(" -")[0];
                        }
                        scope.tabs.push(t);
                        scope.zones.push(t.zone);
                    }
                    if (!scope.editMode && scope.tabs.length > 0) {
                        $(scope.zones.join(', ')).hide();
                        scope.tabClick(scope.tabs[0]);
                    }
                },0);
            }
        };
    });