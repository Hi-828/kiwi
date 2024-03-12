(function ()
{
  'use strict';

  angular
    .module('app.broadcast.broadcast')
    .controller('BroadcastController', BroadcastController);

  /** @ngInject */
  function BroadcastController($scope,BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $bend, $cookies)
  {
    BendAuth.checkAuth();

    // Data
    $scope.CommonUtil = CommonUtil;
    $scope.broadcastList = [];
    $scope.query = {
      limit: 10,
      page: 1,
      searchUserText:""
    };
    $scope.totalBroadcastCount = 0; //current page mode's total count

    if($cookies.get('selectedBroadcastType')) {
      $scope.selectedBroadcastType = Number($cookies.get('selectedBroadcastType'));
    } else {
      $scope.selectedBroadcastType = 1;
    }

    var getBroadcasts = function(query){
      query.selectedBroadcastType = $scope.selectedBroadcastType;
      $scope.promise = BendService.searchBroadcastPage(query).then(
        function(rets) {
          var fileIds = [];
          if(rets) {
            rets.map(function(o) {
              if(o.user.avatar)
                fileIds.push(o.user.avatar._id);
            })

            query = new $bend.Query();
            query.contains("_id", fileIds);
            $bend.File.find(query).then(function(files){
              if(files) {
                for(var i = 0 ; i < files.length ; i++) {
                  var temps = _.filter(rets, function(o){
                    if(!o.user.avatar)
                      return false;
                    return o.user.avatar._id ==files[i]._id;
                  })
                  temps.map(function(_o){
                    _o.user.avatar = files[i];
                  })
                }
              }
            });
          }
          $scope.broadcastList = rets;
        }, function(err) {
          console.log(err);
        });
    }

    function getTotalCount(query) {
      BendService.getBroadcastPageTotalCount(query, function(ret){
        $scope.totalBroadcastCount = ret;
      })
    }

    $scope.onPaginate = function (page, limit) {
      getBroadcasts(angular.extend({}, $scope.query, {page: page, limit: limit}));
    };

    $scope.reBuild = function() {
      $scope.query.page = 1;
      $cookies.put('selectedBroadcastType', $scope.selectedBroadcastType);
      getBroadcasts($scope.query);
      getTotalCount($scope.query);
    }

    $scope.reBuild();

    $scope.createBroadcast = function(newUser) {
      $location.path("/broadcast/create");
      return;
    }

    $scope.editBroadcast = function(broadcast) {
      $location.path("/broadcast/" + broadcast._id + "/edit");
      return;
    }
  }

})();
