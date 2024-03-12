(function ()
{
  'use strict';

  angular
    .module('app.dashboard', [
      'app.dashboard.dashboard'
    ])
    .config(config);

  /** @ngInject */
  function config(msNavigationServiceProvider)
  {
    // Navigation
    msNavigationServiceProvider.saveItem('dashboard', {
      title : 'Dashboard',
      icon  : 'icon-tile-four',
      state: 'app.dashboard_home'
    });
  }

})();
