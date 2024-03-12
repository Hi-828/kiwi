(function ()
{
  'use strict';

  /**
   * Main module of the Fuse
   */
  angular
    .module('fuse', [

      // Core
      'app.core',

      // Navigation
      'app.navigation',

      // Toolbar
      'app.toolbar',

      // Quick panel
      'app.quick-panel',

      //add roar modules
      'app.bend',
      'app.directives',
      'app.common',
      'app.auth',
      /*'app.dashboard',*/
      'app.users',
      'app.message',
      'app.broadcast',
      'app.product',
      'app.alert',
      'app.settings',
      'rt.asyncseries'
    ]);
})();
