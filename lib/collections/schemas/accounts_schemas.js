MonikerSchema = new SimpleSchema({
  moniker: {
    type: String,
    min: 3,
    max: 50,
    optional: true
  },
  monikerNorm: {
    type: String,
    min: 3,
    max: 50,
    unique: true,
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    }
  }
});

IPSchema = new SimpleSchema({
  userId: {
    type: String
  },
  visits: {
    type: Number,
    min: 0,
    defaultValue: 0
  }
});

IPTableSchema = new SimpleSchema({
  ip: {
    type: String,
    index: true,
    unique: true
  },
  users: {
    type: [IPSchema],
    optional: true
  }
});

VerifiedSchema = new SimpleSchema({
  userId: {
    type: String,
    index: true,
    unique: true
  },
  verifiedType: {
    type: String,
    allowedValues: ["account", "passwordReset"],
    defaultValue: "account"
  },
  verified: {
    type: Boolean,
    defaultValue: false
  },
  verification: {
    type: String,
    optional: true
  }
});

ProfileSchema = new SimpleSchema({
  moniker: {
    type: MonikerSchema,
    optional: true
  }
});

UserSchema = new SimpleSchema({
  username: {
    type: String,
    optional: true
  },
  emails: {
    type: Array,
    optional: true
  },
  "emails.$": {
    type: Object
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
  profile: {
    type: ProfileSchema,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  roles: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

Meteor.users.attachSchema(UserSchema);