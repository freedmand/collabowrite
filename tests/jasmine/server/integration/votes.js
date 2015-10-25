/**
 * Created by freedmand on 10/25/15.
 */

var userId1 = 'u1';
var userId2 = 'u2';

var submissionId1 = null;
var submissionId2 = null;


describe("Voting works correctly", function() {
  beforeEach(function() {
    resetDatabase();
    loadDefaultFixtures();

    submissionId1 = Submissions.insert({
      'body': 'test',
      'text': 'test',
      'summary': 'test',
      'moniker': 'test',
      'monikerNorm': 'test',
      'wordcount': 1,
      'upvotes': 0
    });

    submissionId2 = Submissions.insert({
      'body': 'test',
      'text': 'test',
      'summary': 'test',
      'moniker': 'test',
      'monikerNorm': 'test',
      'wordcount': 1,
      'upvotes': 0
    });
  });

  function checkUpvotes(submissionId) {
    return Submissions.findOne(submissionId).upvotes;
  }

  it("Permits voting on multiple submissions", function() {
    spyOn(Meteor, 'userId').and.returnValue(userId1);
    expect(checkUpvotes(submissionId1)).toEqual(0);
    expect(checkUpvotes(submissionId2)).toEqual(0);
    var result = Meteor.call('server/upvote_submission', submissionId1);
    expect(result).toBeTruthy();
    expect(checkUpvotes(submissionId1)).toEqual(1);
    result = Meteor.call('server/upvote_submission', submissionId2);
    expect(result).toBeTruthy();
    expect(checkUpvotes(submissionId2)).toEqual(1);
  });

  it("Does not permit double voting", function() {
    spyOn(Meteor, 'userId').and.returnValue(userId1);
    expect(checkUpvotes(submissionId1)).toEqual(0);
    var result = Meteor.call('server/upvote_submission', submissionId1);
    expect(result).toBeTruthy();
    expect(checkUpvotes(submissionId1)).toEqual(1);
    expect(function() {Meteor.call('server/upvote_submission', submissionId1)}).toThrow();
    expect(checkUpvotes(submissionId1)).toEqual(1);
  });

  it("Permits multiple users voting on the same thing", function() {
    spyOn(Meteor, 'userId').and.returnValue(userId1);
    expect(checkUpvotes(submissionId1)).toEqual(0);
    var result = Meteor.call('server/upvote_submission', submissionId1);
    expect(result).toBeTruthy();
    expect(checkUpvotes(submissionId1)).toEqual(1);
    expect(function() {Meteor.call('server/upvote_submission', submissionId1)}).toThrow();
    expect(checkUpvotes(submissionId1)).toEqual(1);

    Meteor.userId = jasmine.createSpy().and.returnValue(userId2);
    result = Meteor.call('server/upvote_submission', submissionId1);
    expect(result).toBeTruthy();
    expect(checkUpvotes(submissionId1)).toEqual(2);
    expect(function() {Meteor.call('server/upvote_submission', submissionId1)}).toThrow();
    expect(checkUpvotes(submissionId1)).toEqual(2);
  });

  it("Can remove upvotes", function() {
    spyOn(Meteor, 'userId').and.returnValue(userId1);
    expect(checkUpvotes(submissionId1)).toEqual(0);
    var result = Meteor.call('server/upvote_submission', submissionId1);
    expect(result).toBeTruthy();
    expect(checkUpvotes(submissionId1)).toEqual(1);
    expect(function() {Meteor.call('server/upvote_submission', submissionId1)}).toThrow();
    expect(checkUpvotes(submissionId1)).toEqual(1);

    result = Meteor.call('server/remove_submission_upvote', submissionId1);
    expect(result).toBeTruthy();
    expect(checkUpvotes(submissionId1)).toEqual(0);
    expect(function() {Meteor.call('server/remove_submission_upvote', submissionId1)}).toThrow();
    expect(checkUpvotes(submissionId1)).toEqual(0);

    result = Meteor.call('server/upvote_submission', submissionId1);
    expect(result).toBeTruthy();
    expect(checkUpvotes(submissionId1)).toEqual(1);
    expect(function() {Meteor.call('server/upvote_submission', submissionId1)}).toThrow();
    expect(checkUpvotes(submissionId1)).toEqual(1);
  });
});