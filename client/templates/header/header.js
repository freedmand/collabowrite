/*****************************************************************************/
/* Header: Event Handlers */
/*****************************************************************************/
Template.Header.events({
  'click .sign-up': function() {
    $('#create-modal').modal('show');
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
