(function ()
{
    'use strict';

    angular
        .module('fuse')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, $timeout, $state)
    {
        // Activate loading indicator
        var stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams)
        {
            $rootScope.loadingProgress = true;
        });

        // De-activate loading indicator
        var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function ()
        {
            $timeout(function ()
            {
                $rootScope.loadingProgress = false;
            });
        });

        // Store state in the root scope for easy access
        $rootScope.state = $state;

        // Cleanup
        $rootScope.$on('$destroy', function ()
        {
            stateChangeStartEvent();
            stateChangeSuccessEvent();
        });

      $rootScope.globalData = {
        state:{
          selectedUser:null,
          userTabIndex:0,
          selectedProductType:null
        },
        data:{
          productTypes:[],
          userAvatar:{}
        }
      }

      //console.log("here", $rootScope.globalData);
/*
      {
      }
*/
    }

  var initInjector = angular.injector(['ng','bend','app.bend.auth','app.bend.service']);
    var BendAuthBootstrap = initInjector.get('BendAuthBootstrap');
    BendAuthBootstrap.bootstrapService(function(ret){
      //console.log(ret);
    });
})();

function applyChangesOnScope(scope, func) {
  if (!scope.$$phase) {
    scope.$apply(function () { // need digest
      func();
    });
  }
  else {
    func();
  }
}
