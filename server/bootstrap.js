sampling = Meteor.npmRequire('alias-sampling');

Meteor.startup(function () {
  Mandrill.config({username: process.env.MANDRILL_EMAIL, key: process.env.MANDRILL_KEY});
  Accounts.config({forbidClientAccountCreation: true});
  setUpDefaultAccounts();

  var mp = _.pairs(MALE_INITIALS);
  var fp = _.pairs(FEMALE_INITIALS);

  male_initial_generator = sampling(_.map(mp, function(k) { return k[1] / 100.0; }), _.map(mp, function(k) { return k[0].toUpperCase(); }));
  female_initial_generator = sampling(_.map(fp, function(k) { return k[1] / 100.0; }), _.map(fp, function(k) { return k[0].toUpperCase(); }))
});


function setUpDefaultAccounts() {
  if (_.has(process.env, 'NODE_ENV') && process.env.NODE_ENV.toLowerCase() != "production") {
    if (!_.isEqual(Meteor.call('accounts/check_user', 'test@example.com'), {'exists': true})) {
      Meteor.call('accounts/create_user', 'test@example.com', 'test1234');
    }
  }
}