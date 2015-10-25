
Router.configure({
  loadingTemplate: 'Loading',
  notFoundTemplate: 'NotFound',
  layoutTemplate: 'MasterLayout'
});

Router.route('/', {
  name: 'home',
  controller: 'HomeController',
  where: 'client',
  template: 'Home'
});

Router.route('/verified', {
  name: 'Verified',
  template: 'Verified',
  controller: 'HomeController',
  where: 'client'
});

Router.route('/error/:_code', {
  name: 'error',
  template: 'SimpleMessage',
  data: function() {
    var code = this.params._code;

    if (code == 'v00') {
      return {
        header: 'Error!',
        message: 'A verification error has occurred. Check your verification link!'
      }
    } else if (code == 'v01') {
      return {
        header: 'Error!',
        message: 'A verification error has occurred. Check your verification link!'
      }
    } else if (code == 'v10') {
      return {
        header: 'Error!',
        message: 'The verification link you entered is incorrect!'
      }
    } else {
      return {
        header: 'Error!',
        message: 'An unknown error has occurred. We are hard at work fixing it!'
      }
    }
  },
  controller: 'HomeController',
  where: 'client'
});

Router.route('/verify', {
  name: 'verify',
  template: 'Verify',
  controller: 'HomeController',
  where: 'client',
  data: function() {
    var query = this.params.query;
    var email = query.email;
    var v = query.v;
    return {email: email, verification: v};
  }
  //waitOn: function () {
  //  var query = this.params.query;
  //  var email = query.email;
  //  var v = query.v;
  //  return Util.waitOnServer('accounts/validate', email, v);
  //},
  //action: function () {
  //  var result = Util.getResponse("accounts/validate");
  //
  //  console.log(result);
  //
  //  if (result.exists && result.verified) {
  //    this.redirect('/verified?' + result.token);
  //  } else {
  //    this.redirect('/error/v' + (result.exists ? '1' : '0') + (result.verified ? '1' : '0'));
  //  }
  //},
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

Router.route('/submissions', {
  name: 'submissions',
  controller: 'HomeController',
  where: 'client',
  template: 'Submissions',
  waitOn: function() {
    return [
      Meteor.subscribe('submissionsNew'),
      Meteor.subscribe('submissionsTop'),
      Meteor.subscribe('votes')
    ]
  },
  action: function() {
    this.render();
  },
  data: {
    page: 1,
    fromDate: "October 25th",
    toDate: "November 1st"//,
    //submissions: [
    //  {
    //    upvotes: 21,
    //    summary: "Tale of Two Cities",
    //    author: "Charles Dickens",
    //    snippet: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we ha",
    //    words: 289,
    //    comments: 2,
    //    postedDate: "3 hours ago",
    //    postedDateExact: "November 1st, 7:39pm PST"
    //  },
    //  {
    //    upvotes: 566,
    //    summary: "Grapes of Wrath",
    //    author: "John Steinbeck",
    //    snippet: "To the red country and part of the gray country of Oklahoma, the last rains came gently, and they did not cut the scarred earth. The plows crossed and recrossed the rivulet marks. The last rains lifted the corn quickly and scattered weed colonies and grass along the sides of the roads so that the gray country and the da",
    //    words: 346,
    //    comments: 24,
    //    postedDate: "2 hours ago",
    //    postedDateExact: "November 1st, 7:24pm PST"
    //  },
    //  {
    //    upvotes: 2341,
    //    summary: "Flowers for Algernon",
    //    author: "Daniel Keyes",
    //    snippet: "Dr Strauss says I shoud rite down what I think and remembir and evrey thing that happins to me from now on. I dont no why but he says its importint so they will see if they can use me. I hope they use me becaus Miss Kinnian says mabye they can make me smart. I want to be smart. My name is Charlie Gordon I werk in Dormer",
    //    words: 466,
    //    comments: 1,
    //    postedDate: "2 hours ago",
    //    postedDateExact: "November 1st, 7:21 PST"
    //  },
    //  {
    //    upvotes: 144,
    //    summary: "The Kite Runner",
    //    author: "Khaled Housseini",
    //    snippet: "I became what I am today at the age of twelve, on a frigid overcast day in the winter of 1975. I remember the precise moment, crouching behind a crumbling mud wall, peeking into the alley near the frozen creek. That was a long time ago, but it’s wrong what they say about the past, I’ve learned, about how you can bury it",
    //    words: 372,
    //    comments: 10,
    //    postedDate: "3 hours ago",
    //    postedDateExact: "November 1st, 7:56 PST"
    //  }
    //]
  }
});

Router.route('/write', {
  name: 'write',
  controller: 'HomeController',
  where: 'client',
  template: 'Write'
});
