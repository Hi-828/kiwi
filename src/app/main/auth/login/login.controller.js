(function ()
{
    'use strict';

    angular
        .module('app.auth.login')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($scope, BendAuth, BendService)
    {
        var vm = this;
        // Data

      $scope.loginError = false;

        // Methods
      vm.login = function() {
        console.log("login");

        BendAuth.logIn({
          username:vm.form.username,
          password:vm.form.password,
        }, function(ret){
          console.log(ret);
          if(ret == null) {//success
            BendService.init(function(ret){
              BendAuth.redirectToDashboard();
            });
          } else {
            $scope.loginError = true;
          }
        })
      }
        //////////

      if(BendAuth.isLoggedIn()) {
        BendAuth.redirectToDashboard();
        return;
      }

      $scope.changeInput = function() {
        $scope.loginError = false;
      }
    }
})();
