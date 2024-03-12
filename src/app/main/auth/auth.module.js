(function ()
{
    'use strict';

    angular
        .module('app.auth', [
            'app.auth.login'
        ])
        .config(config);

    /** @ngInject */
    function config(msNavigationServiceProvider)
    {
        // Navigation
        /*msNavigationServiceProvider.saveItem('auth', {
            title : 'Auths',
            group : true,
            weight: 2
        });*/
    }
})();
