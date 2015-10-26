
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

Meteor.publish('submissionsNew', function() {
  return Submissions.find({}, {sort: {createdAt: -1}});
});

Meteor.publish('submissionsTop', function() {
  return Submissions.find({}, {sort: {upvotes: -1}});
});

Meteor.publish('votes', function() {
  //var userId = this.userId;
  //if (!userId) {
  //  //throw new Meteor.Error('must-be-logged-in');
  //  return null;
  //}

  return Votes.find({
    userId: this.userId,
    itemType: 'submission',
    vote: 1
  });
});