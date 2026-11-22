import { describe, expect, it } from "vitest";
import { occurrences } from "./occurrences";
import type { Timeline } from "./types";

const H = 60;
const DAY = 24 * H;
// 2026-11-22 is a Sunday. Epoch minutes at 00:00 UTC.
const SUN = Date.UTC(2026, 10, 22) / 60000;

const tl = (windows: Timeline["windows"]): Timeline => ({
  teams: [{ name: "Infra", color: 0 }],
  windows,
});

describe("occurrences", () => {
  it("returns a one-off Window that falls inside the range", () => {
    const t = tl([{ team: 0, label: "", start: SUN + 2 * H, duration: 2 * H, repeat: { kind: "none" } }]);
    expect(occurrences(t, { start: SUN, end: SUN + DAY })).toEqual([
      { team: 0, window: 0, start: SUN + 2 * H, end: SUN + 4 * H },
    ]);
  });

  it("omits a one-off Window outside the range", () => {
    const t = tl([{ team: 0, label: "", start: SUN + 2 * H, duration: 2 * H, repeat: { kind: "none" } }]);
    expect(occurrences(t, { start: SUN + DAY, end: SUN + 2 * DAY })).toEqual([]);
  });

  it("repeats daily from the anchor, never before it", () => {
    const t = tl([{ team: 0, label: "", start: SUN + 2 * H, duration: H, repeat: { kind: "daily" } }]);
    const got = occurrences(t, { start: SUN - DAY, end: SUN + 3 * DAY });
    expect(got.map((o) => o.start)).toEqual([SUN + 2 * H, SUN + DAY + 2 * H, SUN + 2 * DAY + 2 * H]);
  });

  it("stops a daily Repeat at its until instant", () => {
    const t = tl([{ team: 0, label: "", start: SUN + 2 * H, duration: H, repeat: { kind: "daily", until: SUN + DAY + 2 * H } }]);
    const got = occurrences(t, { start: SUN, end: SUN + 5 * DAY });
    expect(got.map((o) => o.start)).toEqual([SUN + 2 * H]);
  });

  it("includes an occurrence that began before the range and runs into it", () => {
    const t = tl([{ team: 0, label: "", start: SUN + 22 * H, duration: 4 * H, repeat: { kind: "daily" } }]);
    const got = occurrences(t, { start: SUN + DAY, end: SUN + DAY + H });
    expect(got).toEqual([{ team: 0, window: 0, start: SUN + 22 * H, end: SUN + 26 * H }]);
  });

  it("repeats weekly on the chosen UTC weekdays (Mon + Wed)", () => {
    // anchor Sunday 02:00; mask Mon(bit1)+Wed(bit3)
    const t = tl([{ team: 0, label: "", start: SUN + 2 * H, duration: H, repeat: { kind: "weekly", days: 0b0001010 } }]);
    const got = occurrences(t, { start: SUN, end: SUN + 8 * DAY });
    expect(got.map((o) => o.start)).toEqual([SUN + DAY + 2 * H, SUN + 3 * DAY + 2 * H]);
  });
});
