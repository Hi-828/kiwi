(function ()
{
    'use strict';

    angular
        .module('app.settings.producttype')
        .controller('ProductTypeController', ProductTypeController);

    /** @ngInject */
    function ProductTypeController($scope, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location)
    {
        BendAuth.checkAuth();

// Data
      $scope.productTypes = [];
      $scope.CommonUtil = CommonUtil;
      $scope.currentMode = 0; //0:view, 1:create, 2:edit
      $scope.productType = {};
      $scope.loadingPage = true;

      BendService.getProductTypeList(function(rets){
        $scope.productTypes = rets;
        $scope.loadingPage = false;
      })

      $scope.NoData = function() {
        if($scope.productTypes.length > 0)
          return false;
        else
          return true;
      }

      $scope.create = function(ev) {
        $scope.currentMode = 1;
        $scope.productType = {name:"", allowedTypes:[], maxAttachments:1, enabled:true, videoPreviewEnabled:false, downloadable:true, productCount:0};

        $scope.openDialog(ev);
      }

      $scope.edit = function(ev, item) {
        $scope.currentMode = 2;
        $scope.productType = item;
        $scope.openDialog(ev);
      }

      $scope.openDialog = function(ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
            controller: ProductTypeEditController,
            templateUrl: 'app/main/settings/producttype/producttype.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: useFullScreen,
            resolve: {
              mode: function () {
                return $scope.currentMode;
              },
              productType:function () {
                return $scope.productType;
              },
              productTypes:function () {
                return $scope.productTypes;
              },
            }
          })
          .then(function(answer) {
            //console.log(answer);
          }, function() {
            //console.log('You cancelled the dialog.');
          });
        $scope.$watch(function() {
          return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
          $scope.customFullscreen = (wantsFullScreen === true);
        });
      }
    }

})();

function ProductTypeEditController($scope, $mdDialog, BendService, $rootScope, mode, productType, productTypes, CommonUtil) {
  $scope.currentMode = mode;
  $scope.productType = _.clone(productType);
  $scope.productTypes = productTypes;
  $scope.fileTypes = CommonUtil.FileTypes;
  $scope.allowedTypes = [];

  if(!$scope.productType.maxAttachments)
    $scope.productType.maxAttachments = 1;

  if($scope.productType.allowedTypes) {
    $scope.productType.allowedTypes.map(function(o){
      $scope.allowedTypes[o] = true;
    })
  }

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.save = function() {
    if($scope.currentMode == 1) {
      var temp = [];
      CommonUtil.FileTypes.map(function(o){
        if($scope.allowedTypes[o])
          temp.push(o);
      })
      $scope.productType.allowedTypes = temp;

      if(!$scope.productType.downloadable) {
        delete $scope.productType.maxAttachments;
        delete $scope.productType.allowedTypes;
      }

      BendService.createProductType($scope.productType, function(ret){
        $scope.productTypes.push(ret);
        $scope.productType = ret;
      });
    } else {
      console.log($scope.allowedTypes);
      var temp = [];
      CommonUtil.FileTypes.map(function(o){
        if($scope.allowedTypes[o])
          temp.push(o);
      })
      $scope.productType.allowedTypes = temp;

      var data = _.clone($scope.productType);
      delete data.$$hashKey;
      if(!data.downloadable) {
        delete data.maxAttachments;
        delete data.allowedTypes;
        delete productType.maxAttachments;
        delete productType.allowedTypes;
      }

      BendService.updateProductType(data, function(ret){
        _.extend(productType, ret);
      });
    }

    $mdDialog.cancel();
  }

  $scope.delete = function() {
    var confirm = $mdDialog.confirm()
      .title('Would you like to delete this product type?')
      /*.textContent('All of the banks have agreed to forgive you your debts.')
      .ariaLabel('Lucky day')*/
      .targetEvent($scope.$event)
      .clickOutsideToClose(true)
      .parent(angular.element(document.body))
      .ok('OK')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      BendService.deleteProductType($scope.productType, function(ret){
        var idx = $scope.productTypes.indexOf($scope.productType);
        $scope.productTypes.splice(idx, 1);
        $mdDialog.cancel();
      });
    }, function() {});
  }
}
