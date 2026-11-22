import { describe, expect, it } from "vitest";
import { findOverlaps } from "./overlaps";
import type { Occurrence } from "./types";

const o = (team: number, window: number, start: number, end: number): Occurrence => ({ team, window, start, end });

describe("findOverlaps", () => {
  it("reports the shared span of two Windows from different Teams", () => {
    const got = findOverlaps([o(0, 0, 0, 120), o(1, 1, 60, 180)]);
    expect(got).toEqual([{ start: 60, end: 120, a: o(0, 0, 0, 120), b: o(1, 1, 60, 180) }]);
  });

  it("ignores overlapping Windows of the same Team", () => {
    expect(findOverlaps([o(0, 0, 0, 120), o(0, 1, 60, 180)])).toEqual([]);
  });

  it("does not count Windows that only touch end to start", () => {
    expect(findOverlaps([o(0, 0, 0, 60), o(1, 1, 60, 120)])).toEqual([]);
  });

  it("finds every pair when three Teams coincide", () => {
    const got = findOverlaps([o(0, 0, 0, 100), o(1, 1, 10, 100), o(2, 2, 20, 100)]);
    expect(got.map((x) => [x.a.team, x.b.team])).toEqual([[0, 1], [0, 2], [1, 2]]);
  });
});
