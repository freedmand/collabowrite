/**
 * Created by freedmand on 9/27/15.
 */

EditSchema = new SimpleSchema({
  body: {
    type: String,
    label: "Edit Text",
    max: 50000,
    min: 1
  },
  edited: {
    type: Date,
    denyUpdate: true
  }
});

SimpleVoteSchema = new SimpleSchema({
  upvotes: {
    type: Number,
    label: "Upvotes",
    min: 0,
    defaultValue: 0
  },
  downvotes: {
    type: Number,
    label: "Downvotes",
    min: 0,
    defaultValue: 0
  }
});

UniqueVoteSchema = new SimpleSchema({
  attachedId: {
    type: String
  },
  voteType: {
    type: String,
    allowedValues: ["submission", "comment"]
  }
});

AuthorSchema = new SimpleSchema({
  name: {
    type: String,
    min: 3,
    max: 100
  },
  id: {
    type: String
  },
  created: {
    type: Date,
    denyUpdate: true
  },
  moniker: {
    type: MonikerSchema,
    denyUpdate: true
  }
});

SubmissionSchema = new SimpleSchema({
  body: {
    type: String
  },
  text: {
    type: String
  },
  summary: {
    type: String,
    min: 3,
    max: 30
  },
  page: {
    type: Number,
    autoValue: function() {
      return Meteor.call('server/getpage').page;
    }
  },
  moniker: {
    type: String
  },
  monikerNorm: {
    type: String
  },
  wordcount: {
    type: Number,
    min: 0
  },
  upvotes: {
    type: Number,
    min: 0,
    defaultValue: 0
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
  }
});

CommentsSchema = new SimpleSchema({
  comment: {
    type: String,
    label: "Comment Text",
    max: 50000,
    min: 1,
    denyUpdate: true
  },
  author: {
    type: AuthorSchema,
    label: "Author",
    denyUpdate: true
  },
  id: {
    type: String
  },
  commentType: {
    type: String
  },
  attachedId: {
    type: String
  },
  posted: {
    type: Date,
    denyUpdate: true
  },
  votes: {
    type: SimpleVoteSchema
  },
  edits: {
    type: [EditSchema],
    label: "Edits",
    defaultValue: []
  }
});