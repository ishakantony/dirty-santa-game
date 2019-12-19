var $challengeAddButton;
var $challengeDeleteButton;
var $newChallengeInput = $('#newChallenge');
var $challengeListModal = $('#challengeList');
var $challengeListArea = $('#challengeListArea');

var req = $.ajax({
  url: '/api/challenge',
  method: 'GET',
  dataType: 'json'
});

req.done(data => {
  var i = 1;
  data.challenge.forEach(element => {
    $challengeListArea.append(
      `<li class="list-group-item d-flex justify-content-between"><div>${element}</div><button type="button" id=${i} class="close mask rgba-red-strong" aria-label="Close">
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
      alert(data.result);
      $challengeListArea.append(
        `<li class="list-group-item d-flex justify-content-between"><div>${$newChallengeInput.val()}</div><button type="button" class="close rgba-red-strong" aria-label="Close">
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

$challengeListModal.on('click', 'button.close', function() {
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
    alert(data.result);
    $challengeDeleteButton.parent().remove();
  });

  request.fail((jqXHR, textStatus) => {
    alert('Request failed: ' + textStatus);
  });
});
