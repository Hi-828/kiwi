(function ()
{
  'use strict';

  angular
    .module('app.settings', [
      'app.settings.customattr',
      'app.settings.producttype',
      'app.settings.productCategory',
    ])
    .config(config);

  /** @ngInject */
  function config(msNavigationServiceProvider)
  {
    // Navigation
    msNavigationServiceProvider.saveItem('settings', {
      title : 'Settings',
      icon  : 'icon-cog',
      weight: 1
    });

    msNavigationServiceProvider.saveItem('settings.customattr', {
      title: 'User Attributes',
      state: 'app.settings_customattr'
    });

    msNavigationServiceProvider.saveItem('settings.producttype', {
      title: 'Product Types',
      state: 'app.settings_producttype'
    });

    msNavigationServiceProvider.saveItem('settings.productCategory', {
      title: 'Product Categories',
      state: 'app.settings_productCategory'
    });
  }
})();
