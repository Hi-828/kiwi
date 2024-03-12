(function ()
{
    'use strict';

    angular
        .module('app.settings.producttype', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
      // State
      $stateProvider.state('app.settings_producttype', {
        url      : '/producttype',
        views    : {
          'content@app': {
            templateUrl: 'app/main/settings/producttype/producttype.html',
            controller : 'ProductTypeController'
          }
        },
        bodyClass: 'producttype'
      });
    }

})();
