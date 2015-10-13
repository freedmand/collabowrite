Meteor.startup(function () {
  Mandrill.config({username: process.env.MANDRILL_EMAIL, key: process.env.MANDRILL_KEY});
  Accounts.config({forbidClientAccountCreation: true});
});
