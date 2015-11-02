/**
 * Created by freedmand on 11/1/15.
 */

describe("Current page works", function() {
  beforeEach(function() {
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  // hard-code month as November
  function randomDate(day) {
    var startOfDay = moment({year: 2015, month: 10, day: day});
    var startOfNext = moment({year: 2015, month: 10, day: day + 1});
    return moment(startOfDay + Math.floor(Math.random() * startOfNext.diff(startOfDay)));
  }

  it("Gets the page correctly", function() {
    for (var i = 1; i <= 30; i++) {
      jasmine.clock().mockDate(randomDate(i).toDate());
      console.log(new Date());
      var result = Meteor.call('server/getpage');
      console.log(result);
      expect(result).not.toBeNull();
      expect(result.page).toEqual(i);
      expect(moment.duration(result.remaining)).toBeLessThan(moment.duration({days:1}));
    }
  });

  it("Gets the exact day changes correct", function() {
    var day = moment({year: 2015, month: 10, day: 2});
    jasmine.clock().mockDate(moment(day - 1).toDate());
    console.log(new Date());
    var result = Meteor.call('server/getpage');
    console.log(result);
    expect(result.page).toEqual(1);
    expect(moment.duration(result.remaining)).toBeLessThan(moment.duration({seconds:1}));
    jasmine.clock().mockDate(day.toDate());
    result = Meteor.call('server/getpage');
    expect(result.page).toEqual(2);
    expect(moment.duration(result.remaining)).toBeGreaterThan(moment.duration({days:1, seconds: -1}));
    expect(moment.duration(result.remaining)).toBeLessThan(moment.duration({days:1, seconds: 1}));

  });
});