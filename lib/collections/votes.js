Votes = new Mongo.Collection('votes');

Votes.attachSchema(new SimpleSchema({
    userId: {
        type: String
    },
    itemId: {
        type: String
    },
    itemType: {
        type: String,
        allowedValues: ["book", "submission", "comment"]
    },
    vote: {
        type: Number,
        allowedValues: [-1, 0, 1]
    }
}));

if (Meteor.isServer) {
  Votes.allow({
    insert: function (userId, doc) {
      return false;
    },

    update: function (userId, doc, fieldNames, modifier) {
      return false;
    },

    remove: function (userId, doc) {
      return false;
    }
  });

  Votes.deny({
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
