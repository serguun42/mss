import { parsePath, parseQuery } from "../util/urls-and-cookies.js";

describe("URLs", () => {
  test("Basic pathname parsing", () => {
    expect(parsePath("/api/v1/")).toEqual(["api", "v1"]);
    expect(parsePath("")).toEqual([]);
  });

  test("Malformed pathname parsing", () => {
    expect(parsePath("..////api/v1/../..%2F")).toEqual(["api", "v1"]);
  });

  test("Search params testing", () => {
    expect(parseQuery("?one=two")).toEqual({ one: "two" });
    expect(parseQuery("?more")).toEqual({ more: true });
  });
});
