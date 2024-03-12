(function ()
{
  'use strict';

  angular
    .module('app.alert', [
      'app.alert.alertList',
      'app.alert.alertTypes'
    ])
    .config(config);

  /** @ngInject */
  function config(msNavigationServiceProvider)
  {
    // Navigation
    msNavigationServiceProvider.saveItem('alerts', {
      title : 'Alerts',
      icon  : 'icon-alert-box',
      weight: 1
    });

    msNavigationServiceProvider.saveItem('alerts.alertList', {
      title: 'Alerts List',
      state: 'app.alerts_alertList'
    });

    msNavigationServiceProvider.saveItem('alerts.alertTypes', {
      title: 'Manage Types',
      state: 'app.alerts_alertTypes'
    });
  }
})();
