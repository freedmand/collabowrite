APPNAME = "CollaboWrite";
USER_NOT_FOUND = "That email doesn't belong to aregistered user.";
USER_ALREADY_REGISTERED = "That email already belongs to a registered user.";
INCORRECT_PASSWORD = "You entered an incorrect password.";

Submissions = new Mongo.Collection("submissions");
Votes = new Mongo.Collection("votes");

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

Router.route('/authors/:_moniker', {
  template: 'author',
  name: 'author',
  data: function() {
    var moniker_norm = this.params._moniker;
    var user = Meteor.users.findOne({'profile.moniker_norm': moniker_norm});
    return {'user': user};
  }
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
  
  Template.author.onCreated(function() {
    var moniker_norm = this.data.user.profile.moniker_norm;
    var submissions = this.submissions = new ReactiveVar([]);
    Meteor.call('grabsubmissions', moniker_norm, function(error, result) {
      submissions.set(result);
    });
  });
  
  Template.author.helpers({
    'name': function() {
      console.log(this.user);
      return this.user.profile.moniker;
    },
    'submissions': function() {
      console.log(Template.instance());
      return Template.instance().submissions.get();
    }
  })
  
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
        var moniker_norm = null;
        if (author == "real") {
          author = Meteor.user().profile.moniker;
          moniker_norm = Meteor.user().profile.moniker_norm;
        } else {
          author = "Anonymous";
          moniker_norm = "ANONYMOUS";
        }
        
        var hidden = {};
        hidden['moniker_norm'] = Meteor.user().profile.moniker_norm;
        hidden['userId'] = Meteor.userId;
        
        Submissions.insert({'title':title, 'body': body, 'author': author, 'moniker_norm': moniker_norm, 'hidden': hidden, "upvotes": 0, "downvotes": 0}, function(error) {
          if (!error) {
            Router.go("listing");
          }
        });
      }
    });
  });
  
  Template.compose.helpers({
    'name': function() {
      return Meteor.user().profile.moniker;
    }
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
    var validator = this.validator = new ReactiveVar($('.register').validate({
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
              validator.get().showErrors({
                email: USER_ALREADY_REGISTERED + ' (' + document.querySelector('#login_link').outerHTML + ')'
              });
            } else {
              var errorDetail = {};
              errorDetail[error.details] = error.reason;
              validator.get().showErrors(errorDetail);
            }
          } else {
            Router.go("listing");
          }
        });
      }
    }));
  });

  Template.register.events({
    'submit form': function(){
      event.preventDefault();
    },
    'click .moniker': function(e) {
      $('[name=moniker]').val($(e.target).html());
      event.preventDefault();
    },
    'keyup [name=moniker]': function(e, template) {
      var val = $(e.target).val();
      if (val.length >= 3) {
        Meteor.call('monikeravailable', val, function(error, result) {
          if (!result) {
            template.validator.get().showErrors({
              'moniker': 'Sorry, the selected moniker is not available.'
            })
          }
        });
      }
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
  });
  
  function updateMeter(bookID) {
    var book = Submissions.find(bookID).fetch()[0];
    var total = book.upvotes + book.downvotes;
    Session.set('upvote_perc-' + bookID, book.upvotes / total * 100.0);
    Session.set('downvote_perc-' + bookID, book.downvotes / total * 100.0);
  }
  
  Template.vote_meter.onCreated(function() {
    var bookID = Template.currentData()._id;
    updateMeter(bookID);
  });
  
  Template.vote_meter.helpers({
    'upvote_perc': function() {
      var bookID = Template.currentData()._id;
      return Session.get('upvote_perc-' + bookID);
    },
    'downvote_perc': function() {
      var bookID = Template.currentData()._id;
      return Session.get('downvote_perc-' + bookID);
    }
  });
  
  Template.votes.onCreated(function() {
    var bookID = Template.currentData()._id;
    var userID = Meteor.userId();
    if (userID == null) {
      return;
    }
    var composite = 'vote-' + userID + '-' + bookID;
    Meteor.call('getvote', userID, bookID, function(error, result) {
      Session.set(composite, result);
    });
  });
  
  Template.votes.helpers({
    'voted': function(result) {
      var bookID = Template.currentData()._id;
      var userID = Meteor.userId();
      if (userID == null) {
        return result == 'login';
      }
      var composite = 'vote-' + userID + '-' + bookID;
      return Session.get(composite) == result;
    }
  });
  
  function vote(bookID, userID, direction) {
    if (userID == null) {
      return;
    }
    var composite = 'vote-' + userID + '-' + bookID;
    Meteor.call('votesubmission', userID, bookID, direction, function(error, result) {
      if (result) {
        Session.set(composite, direction);
        updateMeter(bookID);
      }
    });
  }
  
  Template.upvote_fresh.events({
    'click button': function() {
      var bookID = Template.currentData()._id;
      var userID = Meteor.userId();
      vote(bookID, userID, "upvote");
    }
  });
  
  Template.upvoted.events({
    'click button': function() {
      var bookID = Template.currentData()._id;
      var userID = Meteor.userId();
      vote(bookID, userID, "none");
    }
  });
  
  Template.downvote_fresh.events({
    'click button': function() {
      var bookID = Template.currentData()._id;
      var userID = Meteor.userId();
      vote(bookID, userID, "downvote");
    }
  });
  
  Template.downvoted.events({
    'click button': function() {
      var bookID = Template.currentData()._id;
      var userID = Meteor.userId();
      vote(bookID, userID, "none");
    }
  });
}

