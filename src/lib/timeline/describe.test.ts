import { describe, expect, it } from "vitest";
import { describeRepeat, formatDuration } from "./describe";

describe("formatDuration", () => {
  it("formats minutes, hours and days", () => {
    expect(formatDuration(30)).toBe("30 min");
    expect(formatDuration(90)).toBe("1 h 30 min");
    expect(formatDuration(120)).toBe("2 h");
    expect(formatDuration(1440)).toBe("1 d");
    expect(formatDuration(1500)).toBe("1 d 1 h");
  });
});

describe("describeRepeat", () => {
  it("summarises every kind", () => {
    expect(describeRepeat({ kind: "none" })).toBe("One-off");
    expect(describeRepeat({ kind: "daily" })).toBe("Daily");
    expect(describeRepeat({ kind: "weekly", days: 0b0001010 })).toBe("Weekly on Mon, Wed (UTC)");
  });
});
