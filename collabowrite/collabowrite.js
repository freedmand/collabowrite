APPNAME = "CollaboWrite";
USER_NOT_FOUND = "That email doesn't belong to a registered user.";
INCORRECT_PASSWORD = "You entered an incorrect password.";


Submissions = new Mongo.Collection("submissions");

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

Router.route('/submissions', {
  template: 'listing',
  name: 'listing',
});

Router.route('/submissions/:_id', {
    template: 'book_view',
    data: function(){
        var bookID = this.params._id;
        return Submissions.findOne({ _id: bookID });
    }
});

Router.route('/compose', {
  template: 'compose',
  name: 'compose',
  onBeforeAction: function(){
    var currentUser = Meteor.userId();
    if(currentUser) {
      this.next();
    } else {
      this.render("login");
    }
  }
});

function getWordCount(wordString) {
  var words = wordString.split(" ");
  words = words.filter(function(words) { 
    return words.length > 0
  }).length;
  return words;
}

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
  
  //add the custom validation method
  $.validator.addMethod("wordCount",
    function(value, element, params) {
      var count = getWordCount(value);
      if (count >= params[0] && count <= params[1]) {
        return true;
      }
    },
    $.validator.format("You must enter between {0} and {1} words.")
  );
  
  Template.listing.helpers({
    'submissions': function() {
      return Submissions.find({});
    }
  });
  
  Template.book_excerpt.helpers({
    'excerpt': function(e) {
      return this.body.substr(0, 50) + '...';
    }
  });
  
  Template.compose.onRendered(function() {
    var validator = $('.compose').validate({
      rules: {
        title: {
          required: true,
          minlength: 1,
          maxlength: 50
        },
        body: {
          required: true,
          wordCount: [50, 300]
        }
      },
      messages: {
        title: {
          required: "A title is required.",
          minlength: "The title must contain at least {0} characters.",
          maxlength: "The title cannot contain more than {0} characters."
        },
        body: {
          required: "Body text is required."
        }
      },
      submitHandler: function(event) {
        var title = $('[name=title]').val();
        var body = $('[name=body]').val();
        
        Submissions.insert({'title':title, 'body': body}, function(error) {
          if (!error) {
            Router.go("listing");
          }
        });
      }
    });
  });
  
  Template.compose.events({
    'submit form': function (event) {
      event.preventDefault();
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
      Router.go('home');
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
              Session.set('tempRegEmail', email);
              validator.showErrors({
                email: USER_NOT_FOUND + ' (' + document.querySelector('#register_link').outerHTML + ')'
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
              Router.go("listing");
            }
          }
        });
      }
    });
  });

  Template.login.events({
    'submit form': function(event) {
      event.preventDefault();
    }
  });

  Template.register.onRendered(function() {
    var tmpEmail = Session.get('tempRegEmail');
    if (tmpEmail !== undefined) {
      $('[name=email]').val(tmpEmail);
      Session.set('tempRegEmail', undefined);
    }
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
            Router.go("listing");
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
