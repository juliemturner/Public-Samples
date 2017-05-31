var GraphExcel;
(function (GraphExcel) {
    //Configure ADAL function
    function configure($httpProvider, $locationProvider, adalProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        }).hashPrefix('!');

        adalProvider.init({
            tenant: '<tenant guid>',
            clientId: '<application id>',
            endpoints: {
                'https://graph.microsoft.com': 'https://graph.microsoft.com'
            },
            cacheLocation: "sessionStorage",
            //endpoints you want ADAL to ignore, they are inclusive paths, also you must use relative paths, if you include http/https it will look for a resource and automatically append the token of the loginResource
            anonymousEndpoints: ['/sites/juliedemos', '/sites/juliedemos/_api/']
        }, $httpProvider);
    }
    //Module dependencies
    configure.$inject = ["$httpProvider", "$locationProvider", "adalAuthenticationServiceProvider"];
    //Declare module and add ADAL configuration and constants
    angular
        .module("GraphExcel", ['AdalAngular'])
        .config(configure)
        .constant("_CONFIG", {
        "ONEDRIVE_EP": "https://graph.microsoft.com/v1.0/me/drive/", //if you want to try it against onedrive
        "SP_EP": "https://graph.microsoft.com/beta/sites/<contoso.sharepoint.com>,<_api/site/id>,<_api/site/rootweb/id>/lists/<list guid>/drive/"
    });
})(GraphExcel || (GraphExcel = {}));
