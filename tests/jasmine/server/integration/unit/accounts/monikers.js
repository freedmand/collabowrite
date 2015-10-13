/**
 * Created by freedmand on 10/2/15.
 */
describe("Normalize Moniker", function() {
  function norm(moniker) {
    return Meteor.call("server/normalize_moniker", moniker);
  }

  it("Normalizes correctly", function() {
    expect(norm("J. K. Rowling")).toEqual("jkrowling");
    expect(norm("  a_3-J  ")).toEqual("a3j");
    expect(norm("  ..  ")).toEqual("");
    expect(norm("")).toEqual("");
  });
  //it("Validates against schema properly", function() {
  //  MonikerSchema.namedContent("test").validate({moniker: "J. K. Rowling"}).toBeTruthy();
  //  MonikerSchema.namedContent("test").validate({moniker: "  a_3-J  "}).toBeTruthy();
  //  MonikerSchema.namedContent("test").validate({moniker: " .... "}).toBeFalsy();
  //  MonikerSchema.namedContent("test").validate({moniker: ""}).toBeFalsy();
  //  MonikerSchema.namedContent("test").validate({moniker: " __  AB  __- "}).toBeFalsy();
  //  MonikerSchema.namedContent("test").validate({moniker: " __  AB  __9- "}).toBeTruthy();
  //  MonikerSchema.namedContent("test").validate({moniker: "D. S. F."}).toBeTruthy();
  //});
});