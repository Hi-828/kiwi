(function ()
{
  'use strict';

  angular
    .module('app.users', [
      'app.users.userlist',
      'app.users.useredit'
    ])
    .config(config);

  /** @ngInject */
  function config(msNavigationServiceProvider)
  {
    // Navigation
    msNavigationServiceProvider.saveItem('users', {
      title : 'Users',
      icon  : 'icon-account-multiple',
      state: 'app.users_userlist'
    });
  }

})();
