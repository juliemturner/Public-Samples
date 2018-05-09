"use strict";
import * as angular from "angular";

require('./styles/graphExcelStyle.scss');
require('./models');
require('./services');

angular.module("GraphExcel", ["ui.router", "GraphExcelData", "GraphExcelVM"])
    .config(uiRouteConfiguration)
    .constant("_CONFIG", {"adal": {
                                tenant: '<tenant guid>',
                                clientId: '<application id>',
                                endpoints: {
                                    graphUri: 'https://graph.microsoft.com'
                                },
                                cacheLocation: "sessionStorage"
                            },
                            "urlLibrary": "https://graph.microsoft.com/v1.0/sites/<site collection reference>/lists/<library guid>/",
    });

uiRouteConfiguration.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

function uiRouteConfiguration($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider, $locationProvider: angular.ILocationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    }).hashPrefix('!');

    $stateProvider
        .state('default', {
            template: '<dashboard-view></dashboard-view>'
        });

    //Initializes state to default, without changing the URL
    $urlRouterProvider.otherwise(function($injector) {
        let $state = $injector.get('$state');
        $state.go('default');
    })
}

require('./components');