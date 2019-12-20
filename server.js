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

var users = [];
var connections = [];
var typingUsers = [];
var gifts = [];
var turns = [];
var unlimitedTurns = [];
var challenges = ['Direction Game', 'Click Game'];
var gameStarted = false;

('use strict');
var excelToJson = require('convert-excel-to-json');

users = excelToJson({
  sourceFile: 'nameList.xlsx',
  header: { rows: 1 },
  columnToKey: {
    A: 'EID',
    B: 'Name'
  }
}).nameList;

console.log(connections);
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
  var challenge = challenges[Math.floor(Math.random() * challenges.length)];

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
    challenge: challenges
  }), 2000);
});

app.post('/api/challenge', (req, res) => {
  var newChallenge = req.body.challenge;
  console.log(newChallenge);
  challenges.push(newChallenge);
  res.json({
    result: 'New Challenge Added : ' + newChallenge
  });
});

app.delete('/api/challenge', (req, res) => {
  var delChallenge = req.body.challenge;
  console.log(`Removing challenge: ${delChallenge}...`);
  challenges.splice(challenges.indexOf(delChallenge), 1);
  res.json({
    result: 'Challenge Removed : ' + delChallenge
  });
  console.log(`Challenge Removed : ${delChallenge}`);
});

app.get('/api/gift', (req, res) => {
  const items = gifts.filter(gift => {
    return gift.stealCount < 3;
  });

  // res.json(items);
  // TO ADD INTENTIONAL LATENCY
  setTimeout(() =>  res.json(items), 2000);
});

app.get('/api/gift/all', (req, res) => {
  // res.json(gifts);
  // TO ADD INTENTIONAL LATENCY
  setTimeout(() =>  res.json(gifts), 2000);
});

