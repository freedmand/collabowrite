/*****************************************************************************/
/* Header: Event Handlers */
/*****************************************************************************/

function showSignup() {
  $('#create-modal').modal('show');
}

function showWrite() {
  var user = Meteor.user();
  var paper = $('.paper');
  if (user) {
    if (_.has(user, 'profile') && _.has(user.profile, 'autosave') && user.profile.autosave.length > 0) {
      paper.html(user.profile.autosave);
    }
  }

  updateWordcount();
  Session.set('autosaveText', 'Autosaved.');
  $('#write-modal').modal('show');
  paper.focus();
}

Template.Header.events({
  'click .sign-up': function() {
    showSignup();
  },
  'click #write-header-item': function() {
    $('#write-header-item').blur();
    var user = Meteor.user();
    if (!user) {
      showSignup();
    } else {
      if (!(_.has(user, 'profile') && _.has(user.profile, 'moniker') && _.has(user.profile.moniker, 'moniker'))) {
        $('#moniker-modal').modal('show');
      } else {
        showWrite();
      }
    }
  }
});

/*****************************************************************************/
/* Header: Helpers */
/*****************************************************************************/
Template.ProfileMenu.helpers({
  'username': function() {
    var user = Meteor.user();
    if (user) {
      if (_.has(user, 'profile') && _.has(user.profile, 'moniker') && _.has(user.profile.moniker, 'moniker')) {
        return user.profile.moniker.moniker;
      } else {
        return user.emails[0].address;
      }
    }
  }
});

/*****************************************************************************/
/* Header: Lifecycle Hooks */
/*****************************************************************************/
Template.Header.onCreated(function () {
});

Template.ProfileMenu.events({
  'click #sign-out': function() {
    Meteor.logout();
  }
});

Template.ProfileMenu.onRendered(function () {
  $('#username-dropdown').dropdown({
    on: 'hover',
    action: 'hide'
  });
});

Template.Header.onDestroyed(function () {
});
