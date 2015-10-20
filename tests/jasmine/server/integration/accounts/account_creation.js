/**
 * Created by freedmand on 10/2/15.
 */

var email = "test@example.com";
var localEmail = "test2@example.com";
var password = "password123";

describe("Basic Account Creation", function() {
  var createUser = null;
  var verificationLookup = null;
  var verificationCode = null;

  beforeEach(function() {
    resetDatabase();
    loadDefaultFixtures();

    spyOn(Meteor, 'call').and.callThrough();
    spyOn(Mandrill.messages, 'send');

    createUser = Meteor.call('accounts/create_user', email, password);

    var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    expect(users.length).toEqual(1);
    var user = users[0];
    verificationLookup = Verified.findOne({userId: user._id});
    expect(verificationLookup).not.toBeNull();
    verificationCode = verificationLookup.verification;
  });

  it("Creates an account correctly", function() {
    expect(createUser).toBeTruthy();
  });

  it("Denies short password account", function() {
    expect(Meteor.call('accounts/create_user', localEmail, "")).toBeFalsy();
    expect(Meteor.call('accounts/create_user', localEmail, "12345")).toBeFalsy();
    expect(Meteor.call('accounts/create_user', localEmail, "123456")).toBeTruthy();
  });

  it("Denies invalid email address account", function() {
    expect(function() {Meteor.call('accounts/create_user', "", password)}).toThrow();
    expect(function() {Meteor.call('accounts/create_user', "test", password)}).toThrow();
    expect(function() {Meteor.call('accounts/create_user', "test@", password)}).toThrow();
    expect(Meteor.call('accounts/create_user', "test@test.com", password)).toBeTruthy();
  });

  it("Creates a validation code", function() {
    expect(Meteor.call).toHaveBeenCalledWith('accounts/generate_verification_code');
  });

  it("Sends a validation email", function() {
    expect(Meteor.call).toHaveBeenCalledWith('server/send_verification_email', email, jasmine.any(String), jasmine.any(String));
  });

  it("Sends the right verification code", function() {
    expect(Mandrill.messages.send).toHaveBeenCalled();

    // grab contents of sent email
    var emailHtml = Mandrill.messages.send.calls.mostRecent().args[0].message.html;

    expect(emailHtml).toContain(verificationCode);
  });

  it("Resends the same verification code", function() {
    // Denies fake email resend
    var result = Meteor.call('accounts/resend_verification', localEmail);
    expect(result).toBeFalsy();

    result = Meteor.call('accounts/resend_verification', email);
    expect(result).toBeTruthy();

    expect(Mandrill.messages.send).toHaveBeenCalled();
    var emailHtml = Mandrill.messages.send.calls.mostRecent().args[0].message.html;
    expect(emailHtml).toContain(verificationCode);
  });

  it("Validates the verification correctly", function() {
    expect(verificationLookup.verified).toBeFalsy();

    var result = Meteor.call('accounts/validate', email, verificationCode);
    expect(result).toEqual({exists: true, verified: true});

    var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    expect(users.length).toEqual(1);
    var user = users[0];

    var newVerificationLookup = Verified.findOne({userId: user._id});
    expect(newVerificationLookup).not.toBeNull();
    expect(newVerificationLookup.verifiedType).toEqual("account");
    expect(newVerificationLookup.verified).toBeTruthy();
  });

  it("Denies incorrect validation", function() {
    expect(verificationLookup.verified).toBeFalsy();

    verificationCode += '9'; // make code incorrect
    var result = Meteor.call('accounts/validate', email, verificationCode);
    expect(result).toEqual({exists: true, verified: false});

    var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    expect(users.length).toEqual(1);
    var user = users[0];

    var newVerificationLookup = Verified.findOne({userId: user._id});
    expect(newVerificationLookup).not.toBeNull();
    expect(newVerificationLookup.verifiedType).toEqual("account");
    expect(newVerificationLookup.verified).toBeFalsy();
  });

  describe("Handles verified password reset behavior", function() {
    beforeEach(function() {
      expect(verificationLookup.verified).toBeFalsy();

      var result = Meteor.call('accounts/validate', email, verificationCode);
      expect(result).toEqual({exists: true, verified: true});

      var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
      expect(users.length).toEqual(1);
      var user = users[0];

      var newVerificationLookup = Verified.findOne({userId: user._id});
      expect(newVerificationLookup).not.toBeNull();
      expect(newVerificationLookup.verified).toBeTruthy();
    });

    it("Sends reset password link", function() {
      // fails to validate before reset link issued
      var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
      expect(users.length).toEqual(1);
      var user = users[0];

      expect(function() {Meteor.call('accounts/validate_password_reset', email, incorrectVerification)}).toThrow();

      var newVerificationLookup = Verified.findOne({userId: user._id});
      expect(newVerificationLookup).not.toBeNull();
      expect(newVerificationLookup.verifiedType).toEqual("account");
      expect(newVerificationLookup.verified).toBeTruthy();

      var result = Meteor.call('accounts/generate_reset_password_link', email);
      expect(result).toBeTruthy();

      newVerificationLookup = Verified.findOne({userId: user._id});
      expect(newVerificationLookup).not.toBeNull();
      expect(newVerificationLookup.verifiedType).toEqual("passwordReset");
      expect(newVerificationLookup.verified).toBeFalsy();
      var passwordVerification = newVerificationLookup.verification;

      // Does not use the same password reset and email verification code
      expect(passwordVerification).not.toEqual(verificationCode);

      // Sends the correct code in email", function() {
      expect(Mandrill.messages.send).toHaveBeenCalled();
      var emailHtml = Mandrill.messages.send.calls.mostRecent().args[0].message.html;
      expect(emailHtml).toContain(passwordVerification);

      var emailsSent = Mandrill.messages.send.calls.count();

      // Resends the same password reset code
      result = Meteor.call('accounts/generate_reset_password_link', email);
      expect(result).toBeTruthy();

      users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
      expect(users.length).toEqual(1);
      user = users[0];

      newVerificationLookup = Verified.findOne({userId: user._id});
      expect(newVerificationLookup).not.toBeNull();
      expect(newVerificationLookup.verifiedType).toEqual("passwordReset");
      expect(newVerificationLookup.verified).toBeFalsy();
      expect(newVerificationLookup.verification).toEqual(passwordVerification);

      expect(Mandrill.messages.send).toHaveBeenCalled();
      emailHtml = Mandrill.messages.send.calls.mostRecent().args[0].message.html;
      expect(emailHtml).toContain(passwordVerification);
      expect(Mandrill.messages.send.calls.count()).toEqual(emailsSent + 1);

      // Denies incorrect validation
      var incorrectVerification = passwordVerification + "9";
      result = Meteor.call('accounts/validate_password_reset', email, incorrectVerification);
      expect(result).toEqual({exists: true, verified: false});

      newVerificationLookup = Verified.findOne({userId: user._id});
      expect(newVerificationLookup).not.toBeNull();
      expect(newVerificationLookup.verifiedType).toEqual("passwordReset");
      expect(newVerificationLookup.verified).toBeFalsy();

      // Accepts correct validation
      result = Meteor.call('accounts/validate_password_reset', email, passwordVerification);
      expect(result).toEqual({exists: true, verified: true});

      newVerificationLookup = Verified.findOne({userId: user._id});
      expect(newVerificationLookup).not.toBeNull();
      expect(newVerificationLookup.verifiedType).toEqual("account");
      expect(newVerificationLookup.verified).toBeTruthy();
    });
  });
});