
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
    var v = null;
    if (_.has(query, 'amp;v')) {
      v = query['amp;v'];
    } else {
      v = query.v;
    }
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
    var query = this.params.query;
    var pg = false;

    var subscriptions = [
      Meteor.subscribe('votes'),
      Util.waitOnServer("server/getpage")
    ];

    if (_.has(query, 'pg')) {
      pg = parseInt(query.pg);
      if (pg < 1 || pg > 30) {
        pg = null;
      }
    }

    if (!pg) {
      subscriptions.push(Meteor.subscribe('submissionsCurrentNew'));
      subscriptions.push(Meteor.subscribe('submissionsCurrentTop'));
      subscriptions.push(Meteor.subscribe('submissionsYesterdayWinnerLatest'));
    } else {
      subscriptions.push(Meteor.subscribe('submissionsNew', pg));
      subscriptions.push(Meteor.subscribe('submissionsTop', pg));
      if (pg > 1) {
        subscriptions.push(Meteor.subscribe('submissionsYesterdayWinner', pg));
      }
    }

    return subscriptions;
  },
  action: function() {
    function getDateRange(pg) {
      if (pg == 1) {
        return "October 25th – November 1st";
      } else if (pg > 1 && pg <= 30) {
        return moment({month:10, day: pg}).format('MMMM Do');
      } else {
        return "Improper page";
      }
    }
    var query = this.params.query;
    var pg = false;

    if (_.has(query, 'pg')) {
      pg = parseInt(query.pg);
      if (pg < 1 || pg > 30) {
        pg = null;
      }
    }

    var currentPage = Util.getResponse("server/getpage");
    Session.set('latestPage', currentPage);

    if (!pg) {
      var dateRange = getDateRange(currentPage.page);
      Session.set('pageinfoPage', currentPage.page);
      Session.set('pageinfoDate', dateRange);
    } else {
      var dateRange = getDateRange(pg);
      Session.set('pageinfoPage', pg);
      Session.set('pageinfoDate', dateRange);
    }

    this.render();
  }
});

Router.route('/write', {
  name: 'write',
  controller: 'HomeController',
  where: 'client',
  template: 'Write'
});
