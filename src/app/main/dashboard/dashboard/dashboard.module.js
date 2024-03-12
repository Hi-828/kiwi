(function ()
{
    'use strict';

    angular
        .module('app.dashboard.dashboard', ['nvd3'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider)
    {
      // State
      $stateProvider.state('app.dashboard_home', {
        url      : '/',
        views    : {
          'content@app': {
            templateUrl: 'app/main/dashboard/dashboard/dashboard.html',
            controller : 'DashboardController as vm'
          }
        },
        resolve  : {
          DashboardData: function (msApi)
          {
            return msApi.resolve('dashboard.data@get');
          }
        },
        bodyClass: 'dashboard'
      });

      msApiProvider.register('dashboard.data', ['app/data/dashboard/data/data.json']);
    }

})();
