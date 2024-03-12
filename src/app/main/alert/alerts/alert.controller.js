(function ()
{
    'use strict';

    angular
        .module('app.alert.alertList')
        .controller('AlertController', AlertController);

    /** @ngInject */
    function AlertController($scope, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $cookies)
    {
      BendAuth.checkAuth();
      $scope.alertList = [];
      $scope.alertTypeList = [];
      $scope.alert = {};
      $scope.CommonUtil = CommonUtil;
      $scope.dirtyOrder = false;
      $scope.loadingPage = true;

      if($cookies.get('alertFilter')) {
        $scope.alertFilter = Number($cookies.get('alertFilter'));
      } else {
        $scope.alertFilter = 0;
      }

      BendService.getAlertList(function(rets){
        console.log(rets);
        $scope.alertList = rets;
        $scope.loadingPage = false;
      })

      BendService.getAlertTypeList(function(rets){
        $scope.alertTypeList = _.sortBy(rets, function(o){
          return o.position;
        });
      })

      $scope.createAlert = function(ev) {
        $scope.currentMode = 1;
        $scope.alert = {comment:"", reviewed:false, internalNotes:""};
        $scope.openDialog(ev);
      };

      $scope.editAlert = function(item) {
        $scope.currentMode = 2;
        $scope.alert = item;
        $scope.openDialog($scope.$event);
      }

      $scope.NoData = function() {
        if($scope.alertList.length > 0)
          return false;
        else
          return true;
      }

      $scope.checkFilter = function(item) {
        if($scope.alertFilter == 0)
          return true;
        else if($scope.alertFilter == 1)
          return !item.reviewed;
        else if($scope.alertFilter == 2)
          return item.reviewed;
      }

      $scope.goBroadcast = function(broadcast, ev){
        ev.preventDefault();
        ev.stopPropagation();
        if(broadcast) {
          $location.url("/broadcast/" + broadcast._id + "/edit");
        }

        return false;
      }

      $scope.goUserProfile = function(user, ev){
        ev.preventDefault();
        ev.stopPropagation();
        if(user)
          $location.url("/users/" + user._id + "/edit");
        return false;
      }

      $scope.saveUserPreference = function() {
        $cookies.put('alertFilter', $scope.alertFilter);
      }

      $scope.openDialog = function(ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
            controller: AlertEditController,
            templateUrl: 'app/main/alert/alerts/alert.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:false,
            fullscreen: useFullScreen,
            resolve: {
              mode: function () {
                return $scope.currentMode;
              },
              alert:function () {
                return $scope.alert;
              },
              alertList:function () {
                return $scope.alertList;
              },
              alertTypeList:function () {
                return $scope.alertTypeList;
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

function AlertEditController($scope, $mdDialog, BendService, $rootScope, mode, alert, alertList, alertTypeList, BendAuth, CommonUtil, $location, $q) {
  $scope.currentMode = mode;
  $scope.alert = _.clone(alert);
  if(!$scope.alert.type)
    $scope.alert.type = "";
  $scope.alertList = alertList;
  $scope.alertTypeList = alertTypeList;
  $scope.CommonUtil = CommonUtil;
  $scope.userData = "";
  $scope.broadcastList = [];

  if($scope.alert.type) {
    $scope.alert.type = (_.filter(alertTypeList, function(ret){
      return ret._id == $scope.alert.type._id;
    }))[0];
  }

  if($scope.currentMode == 2) { //updateMode
    if($scope.alert.refUser) {
      $scope.userData = $scope.alert.refUser.username;
      if($scope.alert.refUser._id) {
        BendService.getRecent10BroadcastList($scope.alert.refUser._id, function(rets){
          $scope.broadcastList = rets;

          if(alert.refBroadcast && alert.refBroadcast._id) {
            var retObj = _.find($scope.broadcastList, function(ret){
              return ret._id == alert.refBroadcast._id;
            })

            $scope.alert.refBroadcast = retObj;
          }
        })
      }
    }
  }

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.save = function() {
    if($scope.currentMode == 1) {
      console.log($scope.alert);
      $scope.alert.user = BendAuth.getActiveUser();
      if($scope.alert.type == '')
        delete $scope.alert.type;
      $scope.alert.refUser = $scope.userData;
      BendService.createAlert($scope.alert, function(ret){
        ret.user = BendAuth.getActiveUser();
        ret.user.avatar = $rootScope.globalData.data.userAvatar;
        ret.type = $scope.alert.type;
        ret.refUser = $scope.alert.refUser;
        ret.refBroadcast = $scope.alert.refBroadcast;
        $scope.alertList.push(ret);
        //$scope.alert = ret;
      });
    } else {
      if($scope.alert.type == '')
        delete $scope.alert.type;
      if(typeof $scope.userData != "string")
        $scope.alert.refUser = $scope.userData;
      var data = _.clone($scope.alert);
      delete data.$$hashKey;
      BendService.updateAlert(data, function(ret){
        _.extend(alert, $scope.alert);
        if(!$scope.alert.type)
          delete alert.type;
      });
    }

    $mdDialog.cancel();
  }

  $scope.delete = function() {
    var confirm = $mdDialog.confirm()
      .title('Would you like to delete this alert?')
      .targetEvent($scope.$event)
      .clickOutsideToClose(true)
      .parent(angular.element(document.body))
      .ok('OK')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      BendService.deleteAlert($scope.alert, function(ret){
        var idx = $scope.alertList.indexOf($scope.alert);
        applyChangesOnScope($rootScope, function(){
          $scope.alertList.splice(idx, 1);
        })
        $mdDialog.cancel();
      });
    }, function() {});
  }

  $scope.focusComment = function() {
    $("#commentLabel").hide();
  }

  $scope.changeComment = function() {
    if($scope.alert.comment == "")
      $("#commentLabel").show();
    else
      $("#commentLabel").hide();
  }

  $scope.changeComment();

  $scope.editUser = function(id) {
    $mdDialog.cancel();
    $location.url("/users/" +id + "/edit");
  }

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

  $scope.selectedUser = function() {
    console.log("selectedUser", $scope.userData);
    if($scope.userData && $scope.userData._id) {
      //fetch recent 10 broadcats of selected user
      BendService.getRecent10BroadcastList($scope.userData._id, function(rets){
        $scope.broadcastList = rets;
      })
    } else {
      delete $scope.alert.refBroadcast;
      $scope.broadcastList = [];
    }
  }
}
