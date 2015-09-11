APPNAME = "CollaboWrite";
USER_NOT_FOUND = "That email doesn't belong to aregistered user.";
USER_ALREADY_REGISTERED = "That email already belongs to a registered user.";
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

Router.route('/profile', {
  template: 'profile',
  name: 'profile',
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
    return words.length > 0;
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
      return Submissions.find({}, {fields: {userId: 0}});
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
        var author = $('[name=author]').val();
        if (author.trim().length == 0) {
          author = "Anonymous";
        }
        
        Submissions.insert({'title':title, 'body': body, 'author': author, 'userId': Meteor.userId}, function(error) {
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
    },
    'click [name=pseudonym]': function (event) {
      Meteor.call("fakename", function(error, result) {
        $('[name=author]').val(result);
      });
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
    var tmpEmail = Session.get('tempLoginEmail');
    if (tmpEmail !== undefined) {
      $('[name=email]').val(tmpEmail);
      Session.set('tempLoginEmail', undefined);
    }
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
      rules: {
        moniker: {
          required: true,
          minlength: 3,
          maxlength: 40
        }
      },
      messages: {
        moniker: {
          required: "A valid moniker (fake name) is required to publish writing.",
          minlength: "Monikers must be at least {0} characters in length.",
          maxlength: "Monikers cannot be more than 40 characters in length."
        }
      },
      submitHandler: function(event) {
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        var moniker = $('[name=moniker]').val();
        var moniker_norm = Meteor.call
        Accounts.createUser({
          email: email,
          password: password,
          profile: {moniker: moniker}
        }, function(error) {
          if (error) {
            if (error.reason == "Email already exists.") {
              Session.set("tempLoginEmail", email);
              validator.showErrors({
                email: USER_ALREADY_REGISTERED + ' (' + document.querySelector('#login_link').outerHTML + ')'
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
    },
    'click .moniker': function(e) {
      $('[name=moniker]').val($(e.target).html());
      event.preventDefault();
    },
    'input [name=moniker]': function(e) {
      console.log($(e.target).val());
    }
  });
  
  Template.register.onCreated(function() {
    Meteor.call('fakenames', function(error, result) {
      Session.set('monikers', result);
    });
  });
  
  Template.register.helpers({
    'monikers': function() {
      return Session.get('monikers');
    }
  })
}

if (Meteor.isServer) {
  var sampling = Meteor.npmRequire('alias-sampling');
  var unidecode = Meteor.npmRequire('unidecode');
  
  var male_initial_generator;
  var female_initial_generator;
  
  Meteor.startup(function () {
    var mp = _.pairs(MALE_INITIALS);
    var fp = _.pairs(FEMALE_INITIALS);
    male_initial_generator = sampling(_.map(mp, function(k) { return k[1] / 100.0; }), _.map(mp, function(k) { return k[0].toUpperCase(); }));
    female_initial_generator = sampling(_.map(fp, function(k) { return k[1] / 100.0; }), _.map(fp, function(k) { return k[0].toUpperCase(); }));
  });

  function fakename() {
    var gender = faker.random.number(1);
    var choice = _.random(0,10);
    if (choice < 6) {
      return faker.name.firstName(gender) + ' ' + faker.name.lastName(gender);
    } else {
      var initial_generator = gender ? male_initial_generator : female_initial_generator;
      if (choice < 8) {
        return initial_generator.next() + '. ' + initial_generator.next() + '. ' + faker.name.lastName(gender);
      } else if (choice < 9) {
        return faker.name.firstName(gender) + ' ' + initial_generator.next() + '. ' + faker.name.lastName(gender);
      } else if (choice < 10) {
        return initial_generator.next() + '. ' + faker.name.firstName(gender) + ' ' + faker.name.lastName(gender);
      } else if (choice < 11) {
        return initial_generator.next() + '. ' + faker.name.lastName(gender);
      }
    }
  }
  
  function normalizeMoniker(moniker) {
    return unidecode(moniker).toUpperCase().replace(/[^ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]/g, '');
  }
  
  function monikerExists(moniker) {
    return Meteor.users.find({"profile.moniker_norm": {$in: [normalizeMoniker(moniker)]}}).count() > 0;
  }
  
  function removeExisting(normalizedMonikers) {
    return _.difference(normalizedMonikers, Meteor.users.find({"profile.moniker_norm": {$in: normalizedMonikers}},{fields: {"profile.moniker_norm":1}}).fetch().map(function(d) {return d.profile.moniker_norm;}));
  }

  Accounts.onCreateUser(function(options, user) {
    if (options.profile) {
      user.profile = options.profile;
      if (options.profile.moniker) {
        user.profile.moniker_norm = normalizeMoniker(options.profile.moniker);
      }
    }
    return user;
  });

  Meteor.methods({
    'fakename': function() {
      while (true) {
        var name = fakename();
        if (!monikerExists(name)) {
          return name;
        }
      }
    },
    'fakenames': function() {
      var result = [];
      var normTable = {};
      
      while (result.length < REGISTRATION_MONIKERS_N) {
        var names = _(REGISTRATION_MONIKERS_N - result.length).times(function() {return fakename();});
        console.log(names);
        var normedNames = _.map(names, normalizeMoniker);
        console.log(normedNames);
        var subTable = _.object(normedNames, names);
        console.log(subTable);
        normTable = _.extend(normTable, subTable);
        
        var monikers = removeExisting(normedNames);
        console.log(monikers);
        result = _.union(result, monikers);
        console.log(result);
      }
      
      return _.map(result, function(d) {return normTable[d];});
    },
    'normedname': function(name) {
      return normalizeMoniker(name);
    }
  })
}
