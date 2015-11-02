/*****************************************************************************/
/* Submissions: Event Handlers */
/*****************************************************************************/
Template.Submissions.events({
  'click .newsort': function() {
    Session.set('newSort', true);
  },
  'click .topsort': function() {
    Session.set('newSort', false);
  }
});

/*****************************************************************************/
/* Submissions: Helpers */
/*****************************************************************************/
Template.Submissions.helpers({
  'submissions': function () {
    var currentPage = Session.get('pageinfoPage');
    if (Session.get('newSort')) {
      return Submissions.find({page: currentPage}, {sort: {createdAt: -1}});
    } else {
      return Submissions.find({page: currentPage}, {sort: {upvotes: -1}});
    }
  },
  'featuredSubmission': function() {
    var currentPage = Session.get('pageinfoPage');
    var latestPage = Session.get('latestPage').page;
    if (currentPage == latestPage && currentPage > 1) {
      Session.set('featuredText', 'Yesterday’s Winning Submission');
      return Submissions.findOne({page: currentPage - 1}, {sort: {upvotes: -1}, limit: 1});
    }
    if (currentPage != latestPage) {
      Session.set('featuredText', 'Winning Submission');
      return Submissions.findOne({page: currentPage}, {sort: {upvotes: -1}, limit: 1});
    }
  },
  'newSort': function () {
    return Session.get('newSort');
  },
  'page': function () {
    return Session.get('pageinfoPage');
  },
  'dateRange': function () {
    return Session.get('pageinfoDate');
  },
  'dropdownItems': function() {
    var latestPage = Session.get('latestPage').page;
    var currentPage = Session.get('pageinfoPage');

    var result = [];
    for (var i = 1; i <= latestPage; i++) {
      result.push({
        dropdownPage: i,
        dropdownAttr: {
          'href': Router.path('submissions') + '?pg=' + i,
          'class': (latestPage == currentPage ? 'active ' : '') + 'item'
        }
      });
    }
    return result;
  }
});

Template.Submission.helpers({
  'snippet': function() {
    return Template.instance().data.text.substr(0, 325);
  },
  'voted': function() {
    return Votes.findOne({'itemId':Template.instance().data._id}) != null;
  },
  'pluralVote': function() {
    if (Template.instance().data.upvotes != 1) {
      return 's';
    }
    return '';
  },
  'simpleDate': function() {
    var date = Template.instance().data.createdAt;
    return moment.duration(moment() - moment(date, 'ddd MMM DD YYYY HH:mm:SS Z')).humanize() + ' ago';
  },
  'exactDate': function() {
    var date = Template.instance().data.createdAt;
    return moment(date, 'ddd MMM DD YYYY HH:mm:SS Z').format('dddd MMMM DD, YYYY, h:mmA (UTCZ)');
  }
});

Template.FeaturedSubmission.helpers({
  'featuredText': function() {
    return Session.get('featuredText');
  },
  'snippet': function() {
    return Template.instance().data.text.substr(0, 325);
  },
  'voted': function() {
    return Votes.findOne({'itemId':Template.instance().data._id}) != null;
  },
  'pluralVote': function() {
    if (Template.instance().data.upvotes != 1) {
      return 's';
    }
    return '';
  },
  'simpleDate': function() {
    var date = Template.instance().data.createdAt;
    return moment.duration(moment() - moment(date, 'ddd MMM DD YYYY HH:mm:SS Z')).humanize() + ' ago';
  },
  'exactDate': function() {
    var date = Template.instance().data.createdAt;
    return moment(date, 'ddd MMM DD YYYY HH:mm:SS Z').format('dddd MMMM DD, YYYY, h:mmA (UTCZ)');
  }
});

Template.FeaturedSubmission.events({
  'click .card-clickable': function() {
    var data = Template.instance().data;
    var id = data._id;
    var modal = $('#submission-featured-' + id);
    modal.find('.description').html(data.body);
    modal.modal('show');
    modal.find('.vote-clickable').on('click', function() {
      if (!Meteor.userId()) {
        $('#create-modal').modal('show');
      } else {
        vote(id);
      }
    });
  },
  'click .vote-clickable': function() {
    var id = Template.instance().data._id;
    if (!Meteor.userId()) {
      $('#create-modal').modal('show');
    } else {
      vote(id);
    }
  }
});

function vote(id) {
  if (Votes.findOne({'itemId':id})) {
    Meteor.call('server/remove_submission_upvote', id);
  } else {
    Meteor.call('server/upvote_submission', id);
  }
}

Template.Submission.events({
  'click .card-clickable ': function() {
    var data = Template.instance().data;
    var id = data._id;
    var modal = $('#submission-' + id);
    modal.find('.description').html(data.body);
    modal.modal('show');
    modal.find('.vote-clickable').on('click', function() {
      if (!Meteor.userId()) {
        $('#create-modal').modal('show');
      } else {
        vote(id);
      }
    });
  },
  'click .vote-clickable': function() {
    var id = Template.instance().data._id;
    if (!Meteor.userId()) {
      $('#create-modal').modal('show');
    } else {
      vote(id);
    }
  }
});

/*****************************************************************************/
/* Submissions: Lifecycle Hooks */
/*****************************************************************************/
Template.Submissions.onCreated(function () {
  Session.set('newSort', true);
});

Template.Submissions.onRendered(function () {
  $('.date').popup({
    delay: {
      show: 800,
      hide: 300
    }
  });
  $('#page-dropdown').dropdown();
});

Template.Submissions.onDestroyed(function () {
});
