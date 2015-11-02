
Accounts.registerLoginHandler(function(loginRequest) {
  if (!loginRequest.emailVerifyMethod) {
    return undefined;
  }

  var email = loginRequest.email;
  var verification = loginRequest.verification;

  var userId = validateAccount(email, verification);
  if (!userId) {
    return null;
  }

  var stampedToken = Accounts._generateStampedLoginToken();
  var hashStampedToken = Accounts._hashStampedToken(stampedToken);

  Meteor.users.update(userId, {$push: {'services.resume.loginTokens': hashStampedToken}});

  return {
    userId: userId,
    token: stampedToken.token
  };
});

sanitizeValidation = function(code) {
  if (!code && code != "") {
    throw new Meteor.Error("improper validation format");
  }
  var result = "";
  var validCharacters = "0123456789abcdef";
  for (var i = 0; i < code.length; i++) {
    var c = code.charCodeAt(i);
    if (c >= 97 && c <= 102) {
      result += code[i];
    } else if (c >= 65 && c <= 70) {
      result += String.fromCharCode(c + 32);
    } else if (c >= 48 && c <= 57) {
      result += code[i];
    }
  }

  return result;
};

validateAccount = function(email, verification) {
  verification = sanitizeValidation(verification);
  var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
  if (users.length == 0) {
    // return {exists: false, verified: false};
    return false;
  }
  var user = users[0];

  var verificationLookup = Verified.findOne({userId: user._id});
  if (verificationLookup == null) {
    return false;
    // throw new Meteor.Error('unknown', 'Verification record not set');
  }

  var verified = verificationLookup.verification == verification;
  if (verified) {
    Verified.update(verificationLookup._id, {$set: {verified: true}});
    return user._id;
  } else {
    return false;
  }
};

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

    Meteor.call('server/send_verification_email', email, Router.url('verify'), verification);
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

    Meteor.call('server/send_password_reset_email', email, Router.url('reset'), passwordVerification);
    return true;
  },
  'accounts/resend_verification': function(email) {
    var user = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    if (user.length == 0) {
      return false;
    }
    var verification = Verified.findOne({userId: user[0]._id}).verification;

    Meteor.call('server/send_verification_email', email, Router.url('verify'), verification);
    return true;
  },
  //'accounts/validate': function(email, verification) {
  //  var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
  //  if (users.length == 0) {
  //    return {exists: false, verified: false};
  //  }
  //  var user = users[0];
  //
  //  var verificationLookup = Verified.findOne({userId: user._id});
  //  if (verificationLookup == null) {
  //    throw new Meteor.Error('unknown', 'Verification record not set');
  //  } else {
  //    if (verificationLookup.verifiedType != "account") {
  //      throw new Meteor.Error('already-verified', 'Improper verification type');
  //    }
  //    if (verificationLookup.verified) {
  //      return {exists: true, verified: true};
  //    }
  //  }
  //
  //  var verified = verificationLookup.verification == verification;
  //  if (verified) {
  //    Verified.update(verificationLookup._id, {$set: {verified: true}});
  //  }
  //
  //  // log the user in with some trickery
  //  if (!plain_email_mocked) {
  //    Email.send = function() {};
  //    plain_email_mocked = true;
  //  }
  //
  //  Accounts.sendVerificationEmail(user._id);
  //
  //  var tokens = Meteor.users.findOne(user._id).services.email.verificationTokens;
  //  var token = tokens[tokens.length - 1].token;
  //
  //  return {
  //    exists: true,
  //    verified: verified,
  //    token: token
  //  };
  //},
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
    var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    if (users.length == 0) {
      return {exists: false};
    } else {
      return {
        exists: true
      }
    }
  },
  'accounts/check_moniker': function(moniker) {
    var normed = Meteor.call('server/normalize_moniker', moniker);
    if (normed.length < 3 || normed.length > 30) {
      return {valid: false};
    }

    var users = Meteor.users.find({'profile.moniker.monikerNorm': normed}).fetch();
    if (users.length == 0) {
      return {
        valid: true,
        exists: false
      };
    } else {
      return {
        valid: true,
        exists: true
      };
    }
  },
  'accounts/register_moniker': function(moniker) {
    var id = Meteor.userId();
    if (!id) {
      throw new Meteor.Error("not-logged-in");
    }

    var users = Meteor.users.find(id).fetch();
    if (users.length == 0) {
      throw new Meteor.Error("usernotfound");
    }

    var user = users[0];
    if (_.has(user, 'profile') && _.has(user.profile, 'moniker') && _.has(user.profile.moniker, 'monikerNorm')) {
      throw new Meteor.Error('user-has-moniker', 'You have already set your moniker.')
    }

    var verificationLookup = Verified.findOne({userId: user._id});
    if (verificationLookup == null) {
      throw new Meteor.Error('unknown', 'Verification record not set');
    } else {
      if (verificationLookup.verifiedType == "account" && !verificationLookup.verified) {
        throw new Meteor.Error('not-verified', 'Verify your email address');
      }
    }

    var normed = Meteor.call('server/normalize_moniker', moniker);
    var normedUsers = Meteor.users.find({'profile.moniker.monikerNorm': normed}).fetch();
    if (normedUsers.length != 0) {
      throw new Meteor.Error('dup-moniker', 'That moniker is already in use');
    }

    Meteor.users.update(user._id, {$set:{"profile.moniker.moniker": moniker, "profile.moniker.monikerNorm": normed}});

    return true;
  }
});