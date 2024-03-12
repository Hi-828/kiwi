(function ()
{
    'use strict';

    angular
        .module('app.settings.productCategory')
        .controller('ProductCategoryController', ProductCategoryController);

    /** @ngInject */
    function ProductCategoryController($scope, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location)
    {
        BendAuth.checkAuth();

// Data
      $scope.productCategories = [];
      $scope.productTypes = [];
      $scope.CommonUtil = CommonUtil;
      $scope.currentMode = 0; //0:view, 1:create, 2:edit
      $scope.productCategory = {};
      $scope.productCategoryGroup = [];
      $scope.loadingPage = true;

      async.parallel([
        function(callback) {
          BendService.getProductTypeList(function(rets){
            $scope.productTypes =_.filter(rets, function(o){
              return o.enabled;
            });
            $scope.productTypes = _.sortBy($scope.productTypes, function(o){
              return o.name.toUpperCase();
            });
            callback(null, true);
          })
        },
        function(callback){
          BendService.getCategoryList(function(results){
            $scope.productCategories = results;
            callback(null, true);
          })
        }
      ], function(err, result){
        $scope.regroup();
      })

      $scope.regroup = function() {
        $scope.productTypes.map(function(o){
          var list = _.filter($scope.productCategories, function(o2){return o2.productType._id == o._id});
          $scope.productCategoryGroup[o._id] = _.sortBy(list, function(o){return o.name.toUpperCase()});
        })
        $scope.loadingPage = false;
      }

      $scope.$on("regroup-category", function(){
        $scope.regroup();
      })

      $scope.create = function(ev, item) {
        $scope.currentMode = 1;
        $scope.productCategory = {name:"", numItems:0, productType:item, enabled:true};
        $scope.openDialog(ev);
      }

      $scope.edit = function(ev, item) {
        $scope.currentMode = 2;
        $scope.productCategory = item;
        $scope.openDialog(ev);
      }

      $scope.openDialog = function(ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
            controller: ProductCategoryEditController,
            templateUrl: 'app/main/settings/productcategory/productCategory.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: useFullScreen,
            resolve: {
              mode: function () {
                return $scope.currentMode;
              },
              productCategory:function () {
                return $scope.productCategory;
              },
              productCategories:function () {
                return $scope.productCategories;
              },
              productCategoryGroup:function () {
                return $scope.productCategoryGroup;
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

function ProductCategoryEditController($scope, $mdDialog, BendService, $rootScope, mode, productCategory, productCategories, productCategoryGroup) {
  $scope.currentMode = mode;
  $scope.productCategory = productCategory;
  $scope.productCategories = productCategories;
  var productType = $scope.productCategory.productType;

  console.log($scope.productCategory);

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.save = function() {
    if($scope.currentMode == 1) {
      BendService.createCategory($scope.productCategory, function(ret){
        productCategoryGroup[productType._id].push(ret);
        $scope.productCategory = ret;
        productCategoryGroup[productType._id] = _.sortBy(productCategoryGroup[productType._id], function(o){return o.name.toUpperCase()});
      });
    } else {
      var data = _.clone($scope.productCategory);
      delete data.$$hashKey;
      BendService.updateCategory(data, function(ret){
        //$scope.productTypes.push(ret);
        productCategoryGroup[productType._id] = _.sortBy(productCategoryGroup[productType._id], function(o){return o.name.toUpperCase()});
      });
    }

    $mdDialog.cancel();
  }

  $scope.delete = function() {
    var confirm = $mdDialog.confirm()
      .title('Would you like to delete this product category?')
      /*.textContent('All of the banks have agreed to forgive you your debts.')
       .ariaLabel('Lucky day')*/
      .targetEvent($scope.$event)
      .clickOutsideToClose(true)
      .parent(angular.element(document.body))
      .ok('OK')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      BendService.deleteCategory($scope.productCategory, function(ret){
        var idx = productCategoryGroup[productType._id].indexOf($scope.productCategory);
        productCategoryGroup[productType._id].splice(idx, 1);
        $mdDialog.cancel();
      });
    }, function() {});
  }
}
