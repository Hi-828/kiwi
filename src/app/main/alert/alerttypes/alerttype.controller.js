(function ()
{
    'use strict';

    angular
        .module('app.alert.alertTypes')
        .controller('AlertTypeController', AlertTypeController);

    /** @ngInject */
    function AlertTypeController($scope, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location)
    {
      BendAuth.checkAuth();
      $scope.typeList = [];
      $scope.CommonUtil = CommonUtil;
      $scope.dirtyOrder = false;
      $scope.loadingPage = true;

      $scope.sortableOptions = {
        start: function(event, ui){
          var text = $.trim(ui.item.text());
          ui.item.startHtml = ui.item.html();
          var temp = "<div class='float-row' style='width:" + $("#myTable").width() + "px'>";
          $(ui.item[0]).find("td").each(function(o){
            if(o < 4)
              temp += "<div class='float-col'>" + ($(this).text()) + "</div>";
            else
              temp += "<div class='float-col' style='text-align:center'>" + ($(this).text()) + "</div>";
          })
          temp += "</div>";
          console.log(temp);
          ui.item.html(temp);
        },
        stop: function(event, ui){
          ui.item.html(ui.item.startHtml);
        },
        update: function(e, ui) {
          $scope.dirtyOrder = true;
        }
      };

      BendService.getAlertTypeList(function(rets){
        $scope.typeList = _.sortBy(rets, function(o){
          return o.position;
        });
        $scope.loadingPage = false;
      })

      $scope.saveOrder = function() {
        for(var idx = 0 ; idx < $scope.typeList.length ; idx++) {
          $scope.typeList[idx].position = idx;
          $scope.updatePosition($scope.typeList[idx]);
        }
        $scope.dirtyOrder = false;
      }

      $scope.createType = function(ev) {
        $scope.currentMode = 1;
        $scope.alertType = {name:"", priority:"low"};
        $scope.openDialog(ev);
      };

      $scope.editType = function(item) {
        $scope.currentMode = 2;
        $scope.alertType = item;
        $scope.openDialog($scope.$event);
      }

      $scope.NoData = function() {
        if($scope.typeList.length > 0)
          return false;
        else
          return true;
      }

      $scope.updatePosition = function(data) {
        var alertType = _.clone(data);
        delete alertType.$$hashKey;
        BendService.updateAlertType(alertType);
      }

      $scope.resort = function() {
        $scope.typeList = _.sortBy($scope.typeList, function(o){
          return o.position;
        });
      }

      $scope.$watchCollection("typeList", function(newVal, oldVal){
        if(oldVal && newVal) {
          if(oldVal.length > 0) {
            //console.log("changedList", newVal, oldVal);
            $scope.saveOrder();
          }
        }
      })

      $scope.openDialog = function(ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
            controller: AlertTypeEditController,
            templateUrl: 'app/main/alert/alerttypes/alerttype.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:false,
            fullscreen: useFullScreen,
            resolve: {
              mode: function () {
                return $scope.currentMode;
              },
              alertType:function () {
                return $scope.alertType;
              },
              typeList:function () {
                return $scope.typeList;
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

function AlertTypeEditController($scope, $mdDialog, BendService, $rootScope, mode, alertType, typeList) {
  $scope.currentMode = mode;
  $scope.alertType = alertType;
  $scope.typeList = typeList;

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.save = function() {
    if($scope.currentMode == 1) {
      if($scope.typeList)
        $scope.alertType.position = $scope.typeList.length;
      else
        $scope.alertType.position = 0;
      BendService.createAlertType($scope.alertType, function(ret){
        $scope.typeList.push(ret);
        $scope.alertType = ret;
      });
    } else {
      var data = _.clone($scope.alertType);
      delete data.$$hashKey;
      BendService.updateAlertType(data, function(ret){
      });
    }

    $mdDialog.cancel();
  }

  $scope.delete = function() {
    var confirm = $mdDialog.confirm()
      .title('Would you like to delete this alert type?')
      .targetEvent($scope.$event)
      .clickOutsideToClose(true)
      .parent(angular.element(document.body))
      .ok('OK')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      BendService.deleteAlertType($scope.alertType, function(ret){
        var idx = $scope.typeList.indexOf($scope.alertType);
        applyChangesOnScope($rootScope, function(){
          $scope.typeList.splice(idx, 1);
        })
        $mdDialog.cancel();
      });
    }, function() {});
  }
}
