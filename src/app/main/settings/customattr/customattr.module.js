(function ()
{
    'use strict';

    angular
        .module('app.settings.customattr', ['ui.sortable'])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
      // State
      $stateProvider.state('app.settings_customattr', {
        url      : '/customattr',
        views    : {
          'content@app': {
            templateUrl: 'app/main/settings/customattr/customattr.html',
            controller : 'CustomAttrController as vm'
          }
        },
        bodyClass: 'customattr'
      });
      // State
      $stateProvider.state('app.settings_customattr_create', {
        url      : '/customattr/create',
        views    : {
          'content@app': {
            templateUrl: 'app/main/settings/customattr/customedit.html',
            controller : 'CustomEditController as vm'
          }
        },
        bodyClass: 'customedit'
      });
      // State
      $stateProvider.state('app.settings_customattr_edit', {
        url      : '/customattr/:id/edit',
        views    : {
          'content@app': {
            templateUrl: 'app/main/settings/customattr/customedit.html',
            controller : 'CustomEditController as vm'
          }
        },
        bodyClass: 'customedit'
      });
    }

})();
