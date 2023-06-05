# NPM Libraries for SPFx

This sample shows the process of building external libraries (to be bundled or referenced as externals) into SharePoint Framework in liu of using a SharePoint library.

To run this solution you would need to spin up both Lib1 and Lib1-1 and have both serving up code via the `npm start` command. Then by either running the SPExt project in the online workbench of by using a developer build you can run the SharePoint Framework bootstap project to load the components into the UI.

## Note on running the libraries locally for development purposes

Both the Lib1 and Lib1-1 project use webpack-dev-server to bootstrap the components into a browser for development and testing. This requires a trusted root certificate to allow the endpoint to be served on a valid https endpoint. To create this certificate you can follow the instructions in this blog post: https://stackoverflow.com/questions/26663404/webpack-dev-server-running-on-https-web-sockets-secure