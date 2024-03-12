(function ()
{
  'use strict';

  angular
    .module('app.users.useredit')
    .controller('NoteController', NoteController);

  /** @ngInject */
  function NoteController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $timeout, $sce)
  {
    BendAuth.checkAuth();
    console.log("NoteController");
    // Data
    $scope.CommonUtil = CommonUtil;
    var userId = $stateParams.id;
    $scope.selectedListMap = [];
    var intervalList = [];
    $scope.notes = [];
    var lastCheckTime = 0;
    var noteLimit = 5;
    $scope.noteAvailableMore = false;
    $scope.loadingPage = true;

    $rootScope.$broadcast("selectedUserTab", 3);

    $scope.loadNoteList = function() {
      BendService.getNoteList(userId, lastCheckTime, noteLimit, function(rets){
        if(rets) {
          if(rets.length > noteLimit) {
            rets.pop();
            $scope.noteAvailableMore = true;
          } else
            $scope.noteAvailableMore = false;

          $scope.notes = $scope.notes.concat(rets);
          if(rets[rets.length - 1])
            lastCheckTime = rets[rets.length - 1]._bmd.createdAt;
        } else {
          $scope.noteAvailableMore = false;
        }
        $scope.loadingPage = false;
      })
    }

    $scope.loadNoteList();

    $scope.createNote = function() {
      if($scope.noteText && $scope.noteText.length > 0)
        BendService.createNote(userId, $scope.noteText, function(ret){
          ret.by = _.clone(BendAuth.getActiveUser());
          ret.by.avatar =  $rootScope.globalData.data.userAvatar;
          $scope.notes.unshift(ret);
          $scope.noteText = "";
        })
    }
  }
})();
