(function ()
{
    'use strict';

    angular
        .module('app.broadcast.broadcast', ['ngMaterialDatePicker'])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
      // State
      $stateProvider.state('app.broadcast_list', {
        url      : '/broadcast',
        views    : {
          'content@app': {
            templateUrl: 'app/main/broadcast/broadcast/broadcast.html',
            controller : 'BroadcastController'
          }
        },
        bodyClass: 'broadcast'
      });
      // State
      $stateProvider.state('app.broadcast_create', {
        url      : '/broadcast/create',
        views    : {
          'content@app': {
            templateUrl: 'app/main/broadcast/broadcast/broadcastEdit.html',
            controller : 'BroadcastEditController'
          }
        },
        bodyClass: 'broadcastEdit'
      });
      // State
      $stateProvider.state('app.broadcast_edit', {
        url      : '/broadcast/:id/edit',
        views    : {
          'content@app': {
            templateUrl: 'app/main/broadcast/broadcast/broadcastEdit.html',
            controller : 'BroadcastEditController'
          }
        },
        bodyClass: 'broadcastEdit'
      });
    }
})();
