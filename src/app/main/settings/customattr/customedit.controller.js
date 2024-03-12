(function ()
{
  'use strict';

  angular
    .module('app.settings.customattr')
    .controller('CustomEditController', CustomEditController);

  /** @ngInject */
  function CustomEditController($scope, $stateParams, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location)
  {
    // Data
    $scope.meta = {};
    $scope.createMode = true;

    $scope.CommonUtil = CommonUtil;
    var metaId = $stateParams.id;
    if($stateParams.id) {
      $scope.createMode = false;
    } else {
      $scope.meta.enabled = true;
      $scope.options = [{label:"", value:""}];
    }

    $scope.attrTypes = CommonUtil.FieldTypes;

    if(!$scope.createMode) {
      BendService.getUserAttr(metaId, function(ret){
        $scope.meta = ret;
        console.log($scope.meta);
        $scope.attrType = $scope.attrTypes[$scope.meta.type];

        if($scope.meta.options) {
          if($scope.meta.type == 8) {
            $scope.options = [];
            $scope.meta.options.map(function(o){
              $scope.options.push({
                label: o,
                value: "",
              })
            })
          } else if($scope.meta.type != 3)
            $scope.options = $scope.meta.options;
          else {
            $scope.options = [];
            $scope.meta.options.map(function(o){
              $scope.options.push({
                label: o.title,
                value: o.id,
              })
            })
          }
        }
        if(!$scope.options)
          $scope.options = [];
        $scope.options.push({label:"", value:""});
      })
    }

    $scope.update = function() {
      if(!$scope.createMode) {

        $scope.meta.type = $scope.attrTypes.indexOf($scope.attrType);
        console.log($scope.meta.type);

        if($scope.meta.type == 2 || $scope.meta.type == 3 || $scope.meta.type == 7 || $scope.meta.type == 8) { //need options
          $scope.meta.options = [];

          $scope.options.map(function(o){
            if($scope.meta.type == 8) { //multi checkboxes
              if(o.label != "")
                $scope.meta.options.push(o.label);
            } else if(o.value != "" && o.label != "") {
              if($scope.meta.type != 3) {
                $scope.meta.options.push({
                  label: o.label,
                  value: o.value,
                })
              } else {
                $scope.meta.options.push({
                  title: o.label,
                  id: o.value,
                })
              }
            }
          });
        } else {
          delete $scope.meta.options;
        }

        BendService.updateUserAttr($scope.meta, function(meta){
          $location.path("/customattr");
        });
      }
    };

    $scope.save = function() {
      $scope.meta.type = $scope.attrTypes.indexOf($scope.attrType);
      console.log($scope.meta.type);

      if($scope.meta.type == 2 || $scope.meta.type == 3 || $scope.meta.type == 7 || $scope.meta.type == 8) { //need options
        $scope.meta.options = [];

        $scope.options.map(function(o){
          if($scope.meta.type == 8) { //multi checkboxes
            if(o.label != "")
              $scope.meta.options.push(o.label);
          } else if(o.value != "" && o.label != "") {
            if($scope.meta.type != 3) {
              $scope.meta.options.push({
                label: o.label,
                value: o.value,
              })
            } else {
              $scope.meta.options.push({
                title: o.label,
                id: o.value,
              })
            }
          }
        });
      }
      $scope.meta.position = -1;
      BendService.createUserAttr($scope.meta, function(meta){
        $location.path("/customattr");
      });
    };

    $scope.delete = function() {
      var confirm = $mdDialog.confirm()
        .title('Would you like to delete this attribute?')
        /*.textContent('You cannot recover deleted data.')*/
        /* .ariaLabel('Lucky day')*/
        .targetEvent($scope.$event)
        .clickOutsideToClose(true)
        .parent(angular.element(document.body))
        .ok('OK')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        BendService.deleteUserAttr($scope.meta, function(user){
          $location.path("/customattr");
        });
      }, function() {});
    };

    $scope.changeOption = function(optionItem) {
      var idx = $scope.options.indexOf(optionItem);
      if(idx < $scope.options.length - 1) {
        return;
      }

      if(optionItem.label == "" && optionItem.value == "") return;

      $scope.options.push({label:"", value:""});
    }
    $scope.changeOption2 = function(optionItem) {
      var idx = $scope.options.indexOf(optionItem);
      if(idx < $scope.options.length - 1) {
        return;
      }

      if(optionItem.label == "") return;

      $scope.options.push({label:"", value:""});
    }
  }

})();
