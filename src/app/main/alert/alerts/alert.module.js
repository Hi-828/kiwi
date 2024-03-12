(function ()
{
    'use strict';

    angular
        .module('app.alert.alertList', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
      // State
      $stateProvider.state('app.alerts_alertList', {
        url      : '/alerts/alert',
        views    : {
          'content@app': {
            templateUrl: 'app/main/alert/alerts/alert.html',
            controller : 'AlertController'
          }
        },
        bodyClass: 'alert'
      });
    }

})();
