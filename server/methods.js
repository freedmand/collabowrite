/*****************************************************************************/
/*  Server Methods */
/*****************************************************************************/

REGISTRATION_MONIKERS_N = 7;

function compileTemplate(baseFn, css) {
  var htmlFn = 'templates/' + baseFn + '/' + baseFn + '.html';
  var cssFn = typeof css !== 'undefined' ? 'templates/' + baseFn + '/' + baseFn + '.css' : null;

  var html = Assets.getText(htmlFn);
  if (cssFn != null) {
    html = juice('<style>' + Assets.getText(cssFn) + '</style>' + html);
  }

  return html;
}

function fakename() {
  var gender = faker.random.number(1);
  var choice = _.random(0,20);
  if (choice < 16) {
    return faker.name.firstName(gender) + ' ' + faker.name.lastName(gender);
  } else {
    var initial_generator = gender ? male_initial_generator : female_initial_generator;
    if (choice < 18) {
      return initial_generator.next() + '. ' + initial_generator.next() + '. ' + faker.name.lastName(gender);
    } else if (choice < 19) {
      return faker.name.firstName(gender) + ' ' + initial_generator.next() + '. ' + faker.name.lastName(gender);
    } else if (choice < 20) {
      return initial_generator.next() + '. ' + faker.name.firstName(gender) + ' ' + faker.name.lastName(gender);
    } else if (choice < 21) {
      return initial_generator.next() + '. ' + faker.name.lastName(gender);
    }
  }
}

function removeExisting(normalizedMonikers) {
  return _.difference(normalizedMonikers, Meteor.users.find({"profile.moniker.monikerNorm": {$in: normalizedMonikers}},{fields: {"profile.moniker.monikerNorm":1}}).fetch().map(function(d) {return d.profile.moniker.monikerNorm;}));
}

function normalizeMoniker(moniker) {
  var unidecode = Meteor.npmRequire('unidecode');
  var normalized = unidecode(moniker);
  return normalized.toLowerCase().replace(/[^abcdefghijklmnopqrstuvwxyz0123456789]/g, '');
}

SSR.compileTemplate('EmailVerification', compileTemplate('email_verification', true));
SSR.compileTemplate('PasswordReset', compileTemplate('password_reset', true));
SSR.compileTemplate('EmailList', compileTemplate('email_list', true));

var email_mocked = false;

