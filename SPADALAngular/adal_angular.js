'use strict'

window.Sympraxis = window.Sympraxis || {};
Sympraxis.adalangularapp = angular.module('ADALAngular', ['AdalAngular'])
    .config(['$httpProvider', 'adalAuthenticationServiceProvider', '$locationProvider',
        function ($httpProvider, adalProvider, $locationProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            }).hashPrefix('!');

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
