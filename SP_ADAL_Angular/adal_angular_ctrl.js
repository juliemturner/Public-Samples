'use strict';
Sympraxis.adaltestapp.controller('ADALTestCtrl', ['$rootScope', '$scope', '$http', 'adalAuthenticationService',
    function ADALTestCtrl($rootScope, $scope, $http, adalService) {
        var msgraph = "https://graph.microsoft.com/v1.0/me";
        $scope.message = "Getting the data";
        $scope.data = {};
        
        // if ((!adalService.userInfo.isAuthenticated || adalService.userInfo.userName.length < 1) && !adalService.loginInProgress()) {
        //     adalService.info('Start login at:' + window.location.href);
        //     $rootScope.$broadcast('adal:loginRedirect');
        //     adalService.login();
        // }
        

        if(adalService.userInfo.isAuthenticated){
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