Meteor.methods({
  'server/normalize_moniker': function (moniker) {
    return normalizeMoniker(moniker);
  },
  'server/insert_email': function(email) {
    try {
      Updatemail.insert({email: email.trim()});
      return true;
    } catch (e) {
      return e;
    }
  },
  'server/submit': function(html, summary) {
    var user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('not-logged-in');
    }

    if (!(_.has(user, 'profile') && _.has(user.profile, 'moniker') && _.has(user.profile.moniker, 'moniker') && _.has(user.profile.moniker, 'monikerNorm'))) {
      throw new Meteor.Error('no-moniker-created');
    }

    summary = summary.trim();
    if (summary.length < 5 || summary.length > 30) {
      throw new Meteor.Error('summary-length');
    }

    html = Meteor.call('shared/sanitize', html);
    var text = Meteor.call('server/htmlToText', html);
    var wordcount = Meteor.call('shared/wordcount', text);
    if (wordcount < 200 || wordcount > 500) {
      throw new Meteor.Error('wordcount');
    }

    // good to submit
    Submissions.insert({
      body: html,
      text: text,
      summary: summary,
      moniker: user.profile.moniker.moniker,
      monikerNorm: user.profile.moniker.monikerNorm,
      wordcount: wordcount,
      upvotes: 0
    });
  },
  'server/autosave': function(html) {
    var id = Meteor.userId();
    if (!id) {
      throw new Meteor.Error('not-logged-in');
    }

    var output = Meteor.call('shared/sanitize', html);

    Meteor.users.update(id, {$set:{"profile.autosave": output}});
  },
  'server/upvote_submission': function(submissionId) {
    var id = Meteor.userId();
    if (!id) {
      throw new Meteor.Error('not-logged-in');
    }

    var submission = Submissions.findOne(submissionId);
    var page = Meteor.call('server/getpage').page;
    if (submission.page != page) {
      throw new Meteor.Error('cannot-vote-on-old-submission');
    }

    Votes.insert({
      userId: id,
      itemId: submissionId,
      itemType: "submission",
      vote: 1
    });

    Submissions.update(submissionId, {$inc: {'upvotes': 1}});

    return true;
  },
  'server/remove_submission_upvote': function(submissionId) {
    var id = Meteor.userId();
    if (!id) {
      throw new Meteor.Error('not-logged-in');
    }

    var submission = Submissions.findOne(submissionId);
    var page = Meteor.call('server/getpage').page;
    if (submission.page != page) {
      throw new Meteor.Error('cannot-vote-on-old-submission');
    }

    var v = Votes.findOne({
      userId: id,
      itemId: submissionId,
      itemType: "submission",
      vote: 1
    });

    if (!v) {
      throw new Meteor.Error('cannot-double-unvote');
    }

    Votes.remove(v._id);

    Submissions.update(submissionId, {$inc: {'upvotes': -1}});

    return true;
  },
  'server/send_email': function(to, subject, html, text) {
    // not connected to a Mandrill account; just log to console
    if (typeof process.env.MANDRILL_EMAIL === 'undefined' && !email_mocked) {
      Mandrill.messages.send = function(json) {
        console.log(json);
      };
      email_mocked = true;
    }

    if (typeof text === 'undefined') {
      Mandrill.messages.send({
        "key": process.env.MANDRILL_KEY,
        "message": {
          "html": html,
          "subject": subject,
          "from_email": process.env.MANDRILL_EMAIL,
          "from_name": "Collabowrite",
          "to": [
            {
              "email": to,
              "type": "to"
            }
          ],
          "headers": {
            "Reply-To": process.env.MANDRILL_EMAIL
          }
        }
      });
    } else {
      Mandrill.messages.send({
        "key": process.env.MANDRILL_KEY,
        "message": {
          "html": html,
          "text": text,
          "subject": subject,
          "from_email": process.env.MANDRILL_EMAIL,
          "from_name": "Collabowrite",
          "to": [
            {
              "email": to,
              "type": "to"
            }
          ],
          "headers": {
            "Reply-To": process.env.MANDRILL_EMAIL
          }
        }
      });
    }
  },
  'server/send_verification_email': function(email, link, verification) {
    Meteor.call('server/send_email', encodeURIComponent(email), 'Verify your Collabowrite Account', SSR.render('EmailVerification', {link: link + '?' + 'email' +  encodeURIComponent(email) + '&v=' + verification}));
  },
  'server/send_password_reset_email': function(email, link, verification) {
    Meteor.call('server/send_email', encodeURIComponent(email), 'Collabowrite Password Reset', SSR.render('PasswordReset', {email: email, link: link, verification: verification}));
  },
  'server/send_subscribe_email': function(to) {
    Meteor.call('server/send_email', to, 'Thanks for subscribing', SSR.render('EmailList'));
  },
  'server/fakenames': function() {
    var result = [];
    var normTable = {};

    while (result.length < REGISTRATION_MONIKERS_N) {
      var names = _(REGISTRATION_MONIKERS_N - result.length).times(function() {return fakename();});
      var normedNames = _.map(names, normalizeMoniker);
      var subTable = _.object(normedNames, names);
      normTable = _.extend(normTable, subTable);

      var monikers = removeExisting(normedNames);
      result = _.union(result, monikers);
    }

    return _.map(result, function(d) {return normTable[d];});
  },
  'server/htmlToText': function(html) {
    return html2txt(html).replace(/[\n\s]+/g, ' ').trim();
  },
  // returns the current page and time remaining
  'server/getpage': function() {
    var day = new Date();

    for (var i = 0; i < calendar.length; i++) {
      if (day >= calendar[i].from && day < calendar[i].to) {
        return {
          page: calendar[i].day,
          remaining: calendar[i].to - day
        };
      }
    }

    return null;
  }
});
