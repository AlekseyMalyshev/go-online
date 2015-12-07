'use strict';

let ObjectID = require('mongodb').ObjectID;
let express = require('express');
let router = express.Router();

let Game = require('../models/game');

let checkError = (err, res, game) => {
  if (err) {
    console.log('err: ', err);
    res.status(400).send(err);
  }
  else {
    res.json(game);
  }
}

router.post('/', (req, res) => {
  console.log('New game posted: ', req.body);
  let game = new Game(req.body);
  if (req.body.blackPlayer) {
    game.blackPlayer = ObjectID(req.userId);
  }
  else if (req.body.whitePlayer) {
    game.whitePlayer = ObjectID(req.userId);
  }
  else {
    res.status(400).send();
    return;
  }
  game.state = 0;
  console.log('New game: ', game);
  game.save((err, game) => {
    checkError(err, res, game);
  });
});

router.put('/:gameId', (req, res) => {
  var id = req.params.gameId;
  console.log('New move in: ', id);
  Game.findOne({_id: id}, (err, game) => {
      if (err) {
        checkError(err, res);
      }
      else if (!game) {
        checkError('Game not found', res);
      }
      else if (game.blackPlayer.equals(ObjectID(req.userId))) {
        req.body.player = 1;
        game.state = 2;
      }
      else if (game.whitePlayer.equals(ObjectID(req.userId))) {
        req.body.player = 2;
        game.state = 1;
      }
      else {
        res.status(401).send('Not your move');
        return;
      }
      game.moves.push(req.body);
      game.save((err, game) => {
        checkError(err, res, game);
      });
    });
});

router.put('/yeld/:gameId', (req, res) => {
  var id = req.params.gameId;
  console.log('Player yelded game: ', id);
  Game.findOne({_id: id}, (err, game) => {
      if (err) {
        checkError(err, res);
      }
      else if (!game) {
        checkError('Game not found', res);
      }
      else if (game.blackPlayer.equals(ObjectID(req.userId))) {
        game.state = 6;
      }
      else if (game.whitePlayer.equals(ObjectID(req.userId))) {
        game.state = 5;
      }
      else {
        res.status(401).send('Not your move');
        return;
      }
      game.save((err, game) => {
        checkError(err, res, game);
      });
    });
});

router.put('/quit/:gameId', (req, res) => {
  var id = req.params.gameId;
  console.log('Player quit game: ', id);
  Game.findOne({_id: id}, (err, game) => {
      if (err) {
        checkError(err, res);
      }
      else if (!game) {
        checkError('Game not found', res);
      }
      else if (game.blackPlayer.equals(ObjectID(req.userId))) {
        game.state = 3;
      }
      else if (game.whitePlayer.equals(ObjectID(req.userId))) {
        game.state = 4;
      }
      else {
        res.status(401).send('Not your move');
        return;
      }
      game.save((err, game) => {
        checkError(err, res, game);
      });
    });
});

router.get('/', (req, res) => {
  console.log('Getting valid games');
  Game.find({state: {$lt: 3}}, null, {sort: '-updated'})
    .populate('blackPlayer whitePlayer')
    .exec((err, games) => {
      checkError(err, res, games);
    });
});

router.put('/join/:gameId', (req, res) => {
  var id = req.params.gameId;
  console.log('Joining game with id: ', id);
  Game.findOne({_id: id, state: 0}, (err, game) => {
    if (game) {
      if (!game.blackPlayer) {
        game.blackPlayer = ObjectID(req.userId);
      }
      else if (!game.whitePlayer) {
        game.whitePlayer = ObjectID(req.userId);
      }
      game.state = 1;
      game.save((err, game) => {
        checkError(err, res, game);
      });
    }
    else {
      checkError(err, res);
    }
  });
});

router.get('/:gameId', (req, res) => {
  var id = req.params.gameId;
  console.log('Getting game with id: ', id);
  Game.findOne({_id: id})
    .populate('blackPlayer whitePlayer', 'firstName lastName _id')
    .exec((err, game) => {
      checkError(err, res, game);
    });
});

module.exports = router;
