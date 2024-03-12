(function ()
{
  'use strict';

  angular
    .module('app.users.useredit')
    .controller('ApplicationController', ApplicationController);

  /** @ngInject */
  function ApplicationController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $timeout, $sce)
  {
    BendAuth.checkAuth();
    console.log("ApplicationController");

    // Data
    $scope.CommonUtil = CommonUtil;
    var userId = $stateParams.id;
    $scope.userApplication = {
    };
    $scope.isUploading=[];
    $scope.loadingPage = true;

    //methods
    $rootScope.$broadcast("selectedUserTab", 1);

    BendService.getUserApplication(userId, function(ret){
      $scope.userApplication = ret;
      if($scope.userApplication.status == null || typeof $scope.userApplication.status == 'undefined') {
        $scope.userApplication.status = CommonUtil.UserStatus[0].value;
      }

      if($scope.userApplication.status == Number($scope.userApplication.status)) {
        var exist = _.find(CommonUtil.UserStatus, function(o){
          return o.code == $scope.userApplication.status
        })

        if(exist) {
          $scope.userApplication.status = exist.value
        }
      }

      $scope.loadingPage = false;
    })

    $scope.saveUserApplication = function(ev){
      var data = _.clone($scope.userApplication);
      if(data.snapshot) {
        data.snapshot = CommonUtil.makeBendFile(data.snapshot._id);
      }
      if(data.idFront) {
        data.idFront = CommonUtil.makeBendFile(data.idFront._id);
      }
      if(data.idBack) {
        data.idBack = CommonUtil.makeBendFile(data.idBack._id);
      }
      if(data.idSnapshot) {
        data.idSnapshot = CommonUtil.makeBendFile(data.idSnapshot._id);
      }
      data.approved = (data.status == 'approved' || data.status == 3)
      
      BendService.updateUser(data, function(ret){
        $scope.userApplicationForm.$setPristine();
      })
    }

    $scope.onFileUpload = function (files, attr) {
      var file = files[0];
      console.log(file);
      if(!CommonUtil.checkFileType(['photos'], file.type))
        return;

      $scope.isUploading[attr]=true;
      BendService.upload(file,function(error,uploadedFile){
        if(error) {
          $scope.isUploading[attr]=false;
          return;
        }

        BendService.getFile(uploadedFile, function(_file){
          $scope.isUploading[attr] = false;
          $scope.userApplication[attr] = _file
          $scope.userApplicationForm.$setDirty();
        })
      },{
        _workflow: 'applicationPreview'
      });
    };

    $scope.isUploadingTaxpayerForm = function(fileObj) {
      return fileObj.isLoading;
    }

    $scope.openFile = function(fileName) {
      angular.element($("input[name='" + fileName + "']")[0]).trigger('click');
    }

    $scope.deleteFile = function(attr){
      delete $scope.userApplication[attr];
      $scope.userApplicationForm.$setDirty();
    }
  }
})();
