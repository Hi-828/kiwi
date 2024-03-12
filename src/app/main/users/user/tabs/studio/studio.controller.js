(function ()
{
  'use strict';

  angular
    .module('app.users.useredit')
    .controller('UserStudioController', UserStudioController);

  /** @ngInject */
  function UserStudioController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $timeout, $sce)
  {
    BendAuth.checkAuth();
    console.log("UserStudioController");
    // Data
    $scope.CommonUtil = CommonUtil;
    var userId = $stateParams.id;
    $scope.user = {};
    $scope.studios = [];
    $scope.currentStudioMode = 0; //0:view, 1:create, 2:edit
    $scope.loadingPage = true;
    $rootScope.$broadcast("selectedUserTab", 5);

    async.parallel([
      function(callback){
        BendService.getUser(userId, function(ret){
          $scope.user = ret;
          callback(null, true);
        })
      },
      function(callback){
        BendService.getUserStudioList(userId, function(rets){
          $scope.studios = rets;
          callback(null, true);
        })
      }
    ], function(error, ret){
      $scope.loadingPage = false;
    })


    $scope.createStudio = function(ev) {
      $scope.currentStudioMode = 1;
      $scope.studio = {name:"", description:"", owner:$scope.user, enabled:true};
      $scope.openStudioDialog(ev);
    }

    $scope.editStudio = function(ev, item) {
      $scope.currentStudioMode = 2;
      $scope.studio = item;
      $scope.openStudioDialog(ev);
    }

    $scope.NoStudioData = function() {
      if($scope.studios.length > 0)
        return false;
      else
        return true;
    }

    $scope.openStudioDialog = function(ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
          controller: StudioEditController,
          templateUrl: 'app/main/users/user/tabs/studio/studio.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:false,
          fullscreen: useFullScreen,
          resolve: {
            mode: function () {
              return $scope.currentStudioMode;
            },
            studio:function () {
              return $scope.studio;
            },
            studios:function () {
              return $scope.studios;
            },
          }
        })
        .then(function(answer) {
          console.log(answer);
        }, function() {
          console.log('You cancelled the dialog.');
        });
      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });
    }
  }
})();

function StudioEditController($scope, $mdDialog, BendService, $rootScope, mode, studio, studios) {
  $scope.currentMode = mode;
  $scope.studio = studio;
  $scope.studios = studios;

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.save = function() {
    if($scope.currentMode == 1) {
      BendService.createStudio($scope.studio, function(ret){
        $scope.studios.push(ret);
        $scope.studio = ret;
      });
    } else {
      var data = _.clone($scope.studio);
      delete data.$$hashKey;
      BendService.updateStudio(data, function(ret){
      });
    }

    $mdDialog.cancel();
  }

  $scope.delete = function() {
    var confirm = $mdDialog.confirm()
      .title('Would you like to delete this studio?')
      /*.textContent('All of the banks have agreed to forgive you your debts.')
       .ariaLabel('Lucky day')*/
      .targetEvent($scope.$event)
      .clickOutsideToClose(true)
      .parent(angular.element(document.body))
      .ok('OK')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      BendService.deleteStudio($scope.studio, function(ret){
        var idx = $scope.studios.indexOf($scope.studio);
        $scope.studios.splice(idx, 1);
        $mdDialog.cancel();
      });
    }, function() {});
  }
}
