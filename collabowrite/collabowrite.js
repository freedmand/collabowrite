APPNAME = "CollaboWrite";
USER_NOT_FOUND = "That email doesn't belong to a registered user.";
INCORRECT_PASSWORD = "You entered an incorrect password.";

Router.configure({
    layoutTemplate: 'main'
});

Router.route('/', {
    template: 'home',
    name: 'home'
});

Router.route('/register', {
  template: 'register',
  name: 'register'
});

Router.route('/login', {
  template: 'login',
  name: 'login'
});

Router.route('/restricted', {
  template: 'restricted',
  name: 'restricted',
  onBeforeAction: function(){
    var currentUser = Meteor.userId();
    if(currentUser){
      this.next();
    } else {
      this.render("login");
    }
  }
});

if (Meteor.isClient) {
  document.title = APPNAME;
  $.validator.setDefaults({
    rules: {
      email: {
        required: true,
        email: true
      },
      password: {
        required: true,
        minlength: 6
      }
    },
    messages: {
      email: {
        required: "You must enter an email address.",
        email: "You've entered an invalid email address."
      },
      password: {
        required: "You must enter a password.",
        minlength: "Your password must be at least {0} characters."
      }
    }
  });
  
  Template.appname.helpers({
    'name': APPNAME
  });
  
  Template.footer.helpers({
    'year': function() {
      return '' + (new Date().getYear() + 1900);
    }
  });

  Template.navigation.events({
    'click .logout': function(event){
      event.preventDefault();
      Meteor.logout();
      Router.go('login');
    }
  });

  Template.login.onRendered(function(){
    var validator = $('.login').validate({
      submitHandler: function(event) {
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
          if(error){
            if(error.reason == "User not found"){
              validator.showErrors({
                email: USER_NOT_FOUND   
              });
            }
            if(error.reason == "Incorrect password"){
              validator.showErrors({
                password: INCORRECT_PASSWORD    
              });
            }
          } else {
            var currentRoute = Router.current().route.getName();
            if(currentRoute == "login"){
              Router.go("home");
            }
          }
        });
      }
    });
  });

  Template.login.events({
    'submit form': function(event){
      event.preventDefault();
    }
  });

  Template.register.onRendered(function(){
    var validator = $('.register').validate({
      submitHandler: function(event) {
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({
          email: email,
          password: password
        }, function(error) {
          if (error) {
            if (error.reason == "Email already exists.") {
              validator.showErrors({
                email: "That email already belongs to a registered user."   
              });
            }
          } else {
            Router.go("home");
          }
        });
      }
    });
  });

  Template.register.events({
    'submit form': function(){
      event.preventDefault();
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
