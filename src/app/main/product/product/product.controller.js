(function ()
{
    'use strict';

    angular
        .module('app.product.product')
        .controller('ProductController', ProductController);

    /** @ngInject */
    function ProductController($scope, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location)
    {
      BendAuth.checkAuth();

// Data
      $scope.products = [];
      $scope.CommonUtil = CommonUtil;

      BendService.getProductList(function(rets){
        $scope.products = rets;
      })

      $scope.create = function(ev) {
        $location.path("/products/create");
        return;
      };

      $scope.edit = function(data) {
        $location.path("/products/" + data._id + "/edit");
        return;
      }

      $scope.NoData = function() {
        if($scope.products.length > 0)
          return false;
        else
          return true;
      }
    }

})();
