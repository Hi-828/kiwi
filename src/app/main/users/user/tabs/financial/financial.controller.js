(function ()
{
  'use strict';

  angular
    .module('app.users.useredit')
    .controller('FinancialController', FinancialController);

  /** @ngInject */
  function FinancialController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $timeout, $sce)
  {
    BendAuth.checkAuth();
    console.log("FinancialController");

    // Data
    $scope.CommonUtil = CommonUtil;
    var userId = $stateParams.id;
    $scope.userFinancial = {
      user:{
        _id:userId
      },
    };
    $scope.isUploading=[];
    $scope.loadingPage = true;

    //methods
    $rootScope.$broadcast("selectedUserTab", 2);

    BendService.getUserFinancial(userId, function(ret){
      if(ret) {
        _.extend($scope.userFinancial, ret);
      }
      $scope.loadingPage = false;
    })

    $scope.saveUserFinancial = function(ev){
      $scope.savingUserFinancial = true;
      var data = _.clone($scope.userFinancial);
      if(data.paymentMethod != 'paypal')
        delete data.paypalEmail;
      if(data.country != 'US') {
        delete data.socialSecurityNumber;
        delete data.taxpayerForm;
      }

      var taxpayerForm = $scope.userFinancial.taxpayerForm;
      BendService.saveUserFinancial(data, function(ret){
        $scope.savingUserFinancial = false;
        _.extend($scope.userFinancial, ret);
        $scope.userFinancial.taxpayerForm = taxpayerForm;
        $scope.userFinancialForm.$setPristine();
      })
    }

    $scope.onFileUpload = function (files, tag) {
      var file = files[0];

      $scope.isUploading[tag]=true;
      BendService.upload(file,function(error,uploadedFile){
        if(error) {
          $scope.isUploading[tag]=false;
          return;
        }

        console.log("uploadedFile", uploadedFile);
        applyChangesOnScope($scope, function(){
          $scope.isUploading[tag]=false;
          if(tag == 'avatar') {
            BendService.getFile(uploadedFile, function(ret){
              $scope.avatarFile = ret;
              $scope.avatarURL = ret._versions.sm._downloadURL;
            })
            $scope.userForm.$setDirty();
          } else if(tag == 'taxpayerForm') {
            $scope.userFinancial.taxpayerForm = {};
            $scope.userFinancial.taxpayerForm._file = uploadedFile;
            $scope.userFinancialForm.$setDirty();
          }
        })
      },{
        _workflow: tag
      });
    };

    $scope.getTaxpayerPreview = function() {
      if(!$scope.userFinancial.taxpayerForm)
        return;
      var _file = $scope.userFinancial.taxpayerForm;
      if(_file._file)
        _file = _file._file;
      var renderHTML = "";
      if(_file) {
        if (_file.mimeType.match(/image.*/)){
          renderHTML = "<img src='" + CommonUtil.getSmallImage(_file) + "'>"
        } else if(_file.mimeType.match(/video.*/)) {
          renderHTML = "<video controls><source src='" + _file._downloadURL + "' type='video/mp4'></video>"
        } else
          renderHTML = "<span>" + _file._filename + "</span>"
      }

      return $sce.trustAsHtml(renderHTML);
    }

    $scope.removeTaxpayerForm = function() {
      delete $scope.userFinancial.taxpayerForm;
      $scope.userFinancialForm.$setDirty();
    }

    function checkFileType(type, name) {
      return CommonUtil.checkFileType($scope.allowedTypes, type, name);
    }

    $scope.isUploadingTaxpayerForm = function(fileObj) {
      return fileObj.isLoading;
    }
  }
})();
