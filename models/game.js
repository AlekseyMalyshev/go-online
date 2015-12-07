'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let gameSchema = mongoose.Schema({
    size: Number,
    //  9 - learner
    // 13 - beginner
    // 17 - archaic
    // 19 - standard
    blackPlayer: {type: Schema.Types.ObjectId, ref: 'users'},
    whitePlayer: {type: Schema.Types.ObjectId, ref: 'users'},
    moves: [{player: Number, position: String}],
    state: Number,
    // 0 - new game with one player
    // 1 - black move
    // 2 - white move
    // 3 - cancelled by black
    // 4 - cancelled by white
    // 5 - black won
    // 6 - white won
    updated: {type: Date, default: Date.now}
  }
);

module.exports = mongoose.model('game', gameSchema);
