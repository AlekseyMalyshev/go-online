'use strict';

app.controller('DashboardCtrl', ['$scope', '$http', '$state', '$stateParams',
  function($scope, $http, $state, $stateParams) {

    $scope.init = function() {
      $http.get('/api/games').then(function(response) {
        $scope.games = response.data;
      }, function(err) {
        if (err.status !== 401) {
          console.error(err);
        }
      });
    };

    $scope.go = function(id) {
      console.log('Joining game with id: ', id);
      $http.put('/api/games/join/' + id).then(function(response) {
        console.log(response.data);
        $state.go('go', {id: id});
      }, function(err) {
        if (err.status !== 401) {
          console.error(err);
        }
      });
    }

    $scope.new = function(size, color) {
      var game = {size: size}
      if (color) {
        game.whitePlayer = true;
      }
      else {
        game.blackPlayer = true;
      }

      $http.post('/api/games', game).then(function(response) {
        $state.go('go', {id: response.data._id});
      },
      function(err) {
        if (err.status !== 401) {
          console.error(err);
        }
      });
    }
  }]);

app.filter('games', function() {
  return function(input, size, current, waiting) {
    input = input || [];
    return input.filter(function(v) {
      return v.size === size &&
       (!current || v.state === 1 || v.state === 2) &&
       (!waiting || v.state === 0);
    });
  };
})
