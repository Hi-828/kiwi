(function ()
{
  'use strict';

  angular
    .module('app.users.useredit', ['multipleSelect', 'smDateTimeRangePicker', 'ui.sortable', 'as.sortable', 'minicolors'])
    .config(config);

  /** @ngInject */
  function config($stateProvider)
  {
    //$urlRouterProvider.otherwise("");
    // State
    $stateProvider
      .state('app.user', {
        url      : '/users/:id',
        views    : {
          'content@app': {
            templateUrl: 'app/main/users/user/user.html',
            controller : 'UserController'
          }
        },
        bodyClass: 'user'
      })
      .state('app.user.profile', {
        url      : '/profile',
        views    : {
          'profile@app.user': {
            templateUrl: 'app/main/users/user/tabs/profile/profile.html',
            controller: 'ProfileController',
          }
        },
        data: {
          'selectedTab': 0
        },
        bodyClass: 'user'
      })
      .state('app.user.application', {
        url      : '/application',
        views    : {
          'application@app.user': {
            templateUrl: 'app/main/users/user/tabs/application/application.html',
            controller: 'ApplicationController',
          }
        },
        data: {
          'selectedTab': 1
        },
        bodyClass: 'user'
      })
      .state('app.user.financial', {
        url      : '/financial',
        views    : {
          'financial@app.user': {
            templateUrl: 'app/main/users/user/tabs/financial/financial.html',
            controller: 'FinancialController',
          }
        },
        data: {
          'selectedTab': 2
        },
        bodyClass: 'user'
      })
      .state('app.user.note', {
        url      : '/note',
        views    : {
          'note@app.user': {
            templateUrl: 'app/main/users/user/tabs/note/note.html',
            controller: 'NoteController',
          }
        },
        data: {
          'selectedTab': 3
        },
        bodyClass: 'user'
      })
      .state('app.user.featured', {
        url      : '/featured',
        views    : {
          'featured@app.user': {
            templateUrl: 'app/main/users/user/tabs/featured/featured.html',
            controller: 'FeaturedController',
          }
        },
        data: {
          'selectedTab': 4
        },
        bodyClass: 'user'
      })
      /*.state('app.user.studio', {
        url      : '/studio',
        views    : {
          'studio@app.user': {
            templateUrl: 'app/main/users/user/tabs/studio/studio.html',
            controller: 'UserStudioController',
          }
        },
        data: {
          'selectedTab': 6
        },
        bodyClass: 'user'
      })*/
      .state('app.user.setting', {
        url      : '/setting',
        views    : {
          'setting@app.user': {
            templateUrl: 'app/main/users/user/tabs/setting/setting.html',
            controller: 'SettingController',
          }
        },
        data: {
          'selectedTab': 7
        },
        bodyClass: 'user'
      })
      .state('app.user.product', {
        url      : '/product/:typeId',
        views    : {
          'product@app.user': {
            templateUrl: 'app/main/users/user/tabs/product/product.html',
            controller: 'UserProductController',
          }
        },
        bodyClass: 'user'
      })
      .state('app.user.message', {
        url      : '/message',
        views    : {
          'message@app.user': {
            templateUrl: 'app/main/users/user/tabs/message/message.html',
            controller: 'UserMessageController',
          }
        },
        data: {
          'selectedTab': 8
        },
        bodyClass: 'message'
      })
  }

})();
