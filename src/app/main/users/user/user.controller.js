(function ()
{
  'use strict';

  angular
    .module('app.users.useredit')
    .controller('UserController', UserController);

  /** @ngInject */
  function UserController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $timeout, $sce)
  {
    BendAuth.checkAuth();
    //console.log("UserController");
    // Data
    $scope.CommonUtil = CommonUtil;
    var userId = $stateParams.id;

    $scope.selectedListMap = [];
    var intervalList = [];

    $scope.userData = {};
    $scope.userDataAttrList = [];
    $scope.showAvatarControl = false;
    $scope.productTypes = [];
    $scope.products = [];
    $scope.studios = [];
    $scope.currentStudioMode = 0; //0:view, 1:create, 2:edit
    $scope.userDataLinks = [];
    $scope.userDataLinksChanged = false;
    $scope.query = [];
    $scope.totalProductCount = [];
    $scope.promise = [];
    $scope.selectedIndex;

    var tabIdx = $location.search().tabIdx;

    //load product types to construct tabs
    if($rootScope.globalData.data.productTypes && $rootScope.globalData.data.productTypes.length > 0) {
      $scope.productTypes = $rootScope.globalData.data.productTypes;
      loadTotalCounts();
    } else {
      BendService.getProductTypeList(function(rets){
        rets = _.sortBy(rets, function(o){
          return o.name.toUpperCase();
        })
        $rootScope.globalData.data.productTypes = _.filter(rets, function(o){
          return o.enabled;
        })
        $scope.productTypes = $rootScope.globalData.data.productTypes;

        loadTotalCounts();
      })
    }

    function loadTotalCounts() {
      $scope.productTypes.map(function(o){
        $scope.query[o._id] = {
          limit: 10,
          page: 1
        };
        getTotalCount(userId, o._id, $scope.query[o._id]);
      })

      $timeout(function(){
        if(tabIdx) {
          $scope.reBuild($scope.productTypes[tabIdx - 2]._id);
          $scope.selectedIndex = tabIdx;
        }
      }, 10);
    }

    BendService.getUser(userId, function(ret){
      $scope.userData = ret;
    })

    var selectedTypeId;

    function getTotalCount(userId, typeId) {
      BendService.getUserProductPageTotalCount(userId, typeId, function(ret){
        $scope.totalProductCount[typeId] = ret;
      })
    }

    $scope.pluralize = function(val) {
      return pluralize(val);
    }

    $scope.openProductTab = function(typeId) {
      $location.url("/users/" + userId + "/product/" + typeId);
      return;
    }

    $scope.$on('selectedProductType', function(event, productTypeId) {
      //console.log("selectedProductType", productTypeId);
      for(var i = 0 ; i < $scope.productTypes.length ; i++) {
        if($scope.productTypes[i]._id == productTypeId) {
          if($scope.selectedIndex != 5 + i) {
            $scope.selectedIndex = 5 + i;
          }
          return;
        }
      }
    });

    $scope.$on('selectedUserTab', function(event, idx) {
      if(idx < 5) {
        $scope.selectedIndex = idx;
        return;
      }

      selectTabIndex(idx);
    });

    function selectTabIndex(idx) {
      if($scope.productTypes.length > 0) {
        $scope.selectedIndex = $scope.productTypes.length + idx;
        return;
      } else {
        setTimeout(selectTabIndex, 100, idx);
      }
    }

    //message tab
    $scope.unreadConversationCount = 0;

    function getUnreadConversationCount() {
      BendService.getUnreadConversationCount(userId, function(ret){
        $scope.unreadConversationCount = ret;
      })
    }

    function getUnreadConversationCount2() {
      BendService.getUnreadConversationCount(userId, function(ret){
        $scope.unreadConversationCount = ret;
      })

      if(BendAuth.isLoggedIn())
        setTimeout(getUnreadConversationCount2, 30000);
    }

    getUnreadConversationCount2();

    $scope.$on("refreshUnreadMessage", function(){
      getUnreadConversationCount();
    })

    /*setInterval(function(){
      getUnreadConversationCount();
    }, 30000);*/
  }
})();
