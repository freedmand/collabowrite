/**
 * Created by freedmand on 10/2/15.
 */

var email = "test@example.com";
var localEmail = "test2@example.com";
var password = "password123";

var moniker1 = 'tester';
var moniker1_alt1 = 'Tester';
var moniker1_alt2 = 'TEST_ER';

var moniker2 = 'tester2';

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

    var result = validateAccount(email, verificationCode);
    expect(result).toBeTruthy();

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
    var result = validateAccount(email, verificationCode);
    expect(result).toBeFalsy();

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

      var result = validateAccount(email, verificationCode);
      expect(result).toBeTruthy();

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

describe("Moniker Creation", function() {
  var createUser = null;
  var verificationLookup = null;
  var verificationCode = null;
  var user;

  beforeEach(function() {
    resetDatabase();
    loadDefaultFixtures();

    spyOn(Meteor, 'call').and.callThrough();
    spyOn(Mandrill.messages, 'send');

    createUser = Meteor.call('accounts/create_user', email, password);

    var users = Meteor.users.find({emails: {$elemMatch: {address: email}}}).fetch();
    expect(users.length).toEqual(1);
    user = users[0];
    verificationLookup = Verified.findOne({userId: user._id});
    expect(verificationLookup).not.toBeNull();
    verificationCode = verificationLookup.verification;
  });

  it("Allows creation of a moniker in a validated account", function() {
    var result = Meteor.call('accounts/check_moniker', moniker1);
    expect(result.exists).toBeFalsy();

    result = validateAccount(email, verificationCode);
    expect(result).toBeTruthy();

    spyOn(Meteor, 'userId').and.returnValue(user._id);

    result = Meteor.call('accounts/register_moniker', moniker1);
    expect(result).toBeTruthy();
    result = Meteor.call('accounts/check_moniker', moniker1);
    expect(result.exists).toBeTruthy();
    result = Meteor.call('accounts/check_moniker', moniker1_alt1);
    expect(result.exists).toBeTruthy();
    result = Meteor.call('accounts/check_moniker', moniker1_alt2);
    expect(result.exists).toBeTruthy();
  });

  it("Denies creation of multiple monikers with one account", function() {
    var result = Meteor.call('accounts/check_moniker', moniker1);
    expect(result.exists).toBeFalsy();

    result = validateAccount(email, verificationCode);
    expect(result).toBeTruthy();

    spyOn(Meteor, 'userId').and.returnValue(user._id);

    result = Meteor.call('accounts/register_moniker', moniker1);
    expect(result).toBeTruthy();
    expect(function() {Meteor.call('accounts/register_moniker', moniker2)}).toThrow();
  });

  it("Denies creation of a moniker in an unvalidated account", function() {
    var result = Meteor.call('accounts/check_moniker', moniker1);
    expect(result.exists).toBeFalsy();

    spyOn(Meteor, 'userId').and.returnValue(user._id);
    expect(function() {Meteor.call('accounts/register_moniker', moniker1)}).toThrow();

    result = Meteor.call('accounts/check_moniker', moniker1);
    expect(result.exists).toBeFalsy();
  });

  it("Denies creation of duplicate monikers", function() {
    var result = Meteor.call('accounts/check_moniker', moniker1);
    expect(result.exists).toBeFalsy();
    result = Meteor.call('accounts/check_moniker', moniker1_alt1);
    expect(result.exists).toBeFalsy();
    result = Meteor.call('accounts/check_moniker', moniker1_alt2);
    expect(result.exists).toBeFalsy();
    result = Meteor.call('accounts/check_moniker', moniker2);
    expect(result.exists).toBeFalsy();

    // create a new user
    Meteor.call('accounts/create_user', localEmail, password);
    var users = Meteor.users.find({emails: {$elemMatch: {address: localEmail}}}).fetch();
    expect(users.length).toEqual(1);
    var newUser = users[0];
    var newVerificationLookup = Verified.findOne({userId: newUser._id});
    expect(newVerificationLookup).not.toBeNull();
    var newVerificationCode = newVerificationLookup.verification;

    // validate both accounts
    result = validateAccount(localEmail, newVerificationCode);
    expect(result).toBeTruthy();
    result = validateAccount(email, verificationCode);
    expect(result).toBeTruthy();

    spyOn(Meteor, 'userId').and.returnValue(newUser._id);
    result = Meteor.call('accounts/register_moniker', moniker1);
    expect(result).toBeTruthy();

    // expect duplicate moniker creation to fail
    Meteor.userId = jasmine.createSpy().and.returnValue(user._id);
    expect(function() {Meteor.call('accounts/register_moniker', moniker1)}).toThrow();
    expect(function() {Meteor.call('accounts/register_moniker', moniker1_alt1)}).toThrow();
    expect(function() {Meteor.call('accounts/register_moniker', moniker1_alt2)}).toThrow();

    // expect new moniker creation to work after fails
    result = Meteor.call('accounts/register_moniker', moniker2);
    expect(result).toBeTruthy();

    result = Meteor.call('accounts/check_moniker', moniker1);
    expect(result.exists).toBeTruthy();
    result = Meteor.call('accounts/check_moniker', moniker1_alt1);
    expect(result.exists).toBeTruthy();
    result = Meteor.call('accounts/check_moniker', moniker1_alt2);
    expect(result.exists).toBeTruthy();
    result = Meteor.call('accounts/check_moniker', moniker2);
    expect(result.exists).toBeTruthy();
  });
});