(function ()
{
    'use strict';

    angular
        .module('app.settings.customattr')
        .controller('CustomAttrController', CustomAttrController);

    /** @ngInject */
    function CustomAttrController($scope, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location)
    {
      BendAuth.checkAuth();
        var vm = this;

// Data
      vm.userAttrList = [];
      vm.CommonUtil = CommonUtil;
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

      BendService.getUserAttrList(function(rets){
        vm.userAttrList = _.sortBy(rets, function(o){
          return o.position;
        });
        $scope.loadingPage = false;
      })

      $scope.resetOrder = function() {
        vm.userAttrList = _.sortBy(vm.userAttrList, function(o){
          return o.position;
        });

        $scope.dirtyOrder = false;
      }

      $scope.saveOrder = function() {
        for(var idx = 0 ; idx < vm.userAttrList.length ; idx++) {
          vm.userAttrList[idx].position = idx;
          $scope.updatePosition(vm.userAttrList[idx]);
        }
        $scope.dirtyOrder = false;
      }

      $scope.createField = function(ev) {
        $location.path("/customattr/create");
        return;
      };

      $scope.editField = function(data) {
        $location.path("/customattr/" + data._id + "/edit");
        return;
      }

      $scope.NoData = function() {
        if(vm.userAttrList.length > 0)
          return false;
        else
          return true;
      }

      $scope.updatePosition = function(data) {
        var userAttr = _.clone(data);
        delete userAttr.$$hashKey;
        BendService.updateUserAttr(userAttr);
      }

      $scope.resort = function() {
        vm.userAttrList = _.sortBy(vm.userAttrList, function(o){
          return o.position;
        });
      }

      /*$scope.changeList = function() {
        console.log("changed list");
      }*/

      $scope.$watchCollection("vm.userAttrList", function(newVal, oldVal){
        if(oldVal && newVal) {
          if(oldVal.length > 0) {
            //console.log("changedList", newVal, oldVal);
            $scope.saveOrder();
          }
        }
      })
    }

})();
