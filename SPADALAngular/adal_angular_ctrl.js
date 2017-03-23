'use strict';
Sympraxis.adalangularapp.controller('ADALAngularCtrl', ['$rootScope', '$scope', '$http', 'adalAuthenticationService',
    function ADALAngularCtrl($rootScope, $scope, $http, adalService) {
        var msgraph = "https://graph.microsoft.com/v1.0/me";
        $scope.message = "Getting the data";
        $scope.data = {};

        if (adalService.userInfo.isAuthenticated) {
            $http.get(msgraph)
                .then(function (data) {
                    $scope.data = data.data;
                    $scope.message = "Got the data";
                })
                .catch(function (data) {
                    console.log(JSON.stringify(data));
                    $scope.message = "Couldn't get the data";
                });
        }
    }]);
