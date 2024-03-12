(function ()
{
    'use strict';

    angular
        .module('app.message.message', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
      // State
      $stateProvider.state('app.message_list', {
        url      : '/message',
        views    : {
          'content@app': {
            templateUrl: 'app/main/message/message/message.html',
            controller : 'MessageController'
          }
        },
        bodyClass: 'message'
      });
    }
})();
