var $userListArea = $('#userListArea');
var $newUserEidInput = $('#newUserEid');
var $newUserNameInput = $('#newUserName');
var $challengeAddButton;
var $challengeDeleteButton;
var $newChallengeInput = $('#newChallenge');
var $challengeListModal = $('#challengeList');
var $challengeListArea = $('#challengeListArea');
var $startGameButton = $('#startGameButton');
var $resetGameButton = $('#resetGameButton');
var $giftListModalArea = $('#giftListModalArea');
var $notificationArea = $('#notificationArea');
var $gameStatus = $('#gameStatus');
var $loading = $('#loading');
var $usersSection = $('#usersSection');
var $challengesSection = $('#challengesSection');
var $giftsSection = $('#giftsSection');
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

var startLoader = function($el) {
  $el.find('.loader').addClass('is-loading');
}

var stopLoader = function($el) {
  $el.find('.loader').removeClass('is-loading');
}

var refreshGiftList = () => {
  var resetReq = $.ajax({
    url: '/api/gift/all',
    method: 'GET',
    dataType: 'json',
    beforeSend: startLoader($giftsSection)
  });

  resetReq.done(data => {
    var html = '';

    if(data.length === 0) {
      html = `
        <tr>
          <td colspan="5"><p class="text-center font-weight-bold">No Gift(s)</p></td>
        </tr>
      `;
    } else {
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
    }

    $giftListModalArea.html(html);
    stopLoader($giftsSection);
  });
};

var refreshUserList = () => {
  var userListRequest = $.ajax({
    url: '/api/user',
    method: 'GET',
    dataType: 'json',
    beforeSend: startLoader($usersSection)
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
    stopLoader($usersSection);
  });
};

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
    if (data.started) {
      var html = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          <strong>${data.message}</strong>
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      `;
      $notificationArea.html(html);

      $gameStatus.removeClass('text-danger');
      $gameStatus.addClass('text-success');
      $gameStatus.html('Started');
    } else {
      var html = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>${data.message}</strong>
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      `;
      $notificationArea.html(html);

      $gameStatus.addClass('text-danger');
      $gameStatus.removeClass('text-success');
      $gameStatus.html('Stopped');
    }
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
    var html = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>${data.message}</strong>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    `;
    $notificationArea.html(html);

    $gameStatus.addClass('text-danger');
    $gameStatus.removeClass('text-success');
    $gameStatus.html('Stopped');
  });
});

$(document).ready(function() {
  refreshUserList();
  refreshGiftList();

  setInterval(refreshGiftList, 7000);

  setInterval(refreshUserList, 15000);
});
