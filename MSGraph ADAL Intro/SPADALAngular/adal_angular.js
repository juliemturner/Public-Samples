'use strict'
window.Sympraxis = window.Sympraxis || {};
Sympraxis.adalangularapp = angular.module('ADALAngular', ['ngRoute', 'AdalAngular'])
    .config(['$httpProvider', '$routeProvider', 'adalAuthenticationServiceProvider', '$locationProvider',
        function ($httpProvider, $routeProvider, adalProvider, $locationProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            }).hashPrefix('!');
            
            $routeProvider.when("/", {
                requireADLogin: true
            }).otherwise({ redirectTo: "/" });

            adalProvider.init(
                {
                    tenant: '<tenant id>',
                    clientId: '<client id>',
                    endpoints: {
                        'https://graph.microsoft.com': 'https://graph.microsoft.com'
                    }
                },
                $httpProvider
            );
        }]);
