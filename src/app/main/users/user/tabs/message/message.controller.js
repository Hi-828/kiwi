(function ()
{
  'use strict';

  angular
    .module('app.users.useredit')
    .controller('UserMessageController', UserMessageController);

  /** @ngInject */
  function UserMessageController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, $timeout, $sce)
  {
    BendAuth.checkAuth();
    console.log("UserMessageController");
    // Data
    $scope.CommonUtil = CommonUtil;
    $scope.chatActive = false;
    var userId = $stateParams.id;
    var lastTime = 0;
    $scope.isLoading = false;
    $scope.conversations = [];

    $scope.chat = {};
    $scope.conversation = null;
    $scope.contact = null;
    var timerHandle = null;

    //methods
    $rootScope.$broadcast("selectedUserTab", 6);

    BendService.getUser(userId, function(ret){
      $scope.user = ret;
    })

    $scope.loadConversationList = function() {
      $scope.isLoading = true;
      BendService.getUserConversationList(userId, function(rets){
        $scope.conversations = rets;
        $scope.isLoading = false;
      })
    }

    $scope.loadConversationList();

    $("#chat-dialog").height($(document.body).height() - 420);

    $scope.createConversation = function(ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;

      $mdDialog.show({
          controller: MessageFindUserController,
          templateUrl: 'app/main/users/user/tabs/message/selectUser.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:false,
          fullscreen: useFullScreen,
          resolve: {
            user: function () {
              return $scope.user;
            }
          }
        })
        .then(function(contact) {
          console.log("selected User", contact);
          $scope.toggleChat(contact);
        }, function() {
        });

      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });
    }

    $scope.editConversation = function(ev, item) {
      $scope.toggleChat(getConversationUser(item));
    }

    function getConversationUser(conversation) {
      if(conversation.user1._id == userId)
        return conversation.user2;
      else
        return conversation.user1;
    }

    $scope.getUserAvatar = function(conversation) {
      var user = getConversationUser(conversation);
      return CommonUtil.getSmallImage(user.avatar);
    }

    $scope.getUsername = function(conversation) {
      var user = getConversationUser(conversation);
      return user.username;
    }

    $scope.NoData = function() {
      if($scope.conversations.length > 0)
        return false;
      else
        return true;
    }

    $scope.toggleChat = function(contact)
    {
      $scope.chatActive = !$scope.chatActive;

      if ( $scope.chatActive )
      {
        lastTime = 0;
        $scope.replyMessage = '';
        BendService.getUser(contact._id, function(ret){
          $scope.contact = ret;

          var conv = _.find($scope.conversations, function(ret){
            return (ret.user1._id == $scope.user._id && ret.user2._id == $scope.contact._id) || (ret.user2._id == $scope.user._id && ret.user1._id == $scope.contact._id);
          })

          if(conv) { //find conversation
            $scope.conversation = conv;
            if((conv.user1._id == userId && !conv.read1)||(conv.user2._id == userId && !conv.read2)) {
              BendService.setConversationAsRead(conv, function(ret){
                $rootScope.$broadcast("refreshUnreadMessage");
              })
            }
            BendService.getConversationMessage(conv, 0, 10, function(rets){
              if ( !$scope.chat.dialog ) {
                $scope.chat.dialog = [];
              }

              rets.map(function(o){
                if(o.sender._id == $scope.user._id) {
                  $scope.chat.dialog.unshift({
                    who    : 'user',
                    message: o.message,
                    time   : o._bmd.createdAt
                  });
                } else {
                  $scope.chat.dialog.unshift({
                    who    : 'contact',
                    message: o.message,
                    time   : o._bmd.createdAt
                  });
                }

                if(o._bmd.createdAt > lastTime)
                  lastTime = o._bmd.createdAt;
              })

              scrollToBottomOfChat(0);

              timerHandle = setInterval(function(){
                console.log("setInterval called", CommonUtil.formatSimpleDateTime(lastTime));
                BendService.getNewMessage($scope.conversation, lastTime, function(rets){
                  if(rets && rets.length > 0) {
                    rets.map(function(o){
                      if(o.sender._id == $scope.user._id) {
                        $scope.chat.dialog.push({
                          who    : 'user',
                          message: o.message,
                          time   : o._bmd.createdAt
                        });
                      } else {
                        $scope.chat.dialog.push({
                          who    : 'contact',
                          message: o.message,
                          time   : o._bmd.createdAt
                        });
                      }

                      if(o._bmd.createdAt > lastTime)
                        lastTime = o._bmd.createdAt;
                    })

                    scrollToBottomOfChat(0);
                  }
                });
              }, 5000);
            })
          } else {
            $scope.conversation = null;
          }
        })
      } else {
        $scope.loadConversationList();
        $scope.chat.dialog = [];
        if(timerHandle)
          clearInterval(timerHandle);

        timerHandle = null;
      }

      $rootScope.$broadcast("refreshUnreadMessage");
    }

    $scope.reply = function ()
    {
      if ( $scope.replyMessage === '' ) return;

      $scope.isProgressing = true;
      if($scope.conversation == null) {
        BendService.createConversation(userId, $scope.user, $scope.contact, function(ret){
          $scope.conversation = ret;
          replayCallback();
        })
      } else
        replayCallback();
    }

    function replayCallback() {
      if ( !$scope.chat.dialog ) {
        $scope.chat.dialog = [];
      }

      BendService.createMessage($scope.conversation, $scope.user, {
        message:$scope.replyMessage
      }, function(ret){
        $scope.chat.dialog.push({
          who    : 'user',
          message: $scope.replyMessage,
          time   : ret._bmd.createdAt
        });

        $scope.replyMessage = '';
        scrollToBottomOfChat(400);
        $scope.isProgressing = false;

        lastTime = ret._bmd.createdAt;
      })
    }

    function scrollToBottomOfChat(speed)
    {
      var chatDialog = angular.element('#chat-dialog');

      $timeout(function ()
      {
        chatDialog.animate({
          scrollTop: chatDialog[0].scrollHeight
        }, speed);
      }, 0);

    }
  }
})();

function MessageFindUserController($scope, $mdDialog, BendService, $rootScope, user, BendAuth, CommonUtil, $location, $q) {
  $scope.CommonUtil = CommonUtil;
  $scope.user = user;

  $scope.hide = function () {
    $mdDialog.hide();
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  $scope.next = function () {
    $mdDialog.hide($scope.userData);
  }

  $scope.searchUser = function (searchText) {
    if (searchText == "") {
      return;
    }

    var deferred = $q.defer();

    BendService.searchUserList(searchText, function (rets) {
      rets = _.filter(rets, function(o){return o._id != user._id});
      deferred.resolve(rets);
    });

    return deferred.promise;
  }
}
