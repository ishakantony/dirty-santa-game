var $userListArea = $('#userListArea');
var $userListModal = $('#userList');
var $newUserEidInput = $('#newUserEid');
var $newUserNameInput = $('#newUserName');
var $userDeleteButton;
var $challengeAddButton;
var $challengeDeleteButton;
var $newChallengeInput = $('#newChallenge');
var $challengeListModal = $('#challengeList');
var $challengeListArea = $('#challengeListArea');
var $startGameButton = $('a.start');
var $resetGameButton = $('a.reset');
var $gameStartModal = $('#gameStartModal');
var $gameStartModalArea = $('#gameStartModalArea');
var $refreshBtn = $('button.refresh');
var $seeGiftButton = $('#seeGiftButton');
var $giftListModal = $('#giftListModal');
var $giftListModalArea = $('#giftListModalArea');
var $loading = $('#loading');
// SOCKETS
var socket = io.connect();

var startSpinner = function() {
  $loading.removeClass('d-none');
  $loading.addClass('d-flex');
};

var endSpinner = function() {
  $loading.removeClass('d-flex');
  $loading.addClass('d-none');
};

var refreshGiftList = () => {
  var resetReq = $.ajax({
    url: '/api/gift/all',
    method: 'GET',
    dataType: 'json'
  });

  resetReq.done(data => {
    var html = '';
    for (const [i, item] of data.entries()) {
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${item.gift}</td>
          <td>${item.originalOwnerName}</td>
          <td>${item.ownerName}</td>
          <td>${item.stealCount}</td>
        </tr>
      `;
    }

    $giftListModalArea.html(html);
  });
};

var getUserList = function() {
  var userListRequest = $.ajax({
    url: '/api/user',
    method: 'GET',
    dataType: 'json'
  });

  userListRequest.done(data => {
    var html = '';
    var users = data.users.sort((a, b) => {
      if (a.loggedIn && !b.loggedIn) {
        return -1;
      } else if (!a.loggedIn && b.loggedIn) {
        return 1;
      }
      return 0;
    });
    for (const [i, user] of users.entries()) {
      var status;
      if (user.loggedIn) {
        status = '<h5 class="text-success font-weight-bold">online</h5>';
      } else {
        status = '<span class="text-danger">offline</span>';
      }
      html += `<tr><td>${i + 1}</td><td>${user.EID}</td><td>${
        user.Name
      }</td><td>${status}</td></tr>`;
    }
    $userListArea.html(html);
  });
};
$userListModal.on('click', 'button.user', e => {
  if ($newUserEidInput.val() && $newUserNameInput.val()) {
    var request = $.ajax({
      url: '/api/user',
      method: 'POST',
      dataType: 'json',
      data: {
        EID: $newUserEidInput.val(),
        Name: $newUserNameInput.val()
      }
    });

    request.done(data => {
      var userListRequest = $.ajax({
        url: '/api/user',
        method: 'GET',
        dataType: 'json'
      });
      userListRequest.done(res => {
        var html = '';
        var users = res.users;
        for (const [i, user] of users.entries()) {
          var status;
          if (user.loggedIn) {
            status = '<span class="text-success">online</span>';
          } else {
            status = '<span class="text-danger">offline</span>';
          }
          html += `<tr><td>${i + 1}</td><td>${user.EID}</td><td>${
            user.Name
          }</td><td>${status}</td></tr>`;
        }
        $userListArea.html(html);
      });

      $newUserEidInput.val('');
      $newUserNameInput.val('');
    });

    request.fail((jqXHR, textStatus) => {
      alert('Request failed: ' + textStatus);
    });
  } else {
    alert('Please enter a new user eid and name.');
  }
});

$userListModal.on('click', 'button.remove-user', function() {
  $userDeleteButton = $(this);
  var nameToDelete = $userDeleteButton
    .parent()
    .children('div')
    .text();
  console.log(nameToDelete);
  socket.emit('kicked out', nameToDelete);
  $userDeleteButton.parent().remove();
});

var req = $.ajax({
  url: '/api/challenge',
  method: 'GET',
  dataType: 'json'
});

req.done(data => {
  var i = 1;
  data.challenge.forEach(element => {
    $challengeListArea.append(
      `<li class="list-group-item d-flex justify-content-between"><div>${element}</div><button type="button" id=${i} class="close mask rgba-red-strong remove" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button></li>`
    );
    i += 1;
  });
  $newChallengeInput.val('');
});

$challengeListModal.on('click', 'button.add', e => {
  $challengeAddButton = $(e.target);

  if ($newChallengeInput.val() && $newChallengeInput.val() != '') {
    var request = $.ajax({
      url: '/api/challenge',
      method: 'POST',
      dataType: 'json',
      data: { challenge: $newChallengeInput.val() }
    });

    request.done(data => {
      //   alert(data.result);
      $challengeListArea.append(
        `<li class="list-group-item d-flex justify-content-between"><div>${$newChallengeInput.val()}</div><button type="button" class="close remove rgba-red-strong" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button></li>`
      );
      $newChallengeInput.val('');
    });

    request.fail((jqXHR, textStatus) => {
      alert('Request failed: ' + textStatus);
    });
  } else {
    alert('Please enter a new challenge.');
  }
});

$challengeListModal.on('click', 'button.remove', function() {
  $challengeDeleteButton = $(this);
  var challengeToDelete = $challengeDeleteButton
    .parent()
    .children('div')
    .text();
  var request = $.ajax({
    url: '/api/challenge',
    method: 'DELETE',
    dataType: 'json',
    data: { challenge: challengeToDelete }
  });

  request.done(data => {
    //alert(data.result);
    $challengeDeleteButton.parent().remove();
  });

  request.fail((jqXHR, textStatus) => {
    alert('Request failed: ' + textStatus);
  });
});

$startGameButton.on('click', e => {
  e.preventDefault();

  var request = $.ajax({
    url: '/api/game/start',
    data: 'json',
    method: 'GET',
    beforeSend: startSpinner
  });

  request.done(data => {
    endSpinner();
    var html;
    if (data.started) {
      html = `<h1 class="text-center text-success my-5">${data.message}</h1>`;
    } else {
      html = `<h1 class="text-center text-danger my-5">${data.message}</h1>`;
    }

    $gameStartModalArea.html(html);
    $gameStartModal.modal('show');
  });

  request.fail((jqXHR, textStatus) => {
    endSpinner();
    alert('Request failed: ' + textStatus);
  });
});

$resetGameButton.on('click', e => {
  var resetReq = $.ajax({
    url: '/api/game/stop',
    method: 'POST',
    dataType: 'json'
  });

  resetReq.done(data => {
    var html = `<h1 class="text-center text-danger my-5">${data.message}</h1>`;
    $gameStartModalArea.html(html);
    $gameStartModal.modal('show');
  });
});

$refreshBtn.on('click', e => {
  getUserList();
});

$seeGiftButton.on('click', e => {
  e.preventDefault();

  refreshGiftList();
});

$(document).ready(function() {
  getUserList();

  setInterval(refreshGiftList, 2000);

  setInterval(getUserList, 2000);
});
