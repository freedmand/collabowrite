/*****************************************************************************/
/* Verify: Event Handlers */
/*****************************************************************************/
Template.Verify.events({
});

/*****************************************************************************/
/* Verify: Helpers */
/*****************************************************************************/
Template.Verify.helpers({
});

/*****************************************************************************/
/* Verify: Lifecycle Hooks */
/*****************************************************************************/
Template.Verify.onCreated(function () {
});

Template.Verify.onRendered(function () {
  var email = this.data.email;
  var verification = this.data.verification;

  var loginRequest = {
    emailVerifyMethod: true,
    email: email,
    verification: verification
  };
  Accounts.callLoginMethod({
    methodArguments: [loginRequest],
    userCallback: function (err) {
      if (!err) {
        Router.go('/verified');
      } else {
        Router.go('/error/v00');
      }
    }});
});

Template.Verify.onDestroyed(function () {
});