app.post('/api/login', (req, res) => {
  const username = req.body.username;
  const socketId = req.body.socketId;
  const user = users.find(user => {
    return username.toLowerCase() === user.EID.toLowerCase();
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

    const userIndex = users.indexOf(user);

    user.loggedIn = true;
    user.socketId = socketId;
    users[userIndex] = user;

    turns.push(socketId);
    io.sockets.emit('user list updated', users);
    console.log('User logged in:', user);
    res.json({
      loggedIn: true,
      message: 'Login success',
      username: user.EID,
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
    users: users
  }), 2000);
});

app.post('/api/user', (req, res) => {
  var newEid = req.body.EID;
  var newName = req.body.Name;
  users.push({ EID: newEid, Name: newName });
  console.log(users);
  res.json({
    result: 'New User Added' + newName
  });
});

app.post('/api/game/stop', (req, res) => {
  if(!gameStarted) {
    res.json({
      stopped: false,
      message: 'Error on stopping game as game is not started yet'
    });
    return;
  }

  gameStarted = false;
  unlimitedTurns = [];
  turns = [];
  gifts = [];
  users.forEach(user => {
    if (user.loggedIn) {
      turns.push(user.socketId);
    }
  });

  console.log(gameStarted, unlimitedTurns, turns, gifts);
  res.json({
    stopped: true,
    message: 'Game has been reset'
  });
  io.sockets.emit('game has been reset');
});

app.get('/api/game/start', (req, res) => {
  if (gameStarted) {
    console.log('Failed to start game, game already started');
    res.json({
      started: false,
      message: 'Game is in progress'
    });
  } else if (turns.length === 0 && unlimitedTurns.length === 0) {
    console.log('Failed to start game, not enough players');
    res.json({
      started: false,
      message: 'Failed to start game, not enough players'
    });
  } else {
    var nextSocketId = turns[Math.floor(Math.random() * turns.length)];

    var userNext = users.find(user => user.socketId === nextSocketId);

    gameStarted = true;
    console.log(`Game started with ${turns.length} players`);
    io.sockets.emit('next turn', userNext);
    res.json({
      started: true,
      message: `Game started with ${turns.length} players`
    });
  }
});
// EXPRESS APIS

// SOCKETS
io.sockets.on('connection', socket => {
  socket.loggedIn = false;
  connections.push(socket);
  console.log(`Connected: ${connections.length} sockets connected`);

  socket.emit('handshake');
  socket.on('handshake success', ({ username, name }) => {
    socket.username = username;
    socket.name = name;
    socket.loggedIn = true;

    const user = users.find(user => user.EID === username);
    const userIndex = users.indexOf(user);

    user.loggedIn = true;
    user.socketId = socket.id;
    users[userIndex] = user;

    turns.push(socket.id);

    const gift = gifts.find(gift => gift.ownerUserName === socket.username);

    if (gift !== undefined) {
      const giftIndex = gifts.indexOf(gift);
      gift.ownerId = socket.id;
      gifts[giftIndex] = gift;
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

    const gift = gifts.find(gift => gift.ownerUserName === socket.username);

    if (gift !== undefined) {
      const giftIndex = gifts.indexOf(gift);
      gift.ownerId = socket.id;
      gifts[giftIndex] = gift;
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
      turns.splice(turns.indexOf(socket.id), 1);
      users[
        users.findIndex(user => user.socketId === socket.id)
      ].loggedIn = false;
      io.sockets.emit('user disconnected', socket.name);
    }
    typingUsers.splice(typingUsers.indexOf(socket.name), 1);
    connections.splice(connections.indexOf(socket), 1);
    console.log(`Disconnected: ${connections.length} sockets connected`);

    io.sockets.emit('someone is typing', typingUsers);
  });

  socket.on('end turn', data => {
    turns.splice(turns.indexOf(data), 1);

    if (turns.length === 0 && unlimitedTurns.length === 0) {
      io.sockets.emit('next turn', {
        message: 'No more user'
      });
    } else {
      var nextSocketId;

      if (turns.length === 0) {
        nextSocketId =
          unlimitedTurns[Math.floor(Math.random() * unlimitedTurns.length)];
      } else {
        nextSocketId = turns[Math.floor(Math.random() * turns.length)];
      }

      var userNext = users.find(user => user.socketId === nextSocketId);

      io.sockets.emit('next turn', userNext);
    }
  });

  socket.on('send message', data => {
    io.sockets.emit('new message', data);
  });

  socket.on('i am typing', data => {
    if (typingUsers.indexOf(socket.name) === -1) {
      typingUsers.push(socket.name);
    }
    io.sockets.emit('someone is typing', typingUsers);
  });

  socket.on('i am not typing', data => {
    typingUsers.splice(typingUsers.indexOf(socket.name), 1);
    io.sockets.emit('someone is typing', typingUsers);
  });

  socket.on('i got a gift', data => {
    var gift = data;

    gift.ownerId = socket.id;
    gift.ownerUserName = socket.username;
    gift.ownerName = socket.name;
    gift.stealCount = 0;

    gifts.push(gift);

    console.log('New gift registered:', gift);
    console.log(`Current total gifts: ${gifts.length} items`);

    socket.emit('gift registered', data);
    socket.broadcast.emit('someone got a gift', data);

    if (unlimitedTurns.indexOf(socket.id) > -1) {
      unlimitedTurns.splice(unlimitedTurns.indexOf(socket.id), 1);
    }
    console.log('Unlimited Turns Pool:', unlimitedTurns);
    console.log(`Unlimited Turns Pool: ${unlimitedTurns.length} players`);
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
    var gift = gifts.find(item => {
      return item.ownerId == data.oldOwnerId;
    });

    gifts.splice(gifts.indexOf(gift), 1);
    console.log('Gift removed:', gift);

    gift.ownerId = data.newOwnerId;
    gift.ownerName = data.newOwnerName;
    gift.ownerUserName = data.newOwnerUserName;
    gift.stealCount++;

    gifts.push(gift);
    console.log('Gift added:', gift);
    console.log('Gifts :', gifts);
    if (unlimitedTurns.indexOf(data.newOwnerId) > -1) {
      unlimitedTurns.splice(unlimitedTurns.indexOf(data.newOwnerId), 1);
    }
    if (unlimitedTurns.indexOf(data.enemyOwnerId) > -1) {
      unlimitedTurns.splice(unlimitedTurns.indexOf(data.enemyOwnerId), 1);
    }
    unlimitedTurns.push(data.enemyOwnerId);
    console.log('Unlimited Turns Pool:', unlimitedTurns);
    console.log(`Unlimited Turns Pool: ${unlimitedTurns.length} players`);
  });

  socket.on('kicked out', data => {
    var delName = data;
    var delUser = users.find(user => {
      return user.Name == data;
    });
    if (users.indexOf(delUser) > -1) {
      console.log(`Disconnected: ${connections.length} sockets connected`);
      io.sockets.emit('user kicked out', delName);
      console.log('User has been kicked out from the room: ', delName);
    }
  });
});
// SOCKETS
