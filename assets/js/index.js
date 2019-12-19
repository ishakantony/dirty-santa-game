var $loginArea = $('#loginArea');
var $mainArea = $('#mainArea');
var $chatContainer = $('#chatContainer');
var $chatMessageArea = $('#chatMessageArea');
var $messageForm = $('#messageForm');
var $message = $('#message');
var $loginForm = $('#loginForm');
var $username = $('#username');
var $wrongUsernameFormatAlert = $('#wrongUsernameFormatAlert');
var $userListArea = $('#userListArea');
var $typingIndicatorArea = $('#typingIndicatorArea');
var $typingPlaceholder = $('#typingPlaceholder');
var $giftForm = $('#giftForm');
var $gift = $('#gift');
var $giftModal = $('#giftModal');
var $challengeModal = $('#challengeModal');
var $challengePlaceholder = $('#challengePlaceholder');
var $challengeAcceptButton = $('#challengeAcceptButton');
var $myTurnButton = $('#myTurnButton');
var $turnModal = $('#turnModal');
var $stealModal = $('#stealModal');
var $stealModalArea = $('#stealModalArea');
var $stealButton = $('#stealButton');
var $clickGameModal = $('#clickGameModal');
var $clickGameStartButton = $('#clickGameStartButton');
var $clickGameCountdown = $('#clickGameCountdown');
var $clickGameModalArea = $('#clickGameModalArea');
var $clickGameWaiting = $('#clickGameWaiting');
var $clickGameCalculating = $('#clickGameCalculating');
var $clickGameResult = $('#clickGameResult');
var $directionGameModal = $('#directionGameModal');
var $directionGameLeftButton = $('#directionGameLeftButton');
var $directionGameRightButton = $('#directionGameRightButton');
var $directionGameCountdown = $('#directionGameCountdown');
var $directionGameIndicator = $('#directionGameIndicator');
var $directionGameModalArea = $('#directionGameModalArea');
var $directionGameWaiting = $('#directionGameWaiting');
var $directionGameCalculating = $('#directionGameCalculating');
var $directionGameResult = $('#directionGameResult');
var $directionGameCounter = $('#directionGameCounter');
var $turnAnnouncementModal = $('#turnAnnouncementModal');
var $turnAnnouncementModalArea = $('#turnAnnouncementModalArea');
var $turnAnnouncementModalButton = $('#turnAnnouncementModalButton');
var $customGameModal = $('#customGameModal');
var $iWonButton = $('#iWonButton');
var $myOpponentWonButton = $('#myOpponentWonButton');
var $customGameWaiting = $('#customGameWaiting');
var $customGamePlaying = $('#customGamePlaying');
var $customGameCalculating = $('#customGameCalculating');
var $customGameResult = $('#customGameResult');
var $gameInfoModal = $('#gameInfoModal');
var $gameInfoModalArea = $('#gameInfoModalArea');
var $loading = $('#loading');
var tempChallenge = null;
var game = {
  totalCount: 5,
  challenge: '',
  gift: '',
  giftOwnerId: '',
  player: {
    id: '',
    name: '',
    username: '',
    count: 0,
    finished: false
  },
  enemy: {
    id: '',
    name: '',
    username: '',
    count: 0,
    finished: false
  }
};

var resetGame = function() {
  game = {
    totalCount: 5,
    challenge: '',
    gift: '',
    giftOwnerId: '',
    player: {
      id: '',
      name: '',
      count: 0,
      finished: false
    },
    enemy: {
      id: '',
      name: '',
      count: 0,
      finished: false
    }
  };
};

var showWrongUsernameAlert = function() {
  var html = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Oops!</strong> Kindly use username without space or any special characters except ".", use your own employee id only.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;

  $wrongUsernameFormatAlert.html(html);
};

var showWrongEidAlert = function() {
  var html = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Oops!</strong> Kindly enter your employee ID to enter the room.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;

  $wrongUsernameFormatAlert.html(html);
};

var showUserAlreadyLoggedInAlert = function() {
  var html = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Oops!</strong> Looks like you have already logged into the system, please logged out before proceed.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;

  $wrongUsernameFormatAlert.html(html);
};

