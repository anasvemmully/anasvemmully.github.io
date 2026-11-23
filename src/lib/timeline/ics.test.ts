import { describe, expect, it } from "vitest";
import { toIcs } from "./ics";
import type { Timeline } from "./types";

const T0 = Date.UTC(2026, 10, 23, 14) / 60000;
const t: Timeline = {
  teams: [{ name: "Ops, EU", color: 0 }],
  windows: [
    { team: 0, label: "Deploy; prod", start: T0, duration: 90, repeat: { kind: "weekly", days: 0b0001010, until: T0 + 1440 * 30 } },
    { team: 0, label: "", start: T0, duration: 15, repeat: { kind: "daily" } },
  ],
  freezes: [{ label: "Freeze", start: T0, duration: 1440 }],
};

describe("toIcs", () => {
  const ics = toIcs(t, "https://example.test/timeline#abc");
  const lines = ics.split("\r\n");

  it("is a CRLF calendar with one event per Window and freeze", () => {
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("writes UTC times, RRULEs and escaped text", () => {
    expect(lines).toContain("DTSTART:20261123T140000Z");
    expect(lines).toContain("DTEND:20261123T153000Z");
    expect(lines).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261223T140000Z");
    expect(lines).toContain("RRULE:FREQ=DAILY");
    expect(lines).toContain("SUMMARY:Ops\\, EU: Deploy\; prod");
  });

  it("folds lines longer than 75 octets", () => {
    expect(lines.every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true);
  });
});
