(function ()
{
    'use strict';

    angular
        .module('app.alert.alertTypes', ['ui.sortable'])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
      // State
      $stateProvider.state('app.alerts_alertTypes', {
        url      : '/alerts/types',
        views    : {
          'content@app': {
            templateUrl: 'app/main/alert/alerttypes/alerttype.html',
            controller : 'AlertTypeController'
          }
        },
        bodyClass: 'alerttype'
      });
    }

})();
