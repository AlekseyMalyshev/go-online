'use strict';

var app = angular.module('Go', ['satellizer', 'btford.socket-io', 'ui.router']);

app.config(function($stateProvider, $urlRouterProvider, $authProvider) {

  //$urlRouterProvider.otherwise('login');

  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'partials/dashboard',
      controller: 'DashboardCtrl'
    })
    .state('games', {
      url: '/games',
      templateUrl: 'partials/games',
      controller: 'GamesCtrl'
    })
    .state('go', {
      url: '/go/:id',
      templateUrl: 'partials/go',
      controller: 'GoCtrl'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'partials/login',
      controller: 'LoginCtrl'
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'partials/profile',
      controller: 'ProfCtrl'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'partials/register',
      controller: 'RegCtrl'
    });

  $authProvider.facebook({
    clientId: '924337914326712'
  });

  $authProvider.linkedin({
    clientId: '77reigersixrfn'
  });

  $authProvider.twitter({
    clientId: 'T4Q5ltrRgY0svVhr56RCAbc1c'
  });
}).
run(['$auth', '$state', function($auth, $state) {
  if ($auth.isAuthenticated()) {
    $state.go('dashboard');
  }
  else {
    $state.go('login');
  }
}]).factory('socket', function (socketFactory) {
  return socketFactory();
});