var writeUserLeaving = function(username) {
  var html = `
        <div class="row my-3">
            <div class="col-auto border p-2 bg-light font-italic">
                <strong>${username}</strong> has left the chat room.
            </div>
        </div>
    `;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var writeUserKickedOut = function(username) {
  var html = `
  <div class="row my-3">
      <div class="col-auto border p-2 bg-light font-italic">
          <strong>${username}</strong> has been kicked out by admin.
      </div>
  </div>
`;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var writeNewUserEnter = function(name) {
  var html = `
        <div class="row my-3">
            <div class="col-auto border p-2 bg-light font-italic">
                <strong>${name}</strong> entered the chat room.
            </div>
        </div>
    `;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var writeOwnUserEnter = function() {
  var html = `
        <div class="row my-3 justify-content-end">
            <div class="col-auto border p-2 bg-light font-italic">
                <strong>You</strong> entered the chat room.
            </div>
        </div>
    `;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var writeMessageFromOther = function(name, message) {
  var html = `
        <div class="row my-3">
            <div class="col-auto border p-2 bg-light">
                <strong>${name}: </strong>${message}
            </div>
        </div>
    `;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var writeSomeoneGotAGift = function(data) {
  var html = `
        <div class="row my-3">
            <div class="col-auto border p-2 bg-light">
                <h5 class="text-danger font-weight-bold">System Announcement</h5>
                <p><strong>${data.ownerName}</strong> has gotten: <img id="giftBox" src="/img/giftbox.svg"/><strong>${data.gift}</strong></p>
            </div>
        </div>
    `;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var writeGameHasBeenReset = function() {
  var html = `
        <div class="row my-3">
            <div class="col-auto border p-2 bg-light">
                <h5 class="text-danger font-weight-bold">System Announcement</h5>
                <p><strong>Game</strong> has been <strong>reset.</strong> Please wait...</p>
            </div>
        </div>
    `;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var writeSomeoneWantsToStealAGift = function({
  challengerUsername,
  gift,
  ownerName,
  challenge
}) {
  if (ownerName === socket.username) {
    ownerName = 'you';
  }

  var html = `
        <div class="row my-3">
            <div class="col-auto border p-2 bg-light">
                <h5 class="text-danger font-weight-bold">System Announcement</h5>
                <p><strong>${challengerUsername}</strong> wants to steal <strong>${gift}</strong> from <strong>${ownerName}</strong> with a challenge of <strong>${challenge}</strong>.</p>
            </div>
        </div>
    `;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var writeIWantToStealAGift = function({ gift, ownerName, challenge }) {
  var html = `
        <div class="row my-3 justify-content-end">
            <div class="col-auto border p-2 bg-light">
                i want to steal <strong>${gift}</strong> from <strong>${ownerName}</strong> with a challenge of <strong>${challenge}</strong>.
            </div>
        </div>
    `;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var writeIGotAGift = function(data) {
  var html = `
        <div class="row my-3 justify-content-end">
            <div class="col-auto border p-2 bg-light">
                i have gotten: <strong>${data.gift}</strong>.
            </div>
        </div>
    `;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var writeMessageFromSelf = function(message) {
  var html = `
        <div class="row my-3 justify-content-end">
            <div class="col-auto border p-2 bg-light">
                ${message}
            </div>
        </div>
    `;

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var showWinnerOfClickGame = function(clickGame) {
  switchClickGameState('calculating');

  setTimeout(() => {
    if (clickGame.player.count == clickGame.enemy.count) {
      var html = `
                <h1 class="text-center text-primary my-5">You Draw!</h1>
                <button class="btn btn-block btn-primary" data-dismiss="modal" onclick="endTurn('Click Game')">OK</button>
            `;
      $clickGameResult.html(html);
      if (clickGame.giftOwnerId == clickGame.player.id) {
        $myTurnButton.addClass('disabled');
        $myTurnButton.attr('disabled', true);
        var request = {
          oldOwnerId: clickGame.giftOwnerId,
          newOwnerId: clickGame.player.id,
          newOwnerName: clickGame.player.name,
          newOwnerUserName: clickGame.player.username,
          enemyOwnerId: clickGame.enemy.id
        };

        socket.emit('i have stolen a gift', request);
      } else {
        $myTurnButton.removeClass('disabled');
        $myTurnButton.attr('disabled', false);
      }
    } else if (clickGame.player.count > clickGame.enemy.count) {
      var html = `
                <h1 class="text-center text-success my-5">You Win!</h1>
                <button class="btn btn-block btn-primary" data-dismiss="modal" onclick="endTurn('Click Game')">OK</button>
            `;
      $clickGameResult.html(html);
      $myTurnButton.addClass('disabled');
      $myTurnButton.attr('disabled', true);

      var request = {
        oldOwnerId: clickGame.giftOwnerId,
        newOwnerId: clickGame.player.id,
        newOwnerName: clickGame.player.name,
        newOwnerUserName: clickGame.player.username,
        enemyOwnerId: clickGame.enemy.id
      };

      socket.emit('i have stolen a gift', request);
    } else {
      var html = `
                <h1 class="text-center text-danger my-5">You Lose!</h1>
                <button class="btn btn-block btn-primary" data-dismiss="modal" onclick="endTurn('Click Game')">OK</button>
            `;
      $clickGameResult.html(html);
      $myTurnButton.removeClass('disabled');
      $myTurnButton.attr('disabled', false);
    }

    $clickGameStartButton.removeClass('disabled');
    $clickGameStartButton.attr('disabled', false);
    $clickGameStartButton.data('count', 0);
    $clickGameCountdown.html(clickGame.totalCount);
    switchClickGameState('result');
  }, 2000);
};

var showWinnerOfCustomGame = function(clickGame) {
  switchClickGameState('calculating');

  setTimeout(() => {
    if (clickGame.player.count == clickGame.enemy.count) {
      game.player.finished = false;
      game.enemy.finished = false;
      var html = `
                <h1 class="text-center text-primary my-5">You Draw!</h1>
                <p>It appears that you and your opponent chose the same option, please choose different option from each other depending on your challenge result.</p>
                <button class="btn btn-block btn-primary" onclick="switchCustomGameState('playing')">OK</button>
            `;
      $customGameResult.html(html);
    } else if (clickGame.player.count > clickGame.enemy.count) {
      var html = `
                <h1 class="text-center text-success my-5">You Win!</h1>
                <button class="btn btn-block btn-primary" data-dismiss="modal" onclick="endTurn('Custom Game')">OK</button>
            `;
      $customGameResult.html(html);
      $myTurnButton.addClass('disabled');
      $myTurnButton.attr('disabled', true);

      var request = {
        oldOwnerId: clickGame.giftOwnerId,
        newOwnerId: clickGame.player.id,
        newOwnerName: clickGame.player.name,
        newOwnerUserName: clickGame.player.username,
        enemyOwnerId: clickGame.enemy.id
      };

      socket.emit('i have stolen a gift', request);
    } else {
      var html = `
                <h1 class="text-center text-danger my-5">You Lose!</h1>
                <button class="btn btn-block btn-primary" data-dismiss="modal" onclick="endTurn('Custom Game')">OK</button>
            `;
      $customGameResult.html(html);
      $myTurnButton.removeClass('disabled');
      $myTurnButton.attr('disabled', false);
    }

    switchCustomGameState('result');
  }, 2000);
};

var switchClickGameState = function(state) {
  switch (state) {
    case 'playing':
      $clickGameModalArea.removeClass('d-none');
      $clickGameCalculating.addClass('d-none');
      $clickGameWaiting.addClass('d-none');
      $clickGameResult.addClass('d-none');
      break;

    case 'waiting':
      $clickGameModalArea.addClass('d-none');
      $clickGameCalculating.addClass('d-none');
      $clickGameWaiting.removeClass('d-none');
      $clickGameResult.addClass('d-none');
      break;

    case 'calculating':
      $clickGameModalArea.addClass('d-none');
      $clickGameCalculating.removeClass('d-none');
      $clickGameWaiting.addClass('d-none');
      $clickGameResult.addClass('d-none');
      break;

    case 'result':
      $clickGameModalArea.addClass('d-none');
      $clickGameCalculating.addClass('d-none');
      $clickGameWaiting.addClass('d-none');
      $clickGameResult.removeClass('d-none');
      break;

    default:
      $clickGameModalArea.removeClass('d-none');
      $clickGameCalculating.addClass('d-none');
      $clickGameWaiting.addClass('d-none');
      $clickGameResult.addClass('d-none');
      break;
  }
};

var switchCustomGameState = function(state) {
  switch (state) {
    case 'playing':
      $customGamePlaying.removeClass('d-none');
      $customGameCalculating.addClass('d-none');
      $customGameWaiting.addClass('d-none');
      $customGameResult.addClass('d-none');
      break;

    case 'waiting':
      $customGamePlaying.addClass('d-none');
      $customGameCalculating.addClass('d-none');
      $customGameWaiting.removeClass('d-none');
      $customGameResult.addClass('d-none');
      break;

    case 'calculating':
      $customGamePlaying.addClass('d-none');
      $customGameCalculating.removeClass('d-none');
      $customGameWaiting.addClass('d-none');
      $customGameResult.addClass('d-none');
      break;

    case 'result':
      $customGamePlaying.addClass('d-none');
      $customGameCalculating.addClass('d-none');
      $customGameWaiting.addClass('d-none');
      $customGameResult.removeClass('d-none');
      break;

    default:
      $customGamePlaying.removeClass('d-none');
      $customGameCalculating.addClass('d-none');
      $customGameWaiting.addClass('d-none');
      $customGameResult.addClass('d-none');
      break;
  }
};

var showWinnerOfDirectionGame = function(directionGame) {
  switchDirectionGameState('calculating');
  setTimeout(() => {
    if (directionGame.player.count == directionGame.enemy.count) {
      var html = `
                <h1 class="text-center text-primary my-5">You Draw!</h1>
                <button class="btn btn-block btn-primary" data-dismiss="modal" onclick="endTurn('Direction Game')">OK</button>
            `;
      $directionGameResult.html(html);
      if (directionGame.giftOwnerId == directionGame.player.id) {
        $myTurnButton.addClass('disabled');
        $myTurnButton.attr('disabled', true);
        var request = {
          oldOwnerId: directionGame.giftOwnerId,
          newOwnerId: directionGame.player.id,
          newOwnerName: directionGame.player.name,
          newOwnerUserName: directionGame.player.username,
          enemyOwnerId: directionGame.enemy.id
        };

        socket.emit('i have stolen a gift', request);
      } else {
        $myTurnButton.removeClass('disabled');
        $myTurnButton.attr('disabled', false);
      }
    } else if (directionGame.player.count > directionGame.enemy.count) {
      var html = `
                <h1 class="text-center text-success my-5">You Win!</h1>
                <button class="btn btn-block btn-primary" data-dismiss="modal" onclick="endTurn('Direction Game')">OK</button>
            `;
      $directionGameResult.html(html);
      $myTurnButton.addClass('disabled');
      $myTurnButton.attr('disabled', true);

      var request = {
        oldOwnerId: directionGame.giftOwnerId,
        newOwnerId: directionGame.player.id,
        newOwnerName: directionGame.player.name,
        newOwnerUserName: directionGame.player.username,
        enemyOwnerId: directionGame.enemy.id
      };

      socket.emit('i have stolen a gift', request);
    } else {
      var html = `
                <h1 class="text-center text-danger my-5">You Lose!</h1>
                <button class="btn btn-block btn-primary" data-dismiss="modal" onclick="endTurn('Direction Game')">OK</button>
            `;
      $directionGameResult.html(html);
      $myTurnButton.removeClass('disabled');
      $myTurnButton.attr('disabled', false);
    }

    $directionGameRightButton.attr('disabled', false);
    $directionGameRightButton.removeClass('disabled');
    $directionGameLeftButton.attr('disabled', false);
    $directionGameLeftButton.removeClass('disabled');
    $directionGameCounter.data('count', 0);
    $directionGameIndicator.html('Left or Right?');
    $directionGameCountdown.html(directionGame.totalCount);
    switchDirectionGameState('result');
  }, 2000);
};

var switchDirectionGameState = function(state) {
  switch (state) {
    case 'playing':
      $directionGameModalArea.removeClass('d-none');
      $directionGameCalculating.addClass('d-none');
      $directionGameWaiting.addClass('d-none');
      $directionGameResult.addClass('d-none');
      break;

    case 'waiting':
      $directionGameModalArea.addClass('d-none');
      $directionGameCalculating.addClass('d-none');
      $directionGameWaiting.removeClass('d-none');
      $directionGameResult.addClass('d-none');
      break;

    case 'calculating':
      $directionGameModalArea.addClass('d-none');
      $directionGameCalculating.removeClass('d-none');
      $directionGameWaiting.addClass('d-none');
      $directionGameResult.addClass('d-none');
      break;

    case 'result':
      $directionGameModalArea.addClass('d-none');
      $directionGameCalculating.addClass('d-none');
      $directionGameWaiting.addClass('d-none');
      $directionGameResult.removeClass('d-none');
      break;

    default:
      $directionGameModalArea.removeClass('d-none');
      $directionGameCalculating.addClass('d-none');
      $directionGameWaiting.addClass('d-none');
      $directionGameResult.addClass('d-none');
      break;
  }
};

var writeBattleResult = function(data) {
  var winner, loser, status;

  if (data.player.count == data.enemy.count) {
    status = 'draw';
    winner = data.player.name;
    loser = data.enemy.name;
  } else if (data.player.count > data.enemy.count) {
    status = 'player win';
    winner = data.player.name;
    loser = data.enemy.name;
  } else {
    status = 'player lose';
    winner = data.enemy.name;
    loser = data.player.name;
  }

  if (winner === socket.username) {
    winner = 'you';
  }

  if (loser === socket.username) {
    loser = 'you';
  }

  var html = '';

  if (status == 'draw') {
    html = `
            <div class="row my-3">
                <div class="col-auto border p-2 bg-light">
                    <h5 class="text-danger font-weight-bold">System Announcement</h5>
                    <p>The challenge of <strong>${data.challenge}</strong> has resulted in <strong>${status}</strong> between <strong>${winner}</strong> and <strong>${loser}</strong>, the gift remain it's ownership: <strong>${data.gift}</strong>.</p>
                </div>
            </div>
        `;
  } else {
    html = `
            <div class="row my-3">
                <div class="col-auto border p-2 bg-light">
                    <h5 class="text-danger font-weight-bold">System Announcement</h5>
                    <p><strong>${winner}</strong> has won the challenge of <strong>${data.challenge}</strong> against <strong>${loser}</strong> and successfully steal the gift: <strong>${data.gift}</strong>.</p>
                </div>
            </div>
        `;
  }

  $chatMessageArea.append(html);
  $chatContainer.scrollTop($chatContainer.prop('scrollHeight'));
};

var endTurn = function(challenge) {
  if (challenge === 'received a gift') {
    setTimeout(() => {
      socket.emit('end turn', socket.id);
    }, 1000);
    return;
  }
  if (game.player.id != game.giftOwnerId) {
    setTimeout(() => {
      socket.emit('end turn', socket.id);
    }, 1000);
  }
  resetGame();
};

var startDirectionGame = function() {
  var totalCount = game.totalCount;
  var countdown = setInterval(() => {
    $directionGameCountdown.html(totalCount);
    totalCount--;
    if (totalCount < 0) {
      clearInterval(countdown);

      $directionGameRightButton.addClass('disabled');
      $directionGameRightButton.attr('disabled', true);
      $directionGameLeftButton.addClass('disabled');
      $directionGameLeftButton.attr('disabled', true);

      game.player.finished = true;

      var data = {
        count: game.player.count,
        recipient: game.enemy.id
      };

      socket.emit('i am finish', data);

      switchDirectionGameState('waiting');
      if (game.player.finished && game.enemy.finished) {
        showWinnerOfDirectionGame(game);
      }
    }
  }, 1000);
};

var randomizeLeftRight = function() {
  if (Math.floor(Math.random() * 100) % 2) {
    $directionGameIndicator.html('Left');
  } else {
    $directionGameIndicator.html('Right');
  }
};

var closeAllModals = function() {
  $turnAnnouncementModal.modal('hide');
  $turnModal.modal('hide');
  $giftModal.modal('hide');
  $stealModal.modal('hide');
  $challengeModal.modal('hide');
  $clickGameModal.modal('hide');
  $directionGameModal.modal('hide');
  $customGameModal.modal('hide');
}

var startSpinner = function() {
  $loading.removeClass('d-none');
  $loading.addClass('d-flex');
};

var endSpinner = function() {
  $loading.removeClass('d-flex');
  $loading.addClass('d-none');
};

// SOCKETS
var socket = io.connect();

socket.on('new message', data => {
  if (data.username === socket.username) {
    writeMessageFromSelf(data.message);
  } else {
    writeMessageFromOther(data.name, data.message);
  }
});

socket.on('new user enter', data => {
  if (data.socketId === socket.id) {
    writeOwnUserEnter();
  } else {
    writeNewUserEnter(data.name);
  }
});

socket.on('user disconnected', data => {
  writeUserLeaving(data);
});

socket.on('user kicked out', data => {
  writeUserKickedOut(data);
  if (socket.username === data) {
    // Event to show "You have been kicked out by admin"
    var html = `
    <h5 class="font-weight-bold text-center text-danger">You have been kicked out by Admin.</h5>
  `;
    $turnAnnouncementModalButton.off();
    $turnAnnouncementModalArea.html(html);
    $turnAnnouncementModal.modal('show');
    $turnAnnouncementModalButton.on('click', e => {
      window.location.reload();
    });
  }
});

socket.on('user list updated', data => {
  var html = '';

  for (let i = 0; i < data.length; i++) {
    if (socket.username === data[i].Name) {
      html += `
      <li class="list-group-item"><b>${data[i].Name}</b></li>
  `;
    } else {
      html += `
              <li class="list-group-item">${data[i].Name}</li>
          `;
    }
  }

  $userListArea.html(html);
});

socket.on('someone is typing', data => {
  if (data.length === 0) {
    $typingIndicatorArea.addClass('d-none');
  } else if (data.length === 1 && data[0] === socket.name) {
    $typingIndicatorArea.addClass('d-none');
  } else {
    var tempData = data;
    if (data.length > 1 && data.indexOf(socket.name) > -1) {
      tempData.splice(data.indexOf(socket.name), 1);
    }
    var names;
    var html;
    if (tempData.length === 1) {
      names = tempData.join(', ');
      html = `
                <strong id="">${names} </strong> is typing...
            `;
    } else if (tempData.length > 3) {
      names = tempData.slice(0, 3).join(', ');
      var others = tempData.length - 3;
      html = `
                <strong id="">${names} and ${others} others </strong> are typing...
            `;
    } else {
      names = tempData.join(', ');
      html = `
                <strong id="">${names} </strong> are typing...
            `;
    }
    $typingPlaceholder.html(html);
    $typingIndicatorArea.removeClass('d-none');
  }
});

socket.on('gift registered', data => {
  $myTurnButton.addClass('disabled');
  $myTurnButton.attr('disabled', true);
  $gift.val('');
  $giftModal.modal('hide');
  $turnModal.modal('hide');
  $message.focus();

  writeIGotAGift(data);
});

socket.on('someone got a gift', data => {
  writeSomeoneGotAGift(data);
});

socket.on('someone wants to steal a gift', data => {
  if (data.challengerId === socket.id) {
    writeIWantToStealAGift(data);
  } else {
    writeSomeoneWantsToStealAGift(data);
  }
});

socket.on('someone challenge me', data => {
  game.challenge = data.challenge;
  game.gift = data.gift;
  game.giftOwnerId = data.ownerId;
  game.player.id = socket.id;
  game.player.username = socket.username;
  game.player.name = socket.name;
  game.enemy.id = data.challengerId;
  game.enemy.username = data.challengerUsername;
  game.enemy.name = data.challengerName;

  if (data.challenge === 'Click Game') {
    switchClickGameState('playing');
    $clickGameModal.modal({
      backdrop: 'static',
      keyboard: false
    });
  } else if (data.challenge === 'Direction Game') {
    switchDirectionGameState('playing');
    $directionGameModal.modal({
      backdrop: 'static',
      keyboard: false
    });
  } else {
    switchCustomGameState('playing');
    $customGameModal.modal({
      backdrop: 'static',
      keyboard: false
    });
  }
});

socket.on('enemy finished', data => {
  game.enemy.finished = true;
  game.enemy.count = data.count;
  if (game.player.finished && game.enemy.finished) {
    if (
      game.challenge === 'Click Game' ||
      game.challenge === 'Direction Game'
    ) {
      if (game.challenge === 'Click Game') {
        showWinnerOfClickGame(game);
      } else if (game.challenge === 'Direction Game') {
        showWinnerOfDirectionGame(game);
      }
      setTimeout(() => {
        var request = {
          challenge: game.challenge,
          gift: game.gift,
          player: {
            username: game.player.username,
            name: game.player.name,
            count: game.player.count
          },
          enemy: {
            username: game.enemy.username,
            name: game.enemy.name,
            count: game.enemy.count
          }
        };
        socket.emit('battle is over', request);
      }, 3000);
    } else {
      showWinnerOfCustomGame(game);
      if (game.player.count !== game.enemy.count) {
        setTimeout(() => {
          var request = {
            challenge: game.challenge,
            gift: game.gift,
            player: {
              name: game.player.name,
              count: game.player.count
            },
            enemy: {
              name: game.enemy.name,
              count: game.enemy.count
            }
          };
          socket.emit('battle is over', request);
        }, 3000);
      }
    }
  }
});

socket.on('battle is over', data => {
  writeBattleResult(data);
});

socket.on('next turn', data => {
  if (socket.loggedIn) {
    if (data.message) {
      var html = `
        <h5 class="font-weight-bold text-center text-danger">Game is Over!</h5>
      `;
      $turnAnnouncementModalButton.off();
      $turnAnnouncementModalArea.html(html);
      $turnAnnouncementModal.modal('show');
      return;
    }

    var name = data.socketId === socket.id ? 'Your' : data.Name;

    var html;

    if (name === 'Your') {
      html = `
        <h5 class="font-weight-bold text-center text-warning">${name} turn!</h5>
      `;

      $turnAnnouncementModalButton.on('click', e => {
        $turnModal.modal({
          backdrop: 'static',
          keyboard: false
        });
      });
    } else {
      html = `
        <h5 class="font-weight-bold text-center text-primary">${name}'s turn!</h5>
      `;
      $turnAnnouncementModalButton.off();
    }

    $turnAnnouncementModalArea.html(html);
    $turnAnnouncementModal.modal('show');
  }
});

socket.on('handshake', data => {
  console.log(socket.id);
  if (socket.loggedIn) {
    var request = {
      username: socket.username,
      name: socket.name
    };

    socket.emit('handshake success', request);
  }
});

socket.on('game has been reset', data => {
  var html = `
    <h5 class="text-center">Game has been reset by Administrator</h5>
    <p class="text-center">Please wait..</p>
  `;

  resetGame();
  closeAllModals();
  
  $gameInfoModalArea.html(html);
  $gameInfoModal.modal('show');
  writeGameHasBeenReset();
});

// LISTENERS
$messageForm.on('submit', e => {
  e.preventDefault();

  if ($message.val() == '') return;

  var data = {
    username: socket.username,
    name: socket.name,
    message: $message.val()
  };

  socket.emit('send message', data);
  $message.val('');
  $message.trigger('input');
});

$loginForm.on('submit', e => {
  e.preventDefault();

  if ($username.val()) {
    var request = $.ajax({
      url: '/api/login',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      beforeSend: startSpinner,
      data: JSON.stringify({
        username: $username.val(),
        socketId: socket.id
      })
    });

    request.done(data => {
      endSpinner();
      if (!data.loggedIn) {
        if (data.message === 'Wrong username') {
          showWrongEidAlert();
        } else if (data.message === 'User already logged in') {
          showUserAlreadyLoggedInAlert();
        }
      } else {
        socket.username = data.username;
        socket.name = data.name;
        $username.val('');
        $loginArea.addClass('d-none');
        $mainArea.removeClass('d-none');
        $message.focus();
        console.log(socket.id);
        socket.loggedIn = true;
        socket.emit('login success', {
          socketId: socket.id,
          username: socket.username,
          name: socket.name
        });
        $('#ruleList').modal('show');
      }
    });

    request.fail((jqXHR, textStatus) => {
      endSpinner();
      alert('Request failed: ' + textStatus);
    });
  } else {
    showWrongUsernameAlert();
  }
});

$giftForm.on('submit', e => {
  e.preventDefault();

  if ($gift.val() == '') return;

  var data = {
    originalOwnerName: socket.name,
    gift: $gift.val()
  };

  socket.emit('i got a gift', data);
  endTurn('received a gift');
});

$message.on('input', e => {
  var message = $(e.target).val();
  if (message !== '') {
    socket.emit('i am typing');
  } else {
    socket.emit('i am not typing');
  }
});

$stealButton.on('click', e => {
  e.preventDefault();

  var request = $.ajax({
    url: '/api/gift',
    method: 'GET',
    dataType: 'json',
    beforeSend: startSpinner
  });

  request.done(data => {
    var html = '';

    if (data.length == 0) {
      html = `
            <h5 class="font-weight-bold text-center">No gift(s) available for steal</h5>
        `;
    } else {
      for (item of data) {
        html += `
                <li class="list-group-item">
                    <div class="row">
                        <div class="col-9 d-flex flex-row">
                            <img id="giftBox" src="/img/giftbox.svg"/>
                            <p>${item.gift}</p>
                        </div>
                        <div class="col-3">
                            <button class="btn btn-sm btn-danger w-100 steal" data-gift="${item.gift}" data-owner-id="${item.ownerId}" data-owner-name="${item.ownerName}" data-owner-username="${item.ownerUserName}">Steal</button>
                        </div>
                    </div>
                </li>
            `;
      }
    }

    $stealModalArea.html(html);
    endSpinner();
    $stealModal.modal('show');
  });

  request.fail((jqXHR, textStatus) => {
    endSpinner();
    alert('Request failed: ' + textStatus);
  });
});

$stealModalArea.on('click', 'button.steal', e => {
  if (tempChallenge !== null) {
    $challengeModal.modal('show');
    return;
  }

  $this = $(e.target);

  var request = $.ajax({
    url: '/api/challenge/random',
    method: 'GET',
    dataType: 'json',
    beforeSend: startSpinner
  });

  request.done(data => {
    tempChallenge = data.challenge;
    $challengePlaceholder.html(data.challenge);
    $challengeAcceptButton.data('challenge', data.challenge);
    $challengeAcceptButton.data('gift', $this.data('gift'));
    $challengeAcceptButton.data('owner-name', $this.data('owner-name'));
    $challengeAcceptButton.data('owner-id', $this.data('owner-id'));

    endSpinner();
    $challengeModal.modal('show');
  });

  request.fail((jqXHR, textStatus) => {
    endSpinner();
    alert('Request failed: ' + textStatus);
  });
});

$challengeAcceptButton.on('click', e => {
  e.preventDefault();

  var $this = $(e.target);

  var challenge = $this.data('challenge');
  var gift = $this.data('gift');
  var ownerUserName = $this.data('owner-username');
  var ownerName = $this.data('owner-name');
  var ownerId = $this.data('owner-id');

  game.challenge = challenge;
  game.gift = gift;
  game.giftOwnerId = ownerId;
  game.player.id = socket.id;
  game.player.name = socket.name;
  game.player.username = socket.username;
  game.enemy.id = ownerId;
  game.enemy.name = ownerName;
  game.enemy.username = ownerUserName;

  var data = {
    challenge: challenge,
    gift: gift,
    ownerName: ownerName,
    ownerId: ownerId,
    challengerId: socket.id,
    challengerUsername: socket.username,
    challengerName: socket.name
  };

  socket.emit('i challenge you', data);
  tempChallenge = null;
  $challengeModal.modal('hide');
  $stealModal.modal('hide');
  $turnModal.modal('hide');

  if (challenge === 'Click Game') {
    switchClickGameState('playing');
    $clickGameModal.modal({
      backdrop: 'static',
      keyboard: false
    });
  } else if (challenge === 'Direction Game') {
    switchDirectionGameState('playing');
    $directionGameModal.modal({
      backdrop: 'static',
      keyboard: false
    });
  } else {
    switchCustomGameState('playing');
    $customGameModal.modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  $message.focus();
});

$clickGameStartButton.on('click', e => {
  e.preventDefault();

  var count = $clickGameStartButton.data('count');
  if (count == 0) {
    var totalCount = game.totalCount;
    var countdown = setInterval(() => {
      $clickGameCountdown.html(totalCount);
      totalCount--;
      if (totalCount < 0) {
        clearInterval(countdown);
        $clickGameStartButton.addClass('disabled');
        $clickGameStartButton.attr('disabled', true);

        var finalCount = $clickGameStartButton.data('count');

        game.player.count = finalCount;
        game.player.finished = true;

        var data = {
          count: game.player.count,
          recipient: game.enemy.id
        };

        socket.emit('i am finish', data);

        switchClickGameState('waiting');
        if (game.player.finished && game.enemy.finished) {
          showWinnerOfClickGame(game);
        }
      }
    }, 1000);
    count++;
    $clickGameStartButton.data('count', count);
  } else {
    count++;
    $clickGameStartButton.data('count', count);
  }
});

$directionGameLeftButton.on('click', e => {
  e.preventDefault();

  var count = $directionGameCounter.data('count');
  if (count == 0) {
    startDirectionGame();
    count++;
    $directionGameCounter.data('count', count);
  } else {
    if (
      $directionGameIndicator.html().trim() ==
      $directionGameLeftButton.html().trim()
    ) {
      game.player.count++;
    }
  }
  randomizeLeftRight();
});

$directionGameRightButton.on('click', e => {
  e.preventDefault();
  var count = $directionGameCounter.data('count');
  if (count == 0) {
    startDirectionGame();
    count++;
    $directionGameCounter.data('count', count);
  } else {
    if (
      $directionGameIndicator.html().trim() ==
      $directionGameRightButton.html().trim()
    ) {
      game.player.count++;
    }
  }
  randomizeLeftRight();
});

$iWonButton.on('click', e => {
  e.preventDefault();

  game.player.count = 1;
  game.player.finished = true;

  var data = {
    count: game.player.count,
    recipient: game.enemy.id
  };

  socket.emit('i am finish', data);

  switchCustomGameState('waiting');
  if (game.player.finished && game.enemy.finished) {
    showWinnerOfCustomGame(game);
  }
});

$myOpponentWonButton.on('click', e => {
  e.preventDefault();

  game.player.count = 0;
  game.player.finished = true;

  var data = {
    count: game.player.count,
    recipient: game.enemy.id
  };

  socket.emit('i am finish', data);

  switchCustomGameState('waiting');
  if (game.player.finished && game.enemy.finished) {
    showWinnerOfCustomGame(game);
  }
});
