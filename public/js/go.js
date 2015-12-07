'use strict';

app.controller('GoCtrl', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$auth', '$timeout', 'socket',
  function($scope, $rootScope, $http, $state, $stateParams, $auth, $timeout, socket) {

    var alphabet = ['-', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

    $scope.td = [];
    $scope.tr = [];
    $scope.player = 0;

    var mouseOverClass = '';
    var fixedClass = 'fixed';

    $rootScope.$on('$stateChangeStart', 
      function(event, toState, toParams, fromState, fromParams) {
        if (fromState.name === 'go') {
          socket.leave(toParams.id);
        }
      });

    $scope.init = function() {
      socket.emit('join game', $stateParams.id);
      $http.get('/api/games/' + $stateParams.id).then(initializeBoard,
        function(err) {
          if (err.status !== 401) {
            console.error(err);
          }
        });
    };

    function initializeBoard(response) {
      $scope.game = response.data;
      var td = [];
      var tr = [];
      for (var i = 0; i <= response.data.size; ++i) {
        td.push(alphabet[i]);
        tr.unshift(i);
      }
      $scope.td = td;
      $scope.tr = tr;

      var myId = $auth.getPayload()._id;
      if (myId === $scope.game.blackPlayer._id) {
        $scope.player = 1; // black player
        mouseOverClass = 'black-stone';
      }
      else if (myId === $scope.game.whitePlayer._id) {
        $scope.player = 2; // white player
        mouseOverClass = 'white-stone';
      }
      else {
        $scope.player = 0; // observer
      }

      $timeout(function() {
        $scope.game.moves.forEach(showMove);
      }, 500);
    }

    function showMove(move) {
      var cls = ' fixed';
      if (move.player === 1) {
        cls += ' black-stone';
      }
      else {
        cls += ' white-stone';
      }
      var element = document.getElementById(move.position);
      element.className = element.className + cls;
    }

    socket.on('new move', function(move) {
      var state = $scope.game.state;
      $scope.game.state = state === 1 ? 2 : state === 2 ? 1 : state;
      showMove(move);
    });

    socket.on('game over', function(state) {
      console.log(state);
      $scope.game.state = Number(state);
      console.log($scope.game.state);
    });

    $scope.yeld = function() {
      $http.put('/api/games/yeld/' + $stateParams.id).then(
        function(result) {
          var state = $scope.game.state;
          state = state === 1 ? 6 : state === 2 ? 5 : state;
          socket.emit('game over', state);
          $scope.game.state = state;
        },
        function(err) {
          if (err.status !== 401) {
            console.error(err);
          }
        });
    }

    $scope.quit = function() {
      $http.put('/api/games/quit/' + $stateParams.id).then(
        function(result) {
          var state = $scope.game.state;
          state = state === 1 ? 3 : state === 2 ? 4 : state;
          socket.emit('game over', state);
          $scope.game.state = state;
        },
        function(err) {
          if (err.status !== 401) {
            console.error(err);
          }
        });
    }

    $scope.entered = function($event) {
      $event.preventDefault();
      if ($scope.player === $scope.game.state &&
          !$($event.target).hasClass(fixedClass)) {
        $($event.target).addClass(mouseOverClass);
      }
    }

    $scope.left = function($event) {
      $event.preventDefault();
      if ($scope.player === $scope.game.state &&
          !$($event.target).hasClass(fixedClass)) {
        $($event.target).removeClass(mouseOverClass);
      }
    }

    $scope.move = function($event) {
      $event.preventDefault();
      if ($scope.player === $scope.game.state &&
          !$($event.target).hasClass(fixedClass)) {

        var state = $scope.game.state;
        $scope.game.state = state === 1 ? 2 : state === 2 ? 1 : state;
        var move = {
          position: $event.target.id
        };
        $http.put('/api/games/' + $stateParams.id, move).then(
          function(result) {
            move.player = $scope.player;
            socket.emit('new move', move);
            $($event.target).addClass(fixedClass + ' ' + mouseOverClass);
          },
          function(err) {
            if (err.status !== 401) {
              console.error(err);
            }
          });
      }
    };
  }]);
