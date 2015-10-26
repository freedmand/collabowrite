/**
 * Created by freedmand on 10/25/15.
 */

describe("HTML to text works correctly", function() {
  it('Preserves only the text content', function() {
    expect(
        Meteor.call('server/htmlToText', '<p>Dogs are cool!</p>')
    ).toEqual('Dogs are cool!');
    expect(
        Meteor.call('server/htmlToText', 'Dogs are cool!')
    ).toEqual('Dogs are cool!');
    expect(
        Meteor.call('server/htmlToText', '<p>Dogs <i>are</i> <b><u>cool</u></b>!</p>')
    ).toEqual('Dogs are cool!');
  });

  it('Handles whitespace intuitively', function() {
    expect(
        Meteor.call('server/htmlToText', '<p>Dogs</p><p>are</p><p>cool!</p>')
    ).toEqual('Dogs are cool!');
    expect(
        Meteor.call('server/htmlToText', '<p>Dogs</p><p></p><p>are</p><p>cool!</p>')
    ).toEqual('Dogs are cool!');
  });

  it('Works with HTML entities', function() {
    expect(
        Meteor.call('server/htmlToText', '<p>My dog’s cool!</p>')
    ).toEqual('My dog’s cool!');
  });
});
