const { ParsePath, ParseQuery } = require("../utils/urls-and-cookies.js");

describe("URLs", () => {
  test("Basic pathname parsing", () => {
    expect(ParsePath("/api/v1/")).toEqual(["api", "v1"]);
    expect(ParsePath("")).toEqual([]);
  });

  test("Malformed pathname parsing", () => {
    expect(ParsePath("..////api/v1/../..%2F")).toEqual(["api", "v1"]);
  });

  test("Search params testing", () => {
    expect(ParseQuery("?one=two")).toEqual({ one: "two" });
    expect(ParseQuery("?more")).toEqual({ more: true });
  });
});
