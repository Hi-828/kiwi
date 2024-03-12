(function ()
{
  'use strict';

  angular
    .module('app.users.useredit')
    .controller('UserProductController', UserProductController);

  /** @ngInject */
  function UserProductController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $timeout, $sce)
  {
    BendAuth.checkAuth();
    console.log("UserProductController");
    // Data
    $scope.CommonUtil = CommonUtil;
    var userId = $stateParams.id;
    var typeId = $stateParams.typeId;

    $scope.selectedListMap = [];
    var intervalList = [];

    $scope.productTypes = [];
    $scope.products = [];
    $scope.studios = [];
    $scope.currentStudioMode = 0; //0:view, 1:create, 2:edit
    $scope.userLinks = [];
    $scope.userLinksChanged = false;
    $scope.query = [];
    $scope.totalProductCount = [];
    $scope.promise = [];
    var selectedTypeId;
    $scope.isUploading=[];
    $scope.query[typeId] = {
      limit: 10,
      page: 1
    };

    $rootScope.$broadcast("selectedProductType", typeId);

    function getProductPageData(typeId, query) {
      $scope.promise[typeId] = BendService.getUserProductPage(userId, typeId, query).then(
        function(rets) {
          $scope.products[typeId] = rets;
        }, function(err) {
          console.log(err);
        });
    }
    function getTotalCount(userId, typeId) {
      BendService.getUserProductPageTotalCount(userId, typeId, function(ret){
        console.log('total count', ret)
        $scope.totalProductCount[typeId] = ret;
      })
    }

    $scope.onPaginate = function (page, limit) {
      getProductPageData(selectedTypeId, angular.extend({}, $scope.query[selectedTypeId], {page: page, limit: limit}));
    };

    $scope.reBuild = function(typeId) {
      selectedTypeId = typeId;
      $scope.query[typeId].page = 1;
      getProductPageData(typeId, $scope.query[typeId]);
      getTotalCount(userId, typeId)
    }

    $scope.reBuild(typeId);

    $scope.createProduct = function(ev, productType) {
      $location.url("/products/create?user=" + userId + "&type=" + productType._id);
      return;
    }

    $scope.editProduct = function(ev, productType, product) {
      $location.url("/products/" + product._id + "/edit?user=" + userId + "&type=" + productType._id);
      return;
    }

    $scope.NoProductData = function(products) {
      if(products && products.length > 0)
        return false;
      else
        return true;
    }
  }
})();
