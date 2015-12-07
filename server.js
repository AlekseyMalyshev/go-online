
'use strict';

let express = require('express');
let morgan = require('morgan');
let bodyParser = require('body-parser');
var mongoose = require('mongoose');

let gameApi = require('./routes/games');
let userApi = require('./routes/users');

let facebook = require('./routes/auth/facebook');
let twitter = require('./routes/auth/twitter');
let linkedin = require('./routes/auth/linkedin');

let index = require('./routes/index');
let partials = require('./routes/partials');

let auth = require('./config/auth');

let DATABASE = process.env.MONGOLAB_URI || 'mongodb://localhost/go';
console.log('Connecting to mongodb: ', DATABASE);
mongoose.connect(DATABASE);

let app = express();

app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(express.static('bower_components'));
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(auth.auth);

app.use('/api/games', auth.isAuth, gameApi);
app.use('/api/users', userApi);

app.use('/auth/facebook', facebook);
app.use('/auth/twitter', twitter);
app.use('/auth/linkedin', linkedin);

app.use('/', index);
app.use('/partials', partials);

let PORT = process.env.PORT || 3000;
let server = require('http').createServer(app);
let io = require('socket.io')(server);

server.listen(PORT, () => {
  console.log('Server listening at port %d', PORT);
});

process.on('exit', (code) => {
  mongoose.disconnect();
  console.log('About to exit with code:', code);
});

io.on('connection', function (socket) {

  socket.on('join game', function (game) {
    socket.join(game);
    socket.game = game;
  });

  socket.on('leave game', function (game) {
    socket.leave(game);
    delete socket.game;
  });

  socket.on('game over', function (data) {
    socket.to(socket.game).emit('game over', data);
  });

  socket.on('new move', function (data) {
    socket.to(socket.game).emit('new move', data);
  });
});
