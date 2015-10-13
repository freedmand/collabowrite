/**
 * Created by freedmand on 10/1/15.
 */
if (Meteor.isServer) {
  Meteor.users.allow({
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

  Meteor.users.deny({
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
} else if (Meteor.isClient) {
  Meteor.subscribe("userData");
}