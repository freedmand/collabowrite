Meteor.startup(function () {
  Mandrill.config({username: process.env.MANDRILL_EMAIL, key: process.env.MANDRILL_KEY});
  Accounts.config({forbidClientAccountCreation: true});
  setUpDefaultAccounts();
});


function setUpDefaultAccounts() {
  if (_.has(process.env, 'NODE_ENV') && process.env.NODE_ENV.toLowerCase() != "production") {
    if (!_.isEqual(Meteor.call('accounts/check_user', 'test@example.com'), {'exists': true})) {
      Meteor.call('accounts/create_user', 'test@example.com', 'test1234');
    }
  }
}