Updatemail = new Mongo.Collection('updatemail');

Updatemail.attachSchema(new SimpleSchema({
  email:{
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "email",
    index: true,
    unique: true
  }
}));

if (Meteor.isServer) {
  Updatemail.allow({
    insert: function (userId, doc) {
      return true;
    },

    update: function (userId, doc, fieldNames, modifier) {
      return false;
    },

    remove: function (userId, doc) {
      return false;
    }
  });

  Updatemail.deny({
    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },

    remove: function (userId, doc) {
      return true;
    }
  });
}
