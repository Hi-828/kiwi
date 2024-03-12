function TileController($scope, $mdDialog, BendService, $rootScope, user, tileList, column, tile, BendAuth, CommonUtil, $location, $q, playTileStatus) {
  $scope.user = user;
  $scope.CommonUtil = CommonUtil;
  $scope.createMode = true;

  if(!tile._id) {
    $scope.tile = {
      column:column,
      row:tileList.length + 1,
      user:user,
      color:"#000000",
      backgroundColor:"#ffffff"
    };
  } else {
    $scope.createMode = false;
    $scope.tile = _.clone(tile);
    console.log($scope.tile);
    _.extend($scope.tile, {
      user:user,
    });
  }

  $scope.openFile = function(fileName) {
    jQuery("input[name='" + fileName + "']").click();
  }

  $scope.save = function () {
    if($scope.createMode) {
      BendService.createTile($scope.tile, function (ret) {
        if($scope.tile.type == 'product') {
          console.log(ret);
          BendService.getProductInfoForTile(ret.object._id, function(product, tags){
            ret.object = product;
            ret.tags = tags;
            console.log(ret);
            playTileStatus[ret._id] = 0;
            tileList.push(ret);
          })
        } else {
          ret.object = $scope.tile.object;
          tileList.push(ret);
        }
      });
    } else {
      BendService.updateTile($scope.tile, function (ret) {
        _.extend(tile, ret);
        if($scope.tile.type == 'product') {
          BendService.getProductInfoForTile(ret.object._id, function(product, tags){
            console.log("tile1", tile);
            tile.object = product;
            tile.tags = tags;
            console.log("tile2", tile);
          })
        } else if($scope.tile.type == 'image'){
          tile.object = $scope.tile.object;
          console.log( $scope.tile, tile);
        }
      });
    }

    $mdDialog.cancel();
  }

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $scope.tile = tile;
    $mdDialog.cancel();
  };

  $scope.delete = function(ev) {
    BendService.deleteTile($scope.tile, function (ret) {
      var idx = tileList.indexOf(tile);
      tileList.splice(idx, 1);

      $mdDialog.cancel();
    });
  }

  $scope.searchProduct = function(searchText) {
    if(searchText == "") {
      return;
    }

    var deferred = $q.defer();

    BendService.searchProductList(searchText, user._id, function(rets){
      deferred.resolve(rets);
    });

    return deferred.promise;
  }

  $scope.isUploading = false;
  $scope.fileProgress = 0;
  $scope.onFileUpload = function (files, tag) {
    var file = files[0];

    $scope.isUploading = true;
    $scope.fileProgress = 0;
    BendService.upload(file,function(error,uploadedFile){
      if(error) {
        $scope.isUploading = false;
        return;
      }

      console.log(uploadedFile);
      $scope.isUploading = false;
      BendService.getFile(uploadedFile, function(ret){
        $scope.tile.object = ret;
      })
      $scope.editForm.$setDirty();
    },{
      _workflow: 'photo'
    }, function (total, prog){
      applyChangesOnScope($scope, function(){
        $scope.fileProgress = prog * 100 / total;
      })
    });
  };

  $scope.deleteFile = function(tag){
    delete $scope.tile.object;
    $scope.editForm.$setDirty();
  }

}
