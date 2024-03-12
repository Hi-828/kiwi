(function ()
{
  'use strict';

  angular
    .module('app.users.userlist')
    .controller('UsersController', UsersController);

  /** @ngInject */
  function UsersController($scope,BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $cookies, $window)
  {
    BendAuth.checkAuth();
    var vm = this;

    // Data
    $scope.CommonUtil = CommonUtil;
    $scope.users = [];
    $scope.searchUserText = "";

    $scope.query = {
      limit: 10,
      page: 1,
      searchUserText:""
    };
    $scope.selected = [];
    $scope.AllUserCount = 0;
    $scope.normalUserCount = 0;
    $scope.totalUserCount = 0; //current page mode's total count
    $scope.pendingUserCount = 0;
    $scope.agentsCount = 0;
    $scope.rejectedUserCount = 0;
    $scope.approvedProviderCount = 0;
    $scope.deletedAndDisabledUserCount = 0;

    if($cookies.get('selectedUserType')) {
      $scope.selectedUserType = Number($cookies.get('selectedUserType'));
    } else {
      $scope.selectedUserType = 0;
    }

    $scope.filter = {
      deleted:false,
      disabled:false
    }

    function getUserData(query) {
      query.selectedUserType = $scope.selectedUserType;
      query.searchUserText = $scope.searchUserText;
      query.filter = $scope.filter;
      $scope.promise = BendService.searchUserPage(query).then(
        function(users) {
          console.log(users);
          users.map(function(o){
            o.fullName = o.firstName + " " + o.lastName;
          })

          $scope.users = users;
        }, function(err) {
          console.log(err);
        });
    }

    function getTotalCount(query) {
      query.filter = $scope.filter;
      BendService.getUserPageTotalCount(query, function(ret){
        $scope.totalUserCount = ret;
      })
      BendService.getAllUserCount(query, function(ret){
        $scope.allUserCount = ret;
      })
      BendService.getAgentUserCount(query, function(ret){
        $scope.agentsCount = ret;
      })
      BendService.getNormalUserCount(query, function(ret){
        $scope.normalUserCount = ret;
      })
      BendService.getProviderCount(query, function(ret){
        $scope.approvedProviderCount = ret;
      })
      BendService.getPendingUserCount(query, function(ret){
        $scope.pendingUserCount = ret;
      })
      BendService.getRejectedUserCount(query, function(ret){
        $scope.rejectedUserCount = ret;
      })
      BendService.getDeletedAndDisabledUserCount(query, function(ret){
        $scope.deletedAndDisabledUserCount = ret;
      })
    }

    $scope.onPaginate = function (page, limit) {
      getUserData(angular.extend({}, $scope.query, {page: page, limit: limit}));
    };

    $scope.reBuild = function() {
      $cookies.put('selectedUserType', $scope.selectedUserType);
      var page = localStorage.getItem('user-page')?Number(localStorage.getItem('user-page')):1;
      localStorage.removeItem('user-page');
      $scope.query.page = page;
      getUserData($scope.query);
      getTotalCount($scope.query);
    }

    $scope.reBuild();

    $scope.filterUser = function(item) {
      if($scope.selectedUserType == 1) {
        return item.provider != true;
      } else if($scope.selectedUserType == 2) {
        return item.provider;
      } else
        return true;
    }


    $scope.createUser = function(ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
          controller: UserDialogController,
          templateUrl: 'app/main/users/userlist/user.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: useFullScreen
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
    };

    $rootScope.addUser = function(newUser) {
      applyChangesOnScope($scope, function(){
        $scope.users.push(newUser);
      });
    }

    BendService.getProductTypeList(function(rets){
      rets = _.sortBy(rets, function(o){
        return o.name.toUpperCase();
      })
      $rootScope.globalData.data.productTypes = _.filter(rets, function(o){
        return o.enabled;
      })
    })

    $scope.editUser = function(user, e) {
      localStorage.setItem("user-page", $scope.query.page)
      if(e.metaKey||e.ctrlKey) {
        $window.open("/users/" + user._id + "/profile", '_blank');
      } else {
        $location.url("/users/" + user._id + "/profile");
      }
      return;
    }
  }

})();

function UserDialogController($scope, $mdDialog, BendService, $rootScope, CommonUtil) {
  $scope.user = {
    enabled:true
  };
  $scope.CommonUtil = CommonUtil;

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.SaveUser = function() {
    console.log($scope.user);
    $mdDialog.cancel();
    BendService.createUser($scope.user, function(newUser){
      $rootScope.addUser(newUser);
    });
  };

  $scope.userNameCheck = function() {
    if(!$scope.user.username || $scope.user.username == "")
      return;

    var ctrl = $scope.userForm.username;

    BendService.checkUserName($scope.user.username, function(ret){
      console.log(ret);
      if(ret) { //error
        ctrl.$setValidity('namecheck',false);
      } else {
        ctrl.$setValidity('namecheck',true);
      }
    });
    /* if($scope.user.username.indexOf("AAA") >= 0) {
     ctrl.$setValidity('namecheck',true);
     } else {
     ctrl.$setValidity('namecheck',false);
     }*/
  }
}
