import { describe, expect, it } from "vitest";
import { findConflicts } from "./conflicts";
import type { Timeline } from "./types";

const T0 = Date.UTC(2026, 10, 23) / 60000;
const base = (over: Partial<Timeline>): Timeline => ({
  teams: [{ name: "A", color: 0 }, { name: "B", color: 1 }],
  windows: [],
  ...over,
});
const range = { start: T0, end: T0 + 1440 };

describe("findConflicts", () => {
  it("calls a window inside a freeze an error", () => {
    const t = base({
      freezes: [{ label: "Freeze", start: T0, duration: 120 }],
      windows: [{ team: 0, label: "Deploy", start: T0 + 60, duration: 60, repeat: { kind: "none" } }],
    });
    expect(findConflicts(t, range)).toMatchObject([{ kind: "freeze", severity: "error" }]);
  });

  it("calls an overlap on the same service an error, and a plain overlap a warning", () => {
    const w = (team: number, service?: number) => ({ team, label: "", start: T0, duration: 60, repeat: { kind: "none" as const }, service });
    expect(findConflicts(base({ services: ["db"], windows: [w(0, 0), w(1, 0)] }), range)).toMatchObject([{ kind: "service", severity: "error" }]);
    expect(findConflicts(base({ services: ["db", "api"], windows: [w(0, 0), w(1, 1)] }), range)).toMatchObject([{ kind: "overlap", severity: "warning" }]);
    expect(findConflicts(base({ windows: [w(0), w(1)] }), range)).toMatchObject([{ kind: "overlap", severity: "warning" }]);
  });

  it("flags one person on two overlapping windows, even in the same team", () => {
    const t = base({
      people: [{ gh: "sam" }],
      windows: [
        { team: 0, label: "x", start: T0, duration: 60, repeat: { kind: "none" }, assignees: [0] },
        { team: 0, label: "y", start: T0 + 30, duration: 60, repeat: { kind: "none" }, assignees: [0] },
      ],
    });
    expect(findConflicts(t, range)).toMatchObject([{ kind: "person", severity: "error", person: 0 }]);
  });

  it("lists errors before warnings", () => {
    const t = base({
      freezes: [{ label: "F", start: T0 + 600, duration: 60 }],
      windows: [
        { team: 0, label: "", start: T0, duration: 60, repeat: { kind: "none" } },
        { team: 1, label: "", start: T0, duration: 60, repeat: { kind: "none" } },
        { team: 0, label: "", start: T0 + 600, duration: 30, repeat: { kind: "none" } },
      ],
    });
    expect(findConflicts(t, range).map((c) => c.severity)).toEqual(["error", "warning"]);
  });
});
