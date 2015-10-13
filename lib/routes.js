
Router.route('/', {
  name: 'home',
  controller: 'HomeController',
  where: 'client',
  template: 'Home'
});

Router.route('/verify', {
  name: 'verify',
  controller: 'HomeController',
  where: 'client',
  onBeforeAction: function() {
    var query = this.params.query;
    var email = query.email;
    var v = query.v;

    Meteor.call('accounts/validate', email, v, function(error, result) {
      if (error) {
        if (error.error === 'already-verified') {

        } else {

        }
      }
    });
  }
});

Router.route('/passwordreset', {
  name: 'passwordreset',
  controller: 'HomeController',
  where: 'client',
  template: 'Login',
  onBeforeAction: function() {
    var query = this.params.query; // email=... v=...

  }
});

