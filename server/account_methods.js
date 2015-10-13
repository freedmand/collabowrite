
Accounts.validateLoginAttempt(function(data) {
  if (data.allowed) {
    var email = data.user.emails[0].address;

    var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    var user = users[0];

    var verification = Verified.findOne({userId: user._id});
    if ((verification.verifiedType == "account" && verification.verified) || (verification.verifiedType == "passwordReset")) {
      return true;
    }

    throw new Meteor.Error("verification", "The user account has not been verified yet");
  } else {
    return false;
  }
});

Meteor.methods({
  'accounts/create_user': function(email, password) {
    if (password.length < 6) {
      return false;
    }

    var user = Accounts.createUser({
      email: email,
      password: password
    });

    var verification = Meteor.call('accounts/generate_verification_code');
    Verified.insert({
      userId: user,
      verification: verification
    });

    Meteor.call('server/send_verification_email', email, Router.url('verify')  + '?email=' + encodeURIComponent(email) + '&v=' + verification);
    return true;
  },
  'accounts/generate_reset_password_link': function(email) {
    var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    if (users.length == 0) {
      throw new Meteor.Error("usernotfound", "No user account with that email exists");
    }
    var user = users[0];

    var verification = Verified.findOne({userId: user._id});
    if (verification == null) {
      throw new Meteor.Error("usernotfound", "User account found but verification record not found");
    }

    if (verification.verifiedType == "account" && !verification.verified) {
      throw new Meteor.Error("emailverify", "The account needs to be email verified before a password reset can be issued.");
    }

    var passwordVerification;
    if (verification.verifiedType == "account" && verification.verified) {
      passwordVerification = Meteor.call('accounts/generate_verification_code');
    } else if (verification.verifiedType == "passwordReset" && !verification.verified) {
      passwordVerification = verification.verification;
    } else {
      throw new Meteor.Error("unknown", "Unknown error");
    }

    Verified.update(verification._id, {$set: {verifiedType: "passwordReset", verified: false, verification: passwordVerification}});

    Meteor.call('server/send_password_reset_email', email, Router.url('passwordreset') + '?email=' + encodeURIComponent(email) + '&v=' + passwordVerification);
    return true;
  },
  'accounts/resend_verification': function(email) {
    var user = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    if (user.length == 0) {
      return false;
    }
    var verification = Verified.findOne({userId: user[0]._id}).verification;

    Meteor.call('server/send_verification_email', email, Router.url('verify')  + '?email=' + encodeURIComponent(email) + '&v=' + verification);
    return true;
  },
  'accounts/validate': function(email, verification) {
    var user = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    if (user.length == 0) {
      return {exists: false, verified: false};
    }

    var verificationLookup = Verified.findOne({userId: user[0]._id});
    if (verificationLookup == null) {
      throw new Meteor.Error('unknown', 'Verification record not set');
    } else {
      if (verificationLookup.verifiedType != "account") {
        throw new Meteor.Error('already-verified', 'Improper verification type');
      }
      if (verificationLookup.verified) {
        return {exists: true, verified: true};
      }
    }

    var verified = verificationLookup.verification == verification;
    if (verified) {
      Verified.update(verificationLookup._id, {$set: {verified: true}});
    }

    return {
      exists: true,
      verified: verified
    };
  },
  'accounts/validate_password_reset': function(email, verification) {
    var user = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    if (user.length == 0) {
      return {exists: false, verified: false};
    }

    var verificationLookup = Verified.findOne({userId: user[0]._id});
    if (verificationLookup == null) {
      throw new Meteor.Error(500, 'Password verification record not set');
    } else {
      if (verificationLookup.verifiedType != "passwordReset") {
        throw new Meteor.Error(500, 'Improper verification type');
      }
      if (verificationLookup.verified) {
        throw new Meteor.Error(500, 'Unknown error');
      }
    }

    var verified = verificationLookup.verification == verification;
    if (verified) {
      Verified.update(verificationLookup._id, {$set: {verified: true, verifiedType: "account"}});
    }

    return {
      exists: true,
      verified: verified
    };
  },
  'accounts/generate_verification_code': function() {
    return Random.hexString(20).toLowerCase();
  },
  'accounts/check_user': function(email) {
    var user = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    if (user.length == 0) {
      return {exists: false};
    } else {
      return {
        exists: true
      }
    }
  }
});