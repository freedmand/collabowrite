describe("Normalize Moniker", function() {
  it("Normalizes correctly", function() {
    expect(normalizeMoniker("J. K. Rowling")).toEqual("JKROWLING");
    expect(normalizeMoniker("  a_3-J  ")).toEqual("A3J");
    expect(normalizeMoniker("  ..  ")).toEqual("");
    expect(normalizeMoniker("")).toEqual("");
  });
  it("Only accepts proper monikers", function() {
    expect(monikerValid("J. K. Rowling")).toBeTruthy();
    expect(monikerValid("  a_3-J  ")).toBeTruthy();
    expect(monikerValid(" .... ")).toBeFalsy();
    expect(monikerValid("")).toBeFalsy();
    expect(monikerValid(" __  AB  __- ")).toBeFalsy();
    expect(monikerValid(" __  AB  __9- ")).toBeTruthy();
    expect(monikerValid("D. S. F.")).toBeTruthy();
  });
});