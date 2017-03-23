var GraphExcel;
(function (GraphExcel) {
    //Configure ADAL function
    function configure($httpProvider, $locationProvider, adalProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        }).hashPrefix('!');
        adalProvider.init({
            tenant: '<your tenant id>',
            clientId: '<your client id>',
            endpoints: {
                'https://graph.microsoft.com': 'https://graph.microsoft.com'
            },
            cacheLocation: "localStorage",
            //endpoints you want ADAL to ignore, they are inclusive paths, also you must use relative paths, if you include http/https it will look for a resource and automatically append the token of the loginResource
            anonymousEndpoints: ['<your templates folder location>', '<your site collection>/_api/']
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
        "SP_EP": "https://graph.microsoft.com/beta/sharepoint/sites/<site guid>/lists/<list guid>/drive/"
    });
})(GraphExcel || (GraphExcel = {}));
