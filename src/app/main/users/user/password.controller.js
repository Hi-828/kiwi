function PasswordChangeController($scope, $mdDialog, BendService, $rootScope, user) {

  $scope.formData = {};

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.save = function() {
    user.password = $scope.formData.password;
    BendService.updateUser(user, function(ret){
      $mdDialog.cancel();
    });
  }
}
