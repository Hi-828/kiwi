(function ()
{
    'use strict';

    angular
        .module('app.settings.productCategory', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
      // State
      $stateProvider.state('app.settings_productCategory', {
        url      : '/productCategory',
        views    : {
          'content@app': {
            templateUrl: 'app/main/settings/productcategory/productCategory.html',
            controller : 'ProductCategoryController'
          }
        },
        bodyClass: 'productCategory'
      });
    }

})();
