/*****************************************************************************/
/*  Server Methods */
/*****************************************************************************/

function compileTemplate(baseFn, css) {
  var htmlFn = 'templates/' + baseFn + '/' + baseFn + '.html';
  var cssFn = typeof css !== 'undefined' ? 'templates/' + baseFn + '/' + baseFn + '.css' : null;

  var html = Assets.getText(htmlFn);
  if (cssFn != null) {
    html = juice('<style>' + Assets.getText(cssFn) + '</style>' + html);
  }

  return html;
}

SSR.compileTemplate('EmailVerification', compileTemplate('email_verification', true));
SSR.compileTemplate('PasswordReset', compileTemplate('password_reset', true));
SSR.compileTemplate('EmailList', compileTemplate('email_list', true));

var email_mocked = false;

Meteor.methods({
  'server/normalize_moniker': function (moniker) {
    var unidecode = Meteor.npmRequire('unidecode');
    var normalized = unidecode(moniker);
    return normalized.toLowerCase().replace(/[^abcdefghijklmnopqrstuvwxyz0123456789]/g, '');
  },
  'server/insert_email': function(email) {
    try {
      Updatemail.insert({email: email.trim()});
      return true;
    } catch (e) {
      return e;
    }
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
  'server/send_verification_email': function(to, verification) {
    Meteor.call('server/send_email', to, 'Verify your Collabowrite Account', SSR.render('EmailVerification', {verification: verification}));
  },
  'server/send_password_reset_email': function(to, verification) {
    Meteor.call('server/send_email', to, 'Collabowrite Password Reset', SSR.render('PasswordReset', {resetLink: verification}));
  },
  'server/send_subscribe_email': function(to) {
    Meteor.call('server/send_email', to, 'Thanks for subscribing', SSR.render('EmailList'));
  }
});
