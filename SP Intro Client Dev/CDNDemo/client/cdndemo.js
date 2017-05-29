angular.module('CDNDemo', []).component('cdnDemo', {
      templateUrl: '/sites/cdn/Code/CDN/cdndemo.html',
      controllerAs: 'vm',
      controller: function () {
        this.title = "My CDN Demo";
        console.log("CDN Demo Loading");

        this.$onInit = function () {
          console.log("CDN Demo Loaded");
        };
      }
    }
  );