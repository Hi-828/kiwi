(function ()
{
  'use strict';

  angular
    .module('app.broadcast.broadcast')
    .controller('BroadcastEditController', BroadcastEditController);

  /** @ngInject */
  function BroadcastEditController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $q, $timeout)
  {
    BendAuth.checkAuth();

    // Data
    $scope.searchUsers = [];
    $scope.broadcast = {};
    $scope.createMode = true;
    $scope.isUploading = [];
    $scope.userData = "";

    $scope.CommonUtil = CommonUtil;
    var broadcastId = $stateParams.id;
    var loadFinished = false;

    if($stateParams.id) {
      $scope.createMode = false;

    } else {
      loadFinished = true;
      $scope.broadcast = {
        enabled:true,
        deleted:false,
        user:"",
        studio:"",
        topic:"",
        tokenGoal:0,
        tokensEarned:0,
        totalViewers:0,
        currentViewers:0,
        privateEnabled:false,
        minTokensForPrivate:0,
        allowObserversInPrivate:true,
        groupsEnabled:false,
        groupMinimum:0
      };
    }

    if(!$scope.createMode) {
      BendService.getBroadcast(broadcastId, function(ret){
        $scope.broadcast = ret;
        $scope.userData = $scope.broadcast.user.firstName + " " +  $scope.broadcast.user.lastName;
        if($scope.broadcast.startTime)
          $scope.startTime = new Date($scope.broadcast.startTime/1000000);
        if($scope.broadcast.endTime)
          $scope.endTime = new Date($scope.broadcast.endTime/1000000);

        $timeout(function(){
          loadFinished = true;
        }, 1000);
      })
    }

    BendService.getStudioList(function(rets){
      $scope.studios = rets;
    })

    $scope.update = function() {
      if(!$scope.createMode) {
        if(typeof $scope.userData != "string")
          $scope.broadcast.user = $scope.userData;

        if($scope.startTime) {
          $scope.broadcast.startTime = $scope.startTime.getTime() * 1000000;
        }
        if($scope.endTime) {
          $scope.broadcast.endTime = $scope.endTime.getTime() * 1000000;
        }
        BendService.updateBroadcast($scope.broadcast, function(product){
          $location.path("/broadcast");
        });
      }
    };

    $scope.save = function() {
      $scope.broadcast.user = $scope.userData;
      if($scope.startTime) {
        if(typeof $scope.startTime != 'string') {
          $scope.broadcast.startTime = $scope.startTime.getTime() * 1000000;
        }
      }
      if($scope.endTime) {
        if(typeof $scope.endTime != 'string') {
          $scope.broadcast.endTime = $scope.endTime.getTime() * 1000000;
        }
      }
      BendService.createBroadcast($scope.broadcast, function(broadcast){

        $location.path("/broadcast");
      });
    };

    $scope.delete = function() {
      var confirm = $mdDialog.confirm()
        .title('Would you like to delete this broadcast?')
        /*.textContent('You cannot recover deleted data.')*/
        /* .ariaLabel('Lucky day')*/
        .targetEvent($scope.$event)
        .clickOutsideToClose(true)
        .parent(angular.element(document.body))
        .ok('OK')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        BendService.deleteBroadcast($scope.broadcast._id, function(ret){
          $location.path("/broadcast");
        });
      }, function() {});

    };

    $scope.cancel = function() {
      $location.path("/broadcast");
    }

    $scope.changeValue = function() {
      console.log("changeValue");
    }

    $scope.$watch("endTime", function(newVal, oldVal){
      console.log(oldVal, newVal);
      if($scope.endTime && loadFinished)
        $scope.inputForm.$setDirty();
    })
    $scope.$watch("startTime", function(newVal, oldVal){
      console.log(oldVal, newVal);
      if($scope.startTime && loadFinished)
        $scope.inputForm.$setDirty();
    })
    /*BendService.searchUserList("l", function(rets){
      applyChangesOnScope($scope, function(){
        $scope.searchUsers = rets;
      })
    });*/

    $scope.searchUser = function(searchText) {
      if(searchText == "") {
        return;
      }

      var deferred = $q.defer();

      BendService.searchUserList(searchText, function(rets){
        deferred.resolve(rets);
      });

      return deferred.promise;
    }
  }
})();
