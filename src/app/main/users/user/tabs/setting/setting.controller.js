(function ()
{
  'use strict';

  angular
    .module('app.users.useredit')
    .controller('SettingController', SettingController);

  /** @ngInject */
  function SettingController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $timeout, $sce)
  {
    BendAuth.checkAuth();
    console.log("SettingsController");
    // Data
    $scope.CommonUtil = CommonUtil;
    var userId = $stateParams.id;
    $scope.user = {};
    $scope.geography = {
      countries:[],
      states:[],
      provinces:[]
    };
    $scope.restriction = {
      countries:[],
      states:[],
      provinces:[]
    };
    $scope.userConfig = {
      privateShowTokenCost:0,
      spyShowTokenCost:0,
      privateShowMinimumTokens:0,
      minGroupSize:2,
      user:{
        _id:userId
      }
    };

    $scope.userTextingConfig = {
    };

    $scope.savingUserConfig = false;
    $scope.savingUserTextingConfig = false;
    $scope.loadingPage = true;

    $rootScope.$broadcast("selectedUserTab", 5);
    BendService.getUser(userId, function(ret){
      $scope.user = ret;
      $scope.userTextingConfig.textingEnabled = ret.textingEnabled
      $scope.userTextingConfig.textingTokenCost = ret.textingTokenCost
    })

    $scope.importGeographyData = function() {
      BendService.createGeography();
    }

    var initGeography = function(complateCallback) {
      async.parallel([
        function(callback){
          BendService.getGeographyList("country", function(rets){
            $scope.geography.countries = rets;
            callback(null, true);
          })
        },
        function(callback) {
          BendService.getGeographyList("us-state", function(rets){
            $scope.geography.states = rets;
            callback(null, true);
          })
        },
        function(callback) {
          BendService.getGeographyList("ca-province", function(rets){
            $scope.geography.provinces = rets;
            callback(null, true);
          })
        },
        function(callback) {
          BendService.getRestrictionList(userId, "country", function(rets){
            console.log("$scope.restriction.countries", rets);
            $scope.restriction.countries = rets;
            callback(null, true);
          })
        },
        function(callback) {
          BendService.getRestrictionList(userId, "us-state", function(rets){
            $scope.restriction.states = rets;
            callback(null, true);
          })
        },
        function(callback) {
          BendService.getRestrictionList(userId, "ca-province", function(rets){
            $scope.restriction.provinces = rets;
            callback(null, true);
          })
        },
      ],function(err, results){
        complateCallback();
      })
    }

    var getUserConfig = function(complateCallback) {
      BendService.getUserConfig(userId, function(ret){
        if(ret) {
          _.extend($scope.userConfig, ret);
        }
        complateCallback();
      })
    }

    $scope.saveUserConfig = function() {
      $scope.savingUserConfig = true;
      var userConfig = _.clone($scope.userConfig);
      if(!userConfig.allowPrivateShows) {
        delete userConfig.allowPrivateShowRecordings;
        delete userConfig.privateShowTokenCost;
        delete userConfig.spyShowTokenCost;
        delete userConfig.privateShowMinimumTokens;
      }
      if(!userConfig.allowGroupShows) {
        delete userConfig.minGroupSize;
      }
      if(!userConfig.allowGroupShows) {
        delete userConfig.minGroupSize;
        delete userConfig.groupShowTokenCost;
      }
      if(!userConfig.camPasswordRequired) {
        delete userConfig.camPassword;
      }

      BendService.saveUserConfig(userConfig, function(ret){
        $scope.savingUserConfig = false;
        _.extend($scope.userConfig, ret);
        console.log(ret);
        $scope.userConfigForm.$setPristine();
      })
    }

    $scope.saveUserTextingConfig = function() {
      $scope.savingUserTextingConfig = true
      _.extend($scope.user, $scope.userTextingConfig);

      BendService.updateUser($scope.user, function(ret){
        $scope.savingUserTextingConfig = false
        console.log(ret);
        $scope.userTextingConfigForm.$setPristine();
      })
    }

    async.parallel([
      function(callback){
        initGeography(function(){
          callback(null, true);
        });
      },
      function(callback){
        getUserConfig(function(){
          callback(null, true);
        });
      }
    ], function(err, result){
      $scope.loadingPage = false;
    })


    $scope.notInRestrict = function(type) {
      return function (item) {
        var rets;
        if(type == "country") {
          rets = _.filter($scope.restriction.countries, function(o){
            return o.geography.name == item.name;
          })
        } else if(type == "state") {
          rets = _.filter($scope.restriction.states, function(o){
            return o.geography.name == item.name;
          })
        } else if(type == "province") {
          rets = _.filter($scope.restriction.provinces, function(o){
            return o.geography.name == item.name;
          })
        }

        if(rets && rets.length > 0)
          return false;
        else
          return true;
      };
    }

    $scope.selectedGeography = function(type) {
      var items;
      var targets;
      if(type == 'country') {
        items = $scope.selectedCountries;
        targets = $scope.restriction.countries;
      } else if(type == 'state') {
        items = $scope.selectedStates;
        targets = $scope.restriction.states;
      } else if(type == 'province') {
        items = $scope.selectedProvinces;
        targets = $scope.restriction.provinces;
      }

      if(items.length == 0)
        return;

      applyChangesOnScope($scope, function(){
        BendService.addRestriction(userId, items[0], function(ret){
          ret.geography = items[0];
          targets.push(ret)
        });
      })
    }

    $scope.restrictSelected = function(type) {
      var items;
      var targets;
      if(type == 'country') {
        items = $scope.selectedRestrictCountries;
        targets = $scope.restriction.countries;
      } else if(type == 'state') {
        items = $scope.selectedRestrictStates;
        targets = $scope.restriction.states;
      } else if(type == 'province') {
        items = $scope.selectedRestrictProvinces;
        targets = $scope.restriction.provinces;
      }

      if(items.length == 0)
        return;

      applyChangesOnScope($scope, function(){
        BendService.deleteRestriction(items[0]._id, function(ret){
          var idx = targets.indexOf(items[0]);
          if(idx != -1)
            targets.splice(idx, 1);
        });
      })
    }
  }
})();
