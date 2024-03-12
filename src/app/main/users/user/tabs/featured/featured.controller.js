(function ()
{
  'use strict';

  angular
    .module('app.users.useredit')
    .controller('FeaturedController', FeaturedController);

  /** @ngInject */
  function FeaturedController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $timeout, $sce)
  {
    BendAuth.checkAuth();
    console.log("FeaturedController");

    // Data
    $scope.CommonUtil = CommonUtil;
    var userId = $stateParams.id;
    $scope.user = {};
    $scope.tileList = [];
    var tileLoadCompleted = false;
    $scope.isLoadingTilePage = false;
    $scope.playTileStatus = [];

    //methods
    $rootScope.$broadcast("selectedUserTab", 4);

    BendService.getUser(userId, function(ret){
      $scope.user = ret;
    })

    $scope.addNewTile = function(ev, idx) {
      console.log("addNewTile", idx);
      $scope.showTileDialog(ev, idx, {});
    }

    $scope.showTileDialog = function(ev, idx, tile) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
          controller: TileController,
          templateUrl: 'app/main/users/user/tabs/featured/tile.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:false,
          fullscreen: useFullScreen,
          resolve: {
            user:function () {
              return $scope.user;
            },
            tileList:function() {
              return $scope.tileList[idx-1];
            },
            column:function() {
              return idx;
            },
            tile:function() {
              return tile;
            },
            playTileStatus:function() {
              return $scope.playTileStatus;
            }
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

    $scope.loadTileList = function() {
      if(!tileLoadCompleted) {
        tileLoadCompleted = true;
        $scope.isLoadingTilePage = true;
        BendService.getTileList(userId, function(rets){
          console.log("getTileList", userId, rets);
          for(var i = 0; i < 3 ; i++) {
            $scope.tileList[i] = _.filter(rets, function(o){
              return o.column == (i+1);
            })

            $scope.tileList[i] = _.sortBy($scope.tileList[i], function(o){
              return o.row;
            })

            if(!$scope.tileList[i])
              $scope.tileList[i] = [];

            console.log("tileList", i, $scope.tileList[i]);
          }
          $scope.isLoadingTilePage = false;

          rets.map(function(o) {
            if(o.type == 'product') {
              $scope.playTileStatus[o._id] = 0;
            }
          })
        })
      }
    }

    $scope.loadTileList();

    $scope.toggleTileVideo = function(tileId) {
      var videoObj = document.getElementById("previewVideo_" + tileId);
      $scope.playTileStatus[tileId] = videoObj.paused?0:1;
      if($scope.playTileStatus[tileId] == 0) {
        $scope.playTileStatus[tileId] = 1;
        if(videoObj.ended) {
          console.log("video Ended");
          videoObj.currentTime = 0;
          videoObj.play();
        } else
          videoObj.play();
      }
      else if($scope.playTileStatus[tileId] == 1) {
        //$scope.playTileStatus[tileId] = 0;
        videoObj.pause();
      }
    }

    $scope.isTileVideoPaused = function(tileId) {
      var videoObj = document.getElementById("previewVideo_" + tileId);
      if(videoObj) {
        if(videoObj.paused)
          return true;
      }

      return false;
    }

    $scope.setTileVideoEvent = function(tileId) {
      console.log("init", tileId);
      setTimeout(function() {
        var videoObj = document.getElementById("previewVideo_" + tileId);
        if(videoObj) {
          console.log("here");
          videoObj.addEventListener('ended', function(e) {
            applyChangesOnScope($scope, function(){
              $scope.playTileStatus[tileId] = 0;
            })
          });
        }
      }, 1000);
    }

    $scope.printTags = function(tags) {
      var ret = [];
      if(tags) {
        tags.map(function(o) {
          ret.push("#" + o.tag.name);
        })
      }

      return ret.join(" ");
    }

    $scope.dragControlListeners = {
      containment: '#board',
      orderChanged: function(event) {
        console.log(event);
        //console.log($scope.tileList[0]);
        var list = event.dest.sortableScope.modelValue;
        for(var i = 0 ; i < list.length ; i++) {
          if(list[i].row != (i+1)) { //changed row
            list[i].row = i+1;
            BendService.updateTile(list[i]);
          }
        }
      },
      itemMoved: function(event) {
        console.log(event);
        var sourceCoulmn = $scope.tileList.indexOf(event.source.sortableScope.modelValue) + 1;
        var destColumn = $scope.tileList.indexOf(event.dest.sortableScope.modelValue) + 1;
        //console.log($scope.tileList[0]);
        var list = event.dest.sortableScope.modelValue;
        for(var i = 0 ; i < list.length ; i++) {
          if(list[i].row != (i+1) || list[i].column != destColumn) { //changed row
            list[i].row = i+1;
            list[i].column = destColumn;
            BendService.updateTile(list[i]);
          }
        }
        list = event.source.sortableScope.modelValue;
        for(var i = 0 ; i < list.length ; i++) {
          if(list[i].row != (i+1) || list[i].column != sourceCoulmn) { //changed row
            list[i].row = i+1;
            list[i].column = sourceCoulmn;
            BendService.updateTile(list[i]);
          }
        }
      },
    };

    $scope.selectTile = function(tile) {
      $scope.showTileDialog($scope.$event, tile.column, tile);
    }
  }
})();
