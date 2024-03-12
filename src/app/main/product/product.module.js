(function ()
{
  'use strict';

  angular
    .module('app.product', [
      'app.product.product'
    ])
    .config(config)
  ;

  /** @ngInject */
  function config(msNavigationServiceProvider, $sceDelegateProvider)
  {
    $sceDelegateProvider.resourceUrlWhitelist(['**']);
    // Navigation
    /*msNavigationServiceProvider.saveItem('products', {
      title : 'Products',
      icon  : 'icon-cog',
      state: 'app.products_list'
    });*/
  }

})();
