'use strict'

window.Sympraxis = window.Sympraxis || {};
Sympraxis.adaltestapp = angular.module('ADALTestApp', ['AdalAngular'])
    .config(['$httpProvider', 'adalAuthenticationServiceProvider', '$locationProvider',
            function ($httpProvider, adalProvider, $locationProvider) {
                $locationProvider.html5Mode({
                    enabled: true,
                    requireBase: false
                }).hashPrefix('!');
            // $routeProvider.when("/", {
            //     controller: "ADALTestCtrl",
            //     templateUrl: "/sites/Julie/_catalogs/masterpage/_ADALTest/html/adaltestview.html",
            //     requireADLogin: true
            // }).otherwise({ redirectTo: "/" });
            //clientId: '45c1ba25-1b90-44fd-8ab9-cfb2f45920e8', ADALTest
            //tenant: '5a3f949f-70ba-467b-b915-b40feeadc67d',
            adalProvider.init(
                {
                    tenant: '5a3f949f-70ba-467b-b915-b40feeadc67d',
                    //tenant: '72f988bf-86f1-41af-91ab-2d7cd011db47',
                    clientId: '799eab9f-6e8e-42fd-b1a4-90f784b1356e',
                    //clientId: 'ywNSNzr79AOAFEaTfHFWfn31QSyw5XTuVcwrIrSuqxM=',
                    endpoints: {
                        'https://graph.microsoft.com': 'https://graph.microsoft.com'
                    }
                },
                $httpProvider
            );
        }]);




// instance: 'https://login.microsoftonline.com/',
// extraQueryParameter: 'nux=1',
// endpoints: {
//     'https://graph.microsoft.com/v1.0/me': 'https://graph.microsoft.com'
// }