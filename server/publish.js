
//Meteor.publish("userData", function () {
//  if (this.userId) {
//    return Meteor.users.find({_id: this.userId},
//        {fields: {'emails': 1, 'profile.moniker': 1, 'profile.moniker_norm': 1, 'customVerified': 1}});
//  } else {
//    this.ready();
//  }
//});
