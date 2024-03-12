(function ()
{
  'use strict';

  angular
    .module('app.broadcast', [
      'app.broadcast.broadcast',
     /* 'app.broadcast.broadcastEdit'*/
    ])
    .config(config);

  /** @ngInject */
  function config(msNavigationServiceProvider)
  {
    // Navigation
    msNavigationServiceProvider.saveItem('broadcast', {
      title : 'Broadcasts',
      icon  : 'icon-view-list',
      state: 'app.broadcast_list'
    });
  }

})();
