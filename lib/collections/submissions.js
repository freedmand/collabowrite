Submissions = new Mongo.Collection('submissions');

Submissions.attachSchema(SubmissionSchema);

if (Meteor.isServer) {
  Submissions.allow({
    insert: function (userId, doc) {
      return true;
    },

    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },

    remove: function (userId, doc) {
      return true;
    }
  });
}
