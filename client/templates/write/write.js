
editor = null;

var editorTimer = null;
var AUTOSAVED = 'Autosaved.';
var UNTRACKED = 'Untracked changes.';
var SAVING = 'Saving changes…';
var ERROR = 'An unexpected error occurred.'

function autoSave() {
  Session.set('autosaveText', SAVING);
  var output = $(editor.elements).html();
  Meteor.call('shared/sanitize', output, function(error, result) {
    if (!error) {
      $(editor.elements).html(result);
      Meteor.call('server/autosave', output, function(error, result) {
        if (!error) {
          Session.set('autosaveText', AUTOSAVED);
        } else {
          Session.set('autosaveText', ERROR);
        }
      });
    } else {
      Session.set('autosaveText', ERROR);
    }
  });
}

updateWordcount = function() {
  Meteor.call('shared/wordcount', $('.paper').text(), function(error, result) {
    if (!error) {
      Session.set('wordcount', result);
    }
  });
};

function hideError() {
  var errorElem = $('.write-error');
  if (errorElem.is(':visible')) {
    errorElem.transition({
      animation: 'fade up out',
      onComplete: function() {
        errorElem.css('display', 'none');
      }});
  }
}

/*****************************************************************************/
/* Write: Event Handlers */
/*****************************************************************************/
Template.Write.events({
  'input [name=summary]': function() {
    hideError();
  }
});

/*****************************************************************************/
/* Write: Helpers */
/*****************************************************************************/
Template.Write.helpers({
  'autosaveText': function() {
    return Session.get('autosaveText');
  },
  'wordcount': function() {
    return Session.get('wordcount');
  }
});

/*****************************************************************************/
/* Write: Lifecycle Hooks */
/*****************************************************************************/
Template.Write.onCreated(function () {
  Session.set('autosaveText', AUTOSAVED);
});

Template.Write.onRendered(function () {
  $('#write-submit').on('click', function(error, result) {
    var body = $('.paper').html();
    var summary = $('[name=summary]').val();
    Meteor.call('server/submit', body, summary, function (error, result) {
      if (error) {
        var errorElem = $('.write-error');
        if (error.error == 'summary-length') {
          errorElem.html('The summary must be between 5 and 30 characters in length.')
        } else if (error.error == 'wordcount') {
          errorElem.html('The submission page must be between 200 and 500 words in length.')
        } else {
          errorElem.html('An unknown error occurred.');
        }
        if (!errorElem.is(':visible')) {
          errorElem.transition('fade up in');
        }
      } else {
        $('.paper').html('');
        autoSave();
        $('#write-modal').modal('hide');
        Router.go('submissions');
      }
    });
  });

  editor = new MediumEditor('.paper', {
    toolbar: {
      buttons: ['bold', 'italic', 'underline'],
      align: 'left'
    }
  });
  editor.subscribe('editableInput', function (event, editable) {
    hideError();
    updateWordcount();
    Session.set('autosaveText', UNTRACKED);
    if (editorTimer != null) {
      clearTimeout(editorTimer);
    }
    editorTimer = setTimeout(autoSave, 5000);
  });
});

Template.Write.onDestroyed(function () {
});