sampling = null;
unidecode = null;
if (Meteor.isServer) {
  Meteor.users._ensureIndex('profile.moniker_norm', {unique: 1, sparse: 1});
  sampling = Meteor.npmRequire('alias-sampling');
  unidecode = Meteor.npmRequire('unidecode');
  loadDefaults();
  
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
    var choice = _.random(0,20);
    if (choice < 16) {
      return faker.name.firstName(gender) + ' ' + faker.name.lastName(gender);
    } else {
      var initial_generator = gender ? male_initial_generator : female_initial_generator;
      if (choice < 18) {
        return initial_generator.next() + '. ' + initial_generator.next() + '. ' + faker.name.lastName(gender);
      } else if (choice < 19) {
        return faker.name.firstName(gender) + ' ' + initial_generator.next() + '. ' + faker.name.lastName(gender);
      } else if (choice < 20) {
        return initial_generator.next() + '. ' + faker.name.firstName(gender) + ' ' + faker.name.lastName(gender);
      } else if (choice < 21) {
        return initial_generator.next() + '. ' + faker.name.lastName(gender);
      }
    }
  }
  
  function normalizeMoniker(moniker) {
    return unidecode(moniker).toUpperCase().replace(/[^ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]/g, '');
  }
  
  function monikerValid(moniker) {
    return normalizeMoniker(moniker).length >= 3;
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
      if (!options.password) {
        throw new Meteor.Error(403, "Password is required!", "password");
      }
      if (options.password.length < 6) {
        throw new Meteor.Error(403, "Password must contain at least 6 characters.", "password");
      }
      if (options.profile.moniker) {
        user.profile.moniker_norm = normalizeMoniker(options.profile.moniker);
        if (user.profile.moniker_norm.length < 3) {
          throw new Meteor.Error(403, "Monikers must contain at least 3 letters and/or numbers.", "moniker");
        }
        if (monikerExists(user.profile.moniker_norm)) {
          throw new Meteor.Error(403, "The selected moniker already exists", "moniker");
        }
      } else {
        throw new Meteor.Error(403, "Monikers must contain at least 3 characters.", "moniker");
      }
    }
    return user;
  });
  
  function getVote(userID, bookID) {
    var votes = Votes.find({'user': userID, 'book': bookID}).fetch();
    if (votes.length == 0) {
      return "none"; 
    } else {
      return votes[0].up ? "upvote" : "downvote";
    }
  }
  
  function voteBook(bookID, upvotes, downvotes) {
    Submissions.update(bookID, {$inc: {upvotes: upvotes, downvotes: downvotes}});
  }
  
  function voteSubmission(userID, bookID, direction) {
    var votes = Votes.find({'user': userID, 'book': bookID}).fetch();
    var up = direction == "upvote" ? 1 : (direction == "downvote" ? -1 : 0);
    if (votes.length == 0) {
      if (up != 0) {
        Votes.insert({'user': userID, 'book': bookID, 'up': up == 1});
        voteBook(bookID, up == 1 ? 1 : 0, up == -1 ? 1 : 0);
      }
    } else {
      vote = votes[0];
      var voteID = vote._id;
      var voteUp = vote.up;
      if (voteUp != up) {
        Votes.update({'user': userID, 'book': bookID}, {$set: {'up': up}});
        var nu = 0, nd = 0;
        if (voteUp == 1 && up == 0) {
          nu = -1; nd = 0;
        } else if (voteUp == 1 && up == -1) {
          nu = -1; nd = 1;
        } else if (voteUp == 0 && up == 1) {
          nu = 1; nd = 0;
        } else if (voteUp == 0 && up == -1) {
          nu = 0; nd = 1;
        } else if (voteUp == -1 && up == 1) {
          nu = 1; nd = -1;
        } else if (voteUp == -1 && up == 0) {
          nu = 0; nd = -1;
        }
        voteBook(bookID, nu, nd);
      } else {
        return false;
      }
    }
    return true;
  }

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
        var normedNames = _.map(names, normalizeMoniker);
        var subTable = _.object(normedNames, names);
        normTable = _.extend(normTable, subTable);
        
        var monikers = removeExisting(normedNames);
        result = _.union(result, monikers);
      }
      
      return _.map(result, function(d) {return normTable[d];});
    },
    'normedname': function(name) {
      return normalizeMoniker(name);
    },
    'monikeravailable': function(moniker) {
      return Meteor.users.find({"profile.moniker_norm": {$eq: normalizeMoniker(moniker)}}).count() == 0;
    },
    'monikervalid': function(moniker) {
      return normalizeMoniker(moniker).length >= 3;
    },
    'votesubmission': function(userID, bookID, up) {
      return voteSubmission(userID, bookID, up);
    },
    'getvote': function(userID, bookID) {
      return getVote(userID, bookID);
    },
    'grabsubmissions': function(moniker_norm) {
      var submissions = Submissions.find({'moniker_norm': moniker_norm}).fetch();
      return submissions;
    }
  })
}
