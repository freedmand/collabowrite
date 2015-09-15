describe("Logging in", function(){
  it("Logs in with appropriate account", function(done){
    console.log('in test');
    expect(Meteor.userId()).toBeNull();

    Meteor.loginWithPassword("test@test.com", "testing", function(err){
      expect(err).toBeUndefined();
      expect(Meteor.userId()).not.toBeNull()

      Meteor.logout(function() {
        done();`
      });
    });
  });
});