(function ()
{
  'use strict';

  angular
    .module('app.message', [
      'app.message.message',
     /* 'app.broadcast.broadcastEdit'*/
    ])
    .config(config);

  /** @ngInject */
  function config(msNavigationServiceProvider)
  {
    // Navigation
    msNavigationServiceProvider.saveItem('message', {
      title : 'Messages',
      icon  : 'icon-message-text',
      state: 'app.message_list'
    });
  }

})();
