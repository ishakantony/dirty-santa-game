var http = require('http');
var express = require('express');
var socketIo = require('socket.io');
var path = require('path');
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var app = express();

var server = http.createServer(app);

var io = socketIo.listen(server);

var USERS = [];
var CONNECTIONS = [];
var TYPING_USERS = [];
var GIFTS = [];
var TURNS = [];
var UNLIMITED_TURNS = [];
var CHALLENGES = ['Direction Game', 'Click Game'];
var GAME_INFO = {
  started: false
};

('use strict');
var excelToJson = require('convert-excel-to-json');

USERS = excelToJson({
  sourceFile: 'nameList.xlsx',
  header: { rows: 1 },
  columnToKey: {
    A: 'Username',
    B: 'Name'
  }
}).nameList;

console.log(CONNECTIONS);
// convert nameList.xlsx to json END

server.listen(PORT);
console.log(`Server started on port ${PORT}`);

// EXPRESS APIS
app.use(favicon(__dirname + '/assets/img/favicon.ico'));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({ express: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.get('/challenge', (req, res) => {
  res.sendFile(`${__dirname}/challengeList.html`);
});

app.get('/admin', (req, res) => {
  res.sendFile(`${__dirname}/admin.html`);
});

app.get('/api/challenge/random', (req, res) => {
  var challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];

  res.json({
    challenge: challenge
  });
});

app.get('/api/challenge', (req, res) => {
  // res.json({
  //   challenge: challenges
  // });
  // TO ADD INTENTIONAL LATENCY
  setTimeout(() =>  res.json({
    challenge: CHALLENGES
  }), 2000);
});

app.post('/api/challenge', (req, res) => {
  var newChallenge = req.body.challenge;
  console.log(newChallenge);
  CHALLENGES.push(newChallenge);
  res.json({
    result: 'New Challenge Added : ' + newChallenge
  });
});

app.delete('/api/challenge', (req, res) => {
  var delChallenge = req.body.challenge;
  console.log(`Removing challenge: ${delChallenge}...`);
  CHALLENGES.splice(CHALLENGES.indexOf(delChallenge), 1);
  res.json({
    result: 'Challenge Removed : ' + delChallenge
  });
  console.log(`Challenge Removed : ${delChallenge}`);
});

app.get('/api/gift', (req, res) => {
  const items = GIFTS.filter(gift => {
    return gift.stealCount < 3;
  });

  // res.json(items);
  // TO ADD INTENTIONAL LATENCY
  setTimeout(() =>  res.json(items), 2000);
});

app.get('/api/gift/all', (req, res) => {
  // res.json(gifts);
  // TO ADD INTENTIONAL LATENCY
  setTimeout(() =>  res.json(GIFTS), 2000);
});

app.post('/api/login', (req, res) => {
  const username = req.body.username;
  const socketId = req.body.socketId;
  const user = USERS.find(user => {
    return username.toLowerCase() === user.Username.toLowerCase();
  });

  if (user === undefined) {
    console.log(`Invalid username: ${username}`);
    res.json({
      loggedIn: false,
      message: 'Wrong username'
    });
  } else if (user.loggedIn == true) {
    console.log(`User already logged in: ${username}`);
    res.json({
      loggedIn: false,
      message: 'User already logged in'
    });
  } else {
    //users.push(user);

    const userIndex = USERS.indexOf(user);

    user.loggedIn = true;
    user.socketId = socketId;
    USERS[userIndex] = user;

    TURNS.push(socketId);
    io.sockets.emit('user list updated', USERS);
    console.log('User logged in:', user);
    res.json({
      loggedIn: true,
      message: 'Login success',
      username: user.Username,
      name: user.Name
    });
  }
});

app.get('/api/user', (req, res) => {
  // res.json({
  //   users: users
  // });
  // TO ADD INTENTIONAL LATENCY
  setTimeout(() =>  res.json({
    users: USERS
  }), 2000);
});

app.post('/api/user', (req, res) => {
  var newUsername = req.body.Username;
  var newName = req.body.Name;
  USERS.push({ Username: newUsername, Name: newName });
  console.log(USERS);
  res.json({
    result: 'New User Added' + newName
  });
});

app.post('/api/game/stop', (req, res) => {
  if(!GAME_INFO.started) {
    res.json({
      stopped: false,
      message: 'Error on stopping game as game is not started yet'
    });
    return;
  }

  GAME_INFO.started = false;
  UNLIMITED_TURNS = [];
  TURNS = [];
  GIFTS = [];
  USERS.forEach(user => {
    if (user.loggedIn) {
      TURNS.push(user.socketId);
    }
  });

  console.log(GAME_INFO.started, UNLIMITED_TURNS, TURNS, GIFTS);
  res.json({
    stopped: true,
    message: 'Game has been reset'
  });
  io.sockets.emit('game has been reset');
});

app.get('/api/game/start', (req, res) => {
  if (GAME_INFO.started) {
    console.log('Failed to start game, game already started');
    res.json({
      started: false,
      message: 'Game is in progress'
    });
  } else if (TURNS.length === 0 && UNLIMITED_TURNS.length === 0) {
    console.log('Failed to start game, not enough players');
    res.json({
      started: false,
      message: 'Failed to start game, not enough players'
    });
  } else {
    var nextSocketId = TURNS[Math.floor(Math.random() * TURNS.length)];

    var userNext = USERS.find(user => user.socketId === nextSocketId);

    GAME_INFO.started = true;
    console.log(`Game started with ${TURNS.length} players`);
    io.sockets.emit('next turn', userNext);
    res.json({
      started: true,
      message: `Game started with ${TURNS.length} players`
    });
  }
});
// EXPRESS APIS

// SOCKETS
io.sockets.on('connection', socket => {
  socket.loggedIn = false;
  CONNECTIONS.push(socket);
  console.log(`Connected: ${CONNECTIONS.length} sockets connected`);

  socket.emit('handshake');
  socket.on('handshake success', ({ username, name }) => {
    socket.username = username;
    socket.name = name;
    socket.loggedIn = true;

    const user = USERS.find(user => user.Username === username);
    const userIndex = USERS.indexOf(user);

    user.loggedIn = true;
    user.socketId = socket.id;
    USERS[userIndex] = user;

    TURNS.push(socket.id);

    const gift = GIFTS.find(gift => gift.ownerUserName === socket.username);

    if (gift !== undefined) {
      const giftIndex = GIFTS.indexOf(gift);
      gift.ownerId = socket.id;
      GIFTS[giftIndex] = gift;
      console.log(gift);
    }

    console.log(
      `Handshake Success: ID:${socket.id}, USERNAME:${socket.username}, LOGGEDIN:${socket.loggedIn}`
    );
    io.sockets.emit('new user enter', {
      username: socket.username,
      socketId: socket.id,
      name: socket.name
    });
  });

  socket.on('login success', ({ socketId, username, name }) => {
    socket.username = username;
    socket.name = name;
    socket.loggedIn = true;

    const gift = GIFTS.find(gift => gift.ownerUserName === socket.username);

    if (gift !== undefined) {
      const giftIndex = GIFTS.indexOf(gift);
      gift.ownerId = socket.id;
      GIFTS[giftIndex] = gift;
      console.log(gift);
    }

    console.log(
      `Login Success: ID:${socket.id}, USERNAME:${socket.username}, LOGGEDIN:${socket.loggedIn}`
    );

    io.sockets.emit('new user enter', {
      username: username,
      socketId: socketId,
      name: name
    });
  });

  socket.on('disconnect', data => {
    if (socket.loggedIn) {
      socket.loggedIn = false;
      TURNS.splice(TURNS.indexOf(socket.id), 1);
      USERS[
        USERS.findIndex(user => user.socketId === socket.id)
      ].loggedIn = false;
      io.sockets.emit('user disconnected', socket.name);
    }
    TYPING_USERS.splice(TYPING_USERS.indexOf(socket.name), 1);
    CONNECTIONS.splice(CONNECTIONS.indexOf(socket), 1);
    console.log(`Disconnected: ${CONNECTIONS.length} sockets connected`);

    io.sockets.emit('someone is typing', TYPING_USERS);
  });

  socket.on('end turn', data => {
    TURNS.splice(TURNS.indexOf(data), 1);

    if (TURNS.length === 0 && UNLIMITED_TURNS.length === 0) {
      io.sockets.emit('next turn', {
        message: 'No more user'
      });
    } else {
      var nextSocketId;

      if (TURNS.length === 0) {
        nextSocketId =
          UNLIMITED_TURNS[Math.floor(Math.random() * UNLIMITED_TURNS.length)];
      } else {
        nextSocketId = TURNS[Math.floor(Math.random() * TURNS.length)];
      }

      var userNext = USERS.find(user => user.socketId === nextSocketId);

      io.sockets.emit('next turn', userNext);
    }
  });

  socket.on('send message', data => {
    io.sockets.emit('new message', data);
  });

  socket.on('i am typing', data => {
    if (TYPING_USERS.indexOf(socket.name) === -1) {
      TYPING_USERS.push(socket.name);
    }
    io.sockets.emit('someone is typing', TYPING_USERS);
  });

  socket.on('i am not typing', data => {
    TYPING_USERS.splice(TYPING_USERS.indexOf(socket.name), 1);
    io.sockets.emit('someone is typing', TYPING_USERS);
  });

  socket.on('i got a gift', data => {
    var gift = data;

    gift.ownerId = socket.id;
    gift.ownerUserName = socket.username;
    gift.ownerName = socket.name;
    gift.stealCount = 0;

    GIFTS.push(gift);

    console.log('New gift registered:', gift);
    console.log(`Current total gifts: ${GIFTS.length} items`);

    socket.emit('gift registered', data);
    socket.broadcast.emit('someone got a gift', data);

    if (UNLIMITED_TURNS.indexOf(socket.id) > -1) {
      UNLIMITED_TURNS.splice(UNLIMITED_TURNS.indexOf(socket.id), 1);
    }
    console.log('Unlimited Turns Pool:', UNLIMITED_TURNS);
    console.log(`Unlimited Turns Pool: ${UNLIMITED_TURNS.length} players`);
  });

  socket.on('i challenge you', data => {
    console.log('i challenge you:', data);
    data.challengerId = socket.id;
    data.challengerUsername = socket.username;

    socket.broadcast.to(data.ownerId).emit('someone challenge me', data);

    io.sockets.emit('someone wants to steal a gift', data);
  });

  socket.on('i am finish', data => {
    console.log('i am finish:', data);
    socket.broadcast.to(data.recipient).emit('enemy finished', data);
  });

  socket.on('battle is over', data => {
    console.log('battle is over:', data);
    io.sockets.emit('battle is over', data);
  });

  socket.on('i have stolen a gift', data => {
    console.log('i have stolen a gift', data);
    var gift = GIFTS.find(item => {
      return item.ownerId == data.oldOwnerId;
    });

    GIFTS.splice(GIFTS.indexOf(gift), 1);
    console.log('Gift removed:', gift);

    gift.ownerId = data.newOwnerId;
    gift.ownerName = data.newOwnerName;
    gift.ownerUserName = data.newOwnerUserName;
    gift.stealCount++;

    GIFTS.push(gift);
    console.log('Gift added:', gift);
    console.log('Gifts :', GIFTS);
    if (UNLIMITED_TURNS.indexOf(data.newOwnerId) > -1) {
      UNLIMITED_TURNS.splice(UNLIMITED_TURNS.indexOf(data.newOwnerId), 1);
    }
    if (UNLIMITED_TURNS.indexOf(data.enemyOwnerId) > -1) {
      UNLIMITED_TURNS.splice(UNLIMITED_TURNS.indexOf(data.enemyOwnerId), 1);
    }
    UNLIMITED_TURNS.push(data.enemyOwnerId);
    console.log('Unlimited Turns Pool:', UNLIMITED_TURNS);
    console.log(`Unlimited Turns Pool: ${UNLIMITED_TURNS.length} players`);
  });

  socket.on('kicked out', data => {
    var delName = data;
    var delUser = USERS.find(user => {
      return user.Name == data;
    });
    if (USERS.indexOf(delUser) > -1) {
      console.log(`Disconnected: ${CONNECTIONS.length} sockets connected`);
      io.sockets.emit('user kicked out', delName);
      console.log('User has been kicked out from the room: ', delName);
    }
  });
});
// SOCKETS
