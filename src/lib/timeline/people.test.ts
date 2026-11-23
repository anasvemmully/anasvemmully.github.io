import { describe, expect, it } from "vitest";
import { byPerson } from "./people";
import type { Timeline } from "./types";

describe("byPerson", () => {
  it("gives each person a lane, copies shared Windows, and keeps an Unassigned lane", () => {
    const t: Timeline = {
      teams: [{ name: "Ops", color: 3 }],
      people: [{ gh: "ann" }, { gh: "bo" }],
      windows: [
        { team: 0, label: "Deploy", start: 0, duration: 15, repeat: { kind: "none" }, assignees: [0, 1] },
        { team: 0, label: "", start: 15, duration: 15, repeat: { kind: "none" } },
      ],
    };
    const { timeline, source } = byPerson(t);
    expect(timeline.teams.map((x) => x.name)).toEqual(["@ann", "@bo", "Unassigned"]);
    expect(timeline.windows.map((w) => [w.team, w.label])).toEqual([[0, "Ops · Deploy"], [1, "Ops · Deploy"], [2, "Ops"]]);
    expect(source).toEqual([0, 0, 1]);
  });
});
