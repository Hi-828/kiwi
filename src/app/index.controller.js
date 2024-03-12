(function ()
{
    'use strict';

    angular
        .module('fuse')
        .controller('IndexController', IndexController);

    /** @ngInject */
    function IndexController(fuseTheming, $scope)
    {
        var vm = this;

      //console.log("IndexController");

        // Data
        vm.themes = fuseTheming.themes;
        fuseTheming.setActiveTheme('teal');
    }
})();
