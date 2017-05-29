import cdndemoTemplate from './template.html';
import './styles/cdndemo.scss';

angular.module('CDNDemo', []).component('cdnDemo', {
      template: cdndemoTemplate,
      controllerAs: 'vm',
      controller: function () {
        this.title = "My CDN Demo";
        console.log("CDN Demo Loading");

        this.$onInit = function () {
          console.log("CDN Demo Loaded");
        };
      }
    }
  );// End Component()
