(function ()
{
  'use strict';

  angular
    .module('app.users.useredit')
    .controller('ProfileController', ProfileController);

  /** @ngInject */
  function ProfileController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $timeout, $sce)
  {
    BendAuth.checkAuth();

    // Data
    $scope.CommonUtil = CommonUtil;
    $scope.selectedListMap = [];
    $scope.user = {};
    $scope.query = [];
    $scope.isUploading=[];
    $scope.basicForm = {};
    $scope.userLinks = [];
    $scope.userLinksChanged = false;
    $scope.isUpdatePage = false;
    $scope.isEnabled = true;

    var userId = $stateParams.id;
    var intervalList = [];
    var oldUsername = "";

    $rootScope.$broadcast("selectedUserTab", 0);

    $scope.isUpdatePage = true;
    BendService.getUser(userId, function(ret){
      $scope.user = ret;
      if(typeof $scope.user.enabled == 'boolean')
        $scope.isEnabled = $scope.user.enabled;

      if($scope.user.status == null || typeof $scope.user.status == 'undefined') {
        $scope.user.status = 1;
      }
      oldUsername = ret.username;
      if($scope.user.dateOfBirth) {
        $scope.dateOfBirth = new Date($scope.user.dateOfBirth/1000000);
      }

      if($scope.user.avatar) {
        $scope.avatarFile = $scope.user.avatar._file;
      }

      BendService.getUserAttrList(function(ret){
        $scope.userAttrList = _.filter(ret, function(o){
          return o.enabled;
        });

        $scope.userAttrList.map(function(o){
          if(o.type == 3) {
            $scope.selectedListMap[o.name] = [];
            if($scope.user[o.name]) {
              o.options.map(function(item){
                if($scope.user[o.name].indexOf(item.id) != -1)
                  $scope.selectedListMap[o.name].push(item);
              })
            }
            var old = _.clone($scope.selectedListMap[o.name]);
            intervalList[o.name] = setInterval(function(){
              if(!_.isEqual(old, $scope.selectedListMap[o.name])){
                old = _.clone($scope.selectedListMap[o.name]);

                //changed
                applyChangesOnScope($scope, function(){
                  $scope.userForm.$setDirty();
                });
                clearInterval(intervalList[o.name]);
              }
            }, 50);
          }
        });

        $scope.isUpdatePage = false;
      })
    })

    $scope.setTextFocus = function(fileName) {
      //console.log($scope.inputForm.productCategories);
      $("input[name='" + fileName + "']").focus();
    }

    BendService.getUserLinkList(userId, function(rets){
      rets.map(function(o){
        $scope.userLinks.push({
          title: o.title,
          url: o.url
        });
      })

      $scope.userLinks.push({
        title: "",
        url: ""
      });
    })

    $scope.changeUserLink = function(optionItem) {
      $scope.userLinksChanged = true;
      var idx = $scope.userLinks.indexOf(optionItem);
      if(idx < $scope.userLinks.length - 1) {
        return;
      }

      if(optionItem.title == "" && optionItem.url == "") return;
      $scope.userLinks.push({title:"", url:""});
    }

    $scope.hasAvatar = function() {
      return !_.isUndefined($scope.avatarFile) || !_.isUndefined($scope.user.avatar);
    };

    $scope.fileProgress = [];
    $scope.onFileUpload = function (files, tag, workflow) {
      if(!files || files.length == 0)
        return;
      var file = files[0];

      $scope.isUploading[tag]=true;
      $scope.fileProgress[tag] = 0;
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
              $scope.avatarFile=ret;
              $scope.avatarURL=ret._versions.sm._downloadURL;
            })
            $scope.userForm.$setDirty();
          } else if(tag == 'photoID' || tag == 'photoWithID') {
            BendService.getFile(uploadedFile, function(ret){
              $scope.user[tag]=ret;
            })
            $scope.userForm.$setDirty();
          }
        })
      },{
        _workflow: workflow
      }, function (total, prog){
        applyChangesOnScope($scope, function(){
          $scope.fileProgress[tag] = prog * 100 / total;
        })
      });
    };

    $scope.openFile = function(fileName) {
      angular.element($("input[name='" + fileName + "']")[0]).trigger('click');
    }

    $scope.deleteFile = function(tag){
      if(tag == 'avatar') {
        $scope.showAvatarControl = false;
        applyChangesOnScope($scope, function(){
          delete $scope.avatarFile;
          delete $scope.avatarURL;
          $scope.userForm.$setDirty();
        })
      } else {
        var confirm = $mdDialog.confirm()
          .title('Would you like to delete this file?')
          .targetEvent($scope.$event)
          .clickOutsideToClose(true)
          .parent(angular.element(document.body))
          .ok('OK')
          .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
          delete $scope.user[tag];
          $scope.userForm.$setDirty();
        }, function() {});
      }
    }

    $scope.update = function() {
      $scope.user.enabled = $scope.isEnabled;
      $scope.isUpdatePage = true;
      if($scope.avatarFile) {
        $scope.user.avatar = {
          _id:$scope.avatarFile._id,
          _type: "BendFile"
        }
      } else {
        delete $scope.user.avatar;
      }
      //$scope.user.gender = CommonUtil.getGenderCode($scope.userGender);
      if($scope.dateOfBirth) {
        $scope.user.dateOfBirth = $scope.dateOfBirth.getTime() * 1000000;
      }

      $scope.userAttrList.map(function(o){
        if(o.type == 3) {
          if($scope.selectedListMap[o.name].length > 0) {
            $scope.user[o.name] = [];
            $scope.selectedListMap[o.name].map(function(item){
              $scope.user[o.name].push(item.id);
            })
          } else {
            delete $scope.user[o.name];
          }
        }
      });

      var userData = _.clone($scope.user);

      if(userData.photoID) {
        userData.photoID = CommonUtil.makeBendFile($scope.user.photoID._id)
      }

      if(userData.photoWithID) {
        userData.photoWithID = CommonUtil.makeBendFile($scope.user.photoWithID._id)
      }

      if(userData.agent) {
        delete userData.referredBy
      } else {
        delete userData.agentCode
      }
      BendService.updateUser(userData, function(user){

        if($scope.userLinksChanged) {
          //save user links
          BendService.deleteUserLinks(userId, function(rets){
            $scope.userLinks.map(function(o){
              if(o.title != "" && o.url != "") {
                BendService.createUserLink(user, o.title, o.url);
              }
            });
            //$location.path("/users");
            $scope.userForm.$setPristine();
            $scope.isUpdatePage = false;
          });
        } else {
          //$location.path("/users");
          $scope.userForm.$setPristine();
          $scope.isUpdatePage = false;
        }
      });
    };

    $scope.openLightboxModal = function (imageTag, $ev) {
      console.log("ok");
      var image = {};
      var index = 0;
      var userFile;
      userFile = $scope.user[imageTag]._file?$scope.user[[imageTag]]._file:$scope.user.photoID;

      image = {
        url:userFile._downloadURL,
        thumbUrl:userFile._versions.md._downloadURL,
      };

      $scope.openLightBoxDialog($ev, image);
    };

    $scope.openAvatarFile = function($event) {

      console.log("here", $event.target)
      var obj = $event.target;
      setTimeout(function(){
        $(obj).parent().find("input[type='file']").eq(0).click();
      }, 0);
    }

    $scope.updateStatus = function() {
      BendService.updateUser($scope.user, function(user){
      });
    };

    $scope.delete = function() {
      var confirm = $mdDialog.confirm()
        .title('Would you like to delete this user?')
        /*.textContent('All of the banks have agreed to forgive you your debts.')
         .ariaLabel('Lucky day')*/
        .targetEvent($scope.$event)
        .clickOutsideToClose(true)
        .parent(angular.element(document.body))
        .ok('OK')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        BendService.deleteUser($scope.user, function(user){
          $location.path("/users");
        });
      }, function() {});
    };

    $scope.undelete = function() {
      var confirm = $mdDialog.confirm()
        .title('Would you like to restore this user?')
        /*.textContent('All of the banks have agreed to forgive you your debts.')
         .ariaLabel('Lucky day')*/
        .targetEvent($scope.$event)
        .clickOutsideToClose(true)
        .parent(angular.element(document.body))
        .ok('OK')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        BendService.undeleteUser($scope.user, function(user){
          $location.path("/users");
        });
      }, function() {});
    };

    $scope.showHideAvartarControl = function(bVal) {
      $scope.showAvatarControl = bVal;
    }

    $scope.userNameCheck = function() {
      if(!$scope.user.username || $scope.user.username == "")
        return;

      if($scope.user.username.toUpperCase() == oldUsername.toUpperCase())
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
    }

    //dialogs
    $scope.openPasswordDialog = function(ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
          controller: PasswordChangeController,
          templateUrl: 'app/main/users/user/password.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:false,
          fullscreen: useFullScreen,
          resolve: {
            user: function () {
              return $scope.user;
            },
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

    $scope.openLightBoxDialog = function(ev, image) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
          controller: LightBoxController,
          templateUrl: 'app/main/users/user/tabs/profile/lightbox.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: useFullScreen,
          resolve: {
            image: function () {
              return image;
            },
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
  }
})();
