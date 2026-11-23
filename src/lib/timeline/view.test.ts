import { describe, expect, it } from "vitest";
import { MAX_SPAN, MIN_SPAN, detailLevel, panBy, ticks, zoomAt, zoomToRange } from "./view";
import { DAY } from "./types";

const H = 60;
// 2026-11-23 00:00 UTC (a Monday)
const MON = Date.UTC(2026, 10, 23) / 60000;

describe("zoomAt", () => {
  it("keeps the instant under the anchor fixed", () => {
    const v = { start: MON, span: 7 * DAY };
    const anchor = 0.25;
    const before = v.start + anchor * v.span;
    const next = zoomAt(v, 2, anchor);
    expect(next.span).toBe((7 * DAY) / 2);
    expect(next.start + anchor * next.span).toBeCloseTo(before, 6);
  });

  it("clamps to the min and max span", () => {
    expect(zoomAt({ start: MON, span: 2 * H }, 100, 0.5).span).toBe(MIN_SPAN);
    expect(zoomAt({ start: MON, span: 80 * DAY }, 0.01, 0.5).span).toBe(MAX_SPAN);
  });
});

describe("panBy", () => {
  it("shifts start and keeps span", () => {
    expect(panBy({ start: 100, span: 50 }, 30)).toEqual({ start: 130, span: 50 });
  });
});

describe("zoomToRange", () => {
  it("frames a short range with padding and enforces the minimum span", () => {
    const v = zoomToRange(MON + 600, MON + 630);
    expect(v.span).toBe(MIN_SPAN);
    expect(v.start + v.span / 2).toBe(MON + 615);
  });
});

describe("detailLevel", () => {
  it("switches by visible span", () => {
    expect(detailLevel(12 * H)).toBe("hour");
    expect(detailLevel(36 * H)).toBe("hour");
    expect(detailLevel(7 * DAY)).toBe("day");
    expect(detailLevel(21 * DAY)).toBe("day");
    expect(detailLevel(45 * DAY)).toBe("week");
  });
});

describe("ticks", () => {
  it("gives hourly-ish ticks with day groups when zoomed in", () => {
    const t = ticks({ start: MON, span: DAY }, 1200, "utc");
    expect(t.level).toBe("hour");
    expect(t.marks.length).toBeGreaterThanOrEqual(12);
    expect(t.marks[0]).toMatchObject({ at: MON, strong: true });
    expect(t.groups[0].at).toBe(MON);
  });

  it("labels every day in a week, and only Mondays across a quarter", () => {
    const week = ticks({ start: MON, span: 7 * DAY }, 1200, "utc");
    expect(week.marks.filter((m) => m.label).length).toBe(7);
    const quarter = ticks({ start: MON, span: 84 * DAY }, 1200, "utc");
    const labelled = quarter.marks.filter((m) => m.label);
    expect(labelled.length).toBeGreaterThanOrEqual(11);
    expect(labelled.length).toBeLessThanOrEqual(13);
    expect(quarter.groups.length).toBeGreaterThanOrEqual(3); // months
  });

  it("thins labels on narrow screens", () => {
    const wide = ticks({ start: MON, span: 7 * DAY }, 1200, "utc").marks.filter((m) => m.label).length;
    const narrow = ticks({ start: MON, span: 7 * DAY }, 260, "utc").marks.filter((m) => m.label).length;
    expect(narrow).toBeLessThan(wide);
  });
});
