(function ()
{
    'use strict';

    angular
        .module('app.product.product', ['multipleSelect', 'nvd3', 'lfNgMdFileInput', 'ui.sortable'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider)
    {
      // State
      $stateProvider.state('app.products_list', {
        url      : '/products',
        views    : {
          'content@app': {
            templateUrl: 'app/main/product/product/product.html',
            controller : 'ProductController'
          }
        },
        bodyClass: 'product'
      });
      // State
      $stateProvider.state('app.products_create', {
        url      : '/products/create',
        views    : {
          'content@app': {
            templateUrl: 'app/main/product/product/productEdit.html',
            controller : 'ProductEditController'
          }
        },
        resolve  : {
          DashboardData: function (msApi)
          {
            return msApi.resolve('dashboard.analytics@get');
          }
        },
        bodyClass: 'productEdit'
      });
      // State
      $stateProvider.state('app.products_edit', {
        url      : '/products/:id/edit',
        views    : {
          'content@app': {
            templateUrl: 'app/main/product/product/productEdit.html',
            controller : 'ProductEditController'
          }
        },
        resolve  : {
          DashboardData: function (msApi)
          {
            return msApi.resolve('dashboard.analytics@get');
          }
        },
        bodyClass: 'productEdit'
      });

      msApiProvider.register('dashboard.analytics', ['app/data/dashboard/analytics/data.json']);
    }

})();
