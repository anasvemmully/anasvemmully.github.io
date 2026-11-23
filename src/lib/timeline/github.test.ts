import { describe, expect, it } from "vitest";
import { isHandle, parseRef, refUrl } from "./github";

describe("parseRef", () => {
  it("reads owner/repo#123 and GitHub URLs", () => {
    expect(parseRef("acme/web#123")).toEqual({ repo: "acme/web", num: 123 });
    expect(parseRef(" https://github.com/acme/web/pull/9 ")).toEqual({ repo: "acme/web", num: 9 });
    expect(parseRef("https://github.com/acme/web/issues/77")).toEqual({ repo: "acme/web", num: 77 });
    expect(parseRef("nope")).toBeNull();
  });

  it("builds a link that works for both PRs and issues", () => {
    expect(refUrl("acme/web", 5)).toBe("https://github.com/acme/web/issues/5");
  });
});

describe("isHandle", () => {
  it("accepts GitHub-style handles only", () => {
    expect(isHandle("priya-ops")).toBe(true);
    expect(isHandle("@priya")).toBe(false);
    expect(isHandle("a@b.com")).toBe(false);
    expect(isHandle("-bad")).toBe(false);
  });
});
