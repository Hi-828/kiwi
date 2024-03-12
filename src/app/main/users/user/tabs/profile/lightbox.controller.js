function LightBoxController($scope, $mdDialog, BendService, $rootScope, image) {
  $scope.image = image;

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };
}
