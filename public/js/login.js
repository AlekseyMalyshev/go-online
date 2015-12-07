'use strict';

app.controller('LoginCtrl', ['$scope', '$auth', '$templateCache', '$state', '$stateParams',
  function($scope, $auth, $templateCache, $state, $stateParams) {

    $scope.user = {};

    $scope.login = function() {
      $auth.login($scope.user, { url: '/api/users/authenticate' })
        .then(function(response) {
          console.log('signed as ', $scope.user.email);
          $state.go('dashboard');
        })
        .catch(function(err) {
          var text;
          if (err.status === 401) {
            text = 'Authentication failed, try again.';
          }
          else {
            text = 'We we not able to log you in at this time.';
          }
          $('h4.error').text(text);
          $('div#show-error').modal();
        });
    }

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          $state.go('dashboard');
        })
        .catch(function(err) {
          console.log('auth error: ', err)
        });
    };
  }
]);

