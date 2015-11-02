
//Meteor.publish("userData", function () {
//  if (this.userid) {
//    return Meteor.users.find({_id: this.userId},
//        {fields: {'emails': 1, 'profile.moniker': 1, 'profile.moniker_norm': 1, 'customVerified': 1}});
//  } else {
//    this.ready();
//  }
//});

//Meteor.publish('validation', function(email, v) {
//  var result;
//  try {
//    result = Meteor.call('accounts/validate', email, v);
//    return result;
//  } catch (error) {
//    return {error: error};
//  }
//
//  return this.ready();
//});

Meteor.publish('submissionsNew', function(pg) {
  return Submissions.find({page: pg}, {sort: {createdAt: -1}});
});

Meteor.publish('submissionsTop', function(pg) {
  return Submissions.find({page: pg}, {sort: {upvotes: -1}});
});

Meteor.publish('submissionsCurrentNew', function() {
  var pg = Meteor.call('server/getpage').page;
  return Submissions.find({page: pg}, {sort: {createdAt: -1}});
});

Meteor.publish('submissionsCurrentTop', function() {
  var pg = Meteor.call('server/getpage').page;
  return Submissions.find({page: pg}, {sort: {upvotes: -1}});
});

Meteor.publish('submissionsYesterdayWinner', function(pg) {
  return Submissions.find({page: pg - 1}, {sort: {upvotes: -1}, limit: 1});
});

Meteor.publish('votes', function() {
  return Votes.find({
    userId: this.userId,
    itemType: 'submission',
    vote: 1
  });
});