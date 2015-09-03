APPNAME = "CollaboWrite";

Router.configure({
    layoutTemplate: 'main'
});

Router.route('/', {
    template: 'home',
    name: 'home'
});

Router.route('/register');
Router.route('/login');

if (Meteor.isClient) {
  document.title = APPNAME;
  
  Template.appname.helpers({
    'name': APPNAME
  });
  
  Template.footer.helpers({
    'year': function() {
      return '' + (new Date().getYear() + 1900);
    }
  });
  
  Template.register.events({
    'submit form': function(){
      event.preventDefault();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Accounts.createUser({
        email: email,
        password: password
      });
      Router.go('login');
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
