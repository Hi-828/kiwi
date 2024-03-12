(function ()
{
    'use strict';

    angular
        .module('app.users.userlist', [ 'smDateTimeRangePicker', 'md.data.table'])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
      // State
      $stateProvider.state('app.users_userlist', {
        url      : '/users',
        views    : {
          'content@app': {
            templateUrl: 'app/main/users/userlist/userlist.html',
            controller : 'UsersController as vm'
          }
        },
        bodyClass: 'userlist'
      });
    }

})();
