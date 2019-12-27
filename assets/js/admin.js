var $loading = $('#loading');
var $notificationArea = $('#notificationArea');
var $gameStatus = $('#gameStatus');
var $startGameButton = $('#startGameButton');
var $resetGameButton = $('#resetGameButton');

var $usersSection = $('#usersSection');
var $userListArea = $('#userListArea');
var $addNewUserForm = $('#addNewUserForm');
var $username = $('#username');
var $name = $('#name');

var $challengesSection = $('#challengesSection');
var $challengeListArea = $('#challengeListArea');
var $addNewChallengeForm = $('#addNewChallengeForm');
var $challenge = $('#challenge');

var $giftsSection = $('#giftsSection');
var $giftListModalArea = $('#giftListModalArea');

// HELPERS
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
};

var stopLoader = function($el) {
  $el.find('.loader').removeClass('is-loading');
};

// FUNCTIONS
var notify = (type, message) => {
  var html = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <strong>${message}</strong>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;

  $notificationArea.html(html);
}

var refreshGiftList = () => {
  var request = $.ajax({
    url: '/api/gift/all',
    method: 'GET',
    dataType: 'json',
    beforeSend: startLoader($giftsSection)
  });

  request.done(data => {
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

  request.fail((jqXHR, textStatus) => {
    stopLoader($giftsSection);
    notify('danger', textStatus);
  });
};

var refreshUserList = () => {
  var request = $.ajax({
    url: '/api/user',
    method: 'GET',
    dataType: 'json',
    beforeSend: startLoader($usersSection)
  });

  request.done(data => {
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
      html += `<tr><td>${i + 1}</td><td>${user.Username}</td><td>${
        user.Name
      }</td><td>${status}</td></tr>`;
    }
    $userListArea.html(html);
    stopLoader($usersSection);
  });

  request.fail((jqXHR, textStatus) => {
    stopLoader($usersSection);
    notify('danger', textStatus);
  });
};

var refreshChallengeList = () => {
  var request = $.ajax({
    url: '/api/challenge',
    method: 'GET',
    dataType: 'json',
    beforeSend: startLoader($challengesSection)
  });

  request.done(data => {
    var html = '';
    var challenges = data.challenge;

    for (const [i, challenge] of challenges.entries()) {
      html += `
        <li class="list-group-item d-flex justify-content-between">
          <div>${challenge}</div>
          <button type="button" class="close mask rgba-red-strong remove-challenge" onclick="deleteChallenge(event)" aria-label="Close" data-challenge="${challenge}">
            <span aria-hidden="true">&times;</span>
          </button>
        </li>
      `;
    }

    $challengeListArea.html(html);
    stopLoader($challengesSection);
  });

  request.fail((jqXHR, textStatus) => {
    stopLoader($challengesSection);
    notify('danger', textStatus);
  });
};

var createChallenge = () => {
  var challenge = $challenge.val();
  
  if(challenge === "") {
    notify('warning', 'Challenge cannot be empty');
    return;
  }

  if(!/^[A-Za-z ]+$/.test(challenge)) {
    notify('warning', 'Challenge must use only alphabets and spaces')
    return;
  }

  var request = $.ajax({
    url: '/api/challenge',
    method: 'POST',
    dataType: 'json',
    beforeSend: startSpinner,
    contentType: 'application/json',
    data: JSON.stringify({
      challenge: challenge
    })
  });

  request.done(data => {
    $challenge.val('');

    endSpinner();
    notify('success', data.result);
    refreshChallengeList();
  });

  request.fail((jqXHR, textStatus) => {
    endSpinner();
    notify('danger', textStatus);
  });
};

var deleteChallenge = (e) => {
  e.preventDefault();

  var challenge = $(e.target).parent().data('challenge');

  var request = $.ajax({
    url: '/api/challenge',
    method: 'DELETE',
    dataType: 'json',
    beforeSend: startLoader($challengesSection),
    contentType: 'application/json',
    data: JSON.stringify({
      challenge: challenge
    }) 
  });

  request.done(data => {
    stopLoader($challengesSection);
    notify('success', data.result);
    refreshChallengeList();
  });

  request.fail((jqXHR, textStatus) => {
    stopLoader($challengesSection);
    notify('danger', textStatus);
  });
};

var createUser = () => {
  var username = $username.val();
  var name = $name.val();

  if( username === "" || name === "" ) {
    notify('warning', 'Username and Name cannot be empty');
    return;
  }

  if(!/^[a-z_.]+$/.test(username)) {
    notify('warning', 'Username must use only small alphabets, underscore(_) and period(.)')
    return;
  }

  var request = $.ajax({
    url: '/api/user',
    method: 'POST',
    dataType: 'json',
    beforeSend: startSpinner,
    contentType: 'application/json',
    data: JSON.stringify({
      username: username,
      name: name
    })
  });

  request.done(data => {
    $username.val('');
    $name.val('');

    endSpinner();
    notify('success', data.result);
    refreshUserList();
  });

  request.fail((jqXHR, textStatus) => {
    endSpinner();
    notify('danger', textStatus);
  });
}

var startGame = () => {
  var request = $.ajax({
    url: '/api/game/start',
    data: 'json',
    method: 'GET',
    beforeSend: startSpinner
  });

  request.done(data => {
    endSpinner();
    if (data.started) {
      notify('success', data.message);

      $gameStatus.removeClass('text-danger');
      $gameStatus.addClass('text-success');
      $gameStatus.html('Started');
    } else {
      notify('danger', data.message);

      $gameStatus.addClass('text-danger');
      $gameStatus.removeClass('text-success');
      $gameStatus.html('Stopped');
    }
  });

  request.fail((jqXHR, textStatus) => {
    endSpinner();
    notify('danger', textStatus);
  });
}

var resetGame = () => {
  var request = $.ajax({
    url: '/api/game/stop',
    method: 'POST',
    dataType: 'json',
    beforeSend: startSpinner
  });

  request.done(data => {
    endSpinner();
    notify('danger', data.message);

    $gameStatus.addClass('text-danger');
    $gameStatus.removeClass('text-success');
    $gameStatus.html('Stopped');
  });

  request.fail((jqXHR, textStatus) => {
    endSpinner();
    notify('danger', textStatus);
  });
}

$(document).ready(function() {
  // LISTENERS
  $startGameButton.on('click', e => {
    e.preventDefault();
    startGame();  
  });

  $resetGameButton.on('click', e => {
    e.preventDefault();
    resetGame();
  });

  $addNewChallengeForm.on('submit', e => {
    e.preventDefault();
    createChallenge();
  });

  $addNewUserForm.on('submit', e => {
    e.preventDefault();
    createUser();
  });

  // INIT
  refreshUserList();
  refreshGiftList();
  refreshChallengeList();

  // AUTO REFRESH
  setInterval(refreshGiftList, 7000);
  setInterval(refreshUserList, 15000);
});
