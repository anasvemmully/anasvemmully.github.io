import { describe, expect, it } from "vitest";
import { removePerson, removeService, removeTeam, setRef } from "./edit";
import type { Timeline, Window } from "./types";

const w = (over: Partial<Window> = {}): Window => ({ team: 0, label: "", start: 0, duration: 15, repeat: { kind: "none" }, ...over });

describe("timeline edits keep indexes consistent", () => {
  it("removeTeam drops its Windows and shifts later Teams", () => {
    const t: Timeline = { teams: [{ name: "A", color: 0 }, { name: "B", color: 1 }], windows: [w({ team: 0 }), w({ team: 1 })] };
    expect(removeTeam(t, 0).windows).toEqual([w({ team: 0 })]);
  });

  it("removePerson unassigns them and shifts later people", () => {
    const t: Timeline = { teams: [], people: [{ gh: "a" }, { gh: "b" }], windows: [w({ assignees: [0, 1] }), w({ assignees: [0] })] };
    const r = removePerson(t, 0);
    expect(r.people).toEqual([{ gh: "b" }]);
    expect(r.windows).toEqual([w({ assignees: [0] }), w()]);
  });

  it("removeService clears it from Windows", () => {
    const t: Timeline = { teams: [], services: ["db", "api"], windows: [w({ service: 0 }), w({ service: 1 })] };
    expect(removeService(t, 0)).toEqual({ teams: [], services: ["api"], windows: [w(), w({ service: 0 })] });
  });

  it("setRef reuses or adds the repo, and drops repos nothing uses", () => {
    let t: Timeline = { teams: [], windows: [w(), w()] };
    t = setRef(t, 0, { repo: "acme/web", num: 5 });
    t = setRef(t, 1, { repo: "acme/web", num: 6 });
    expect(t.repos).toEqual(["acme/web"]);
    expect(t.windows.map((x) => x.ref)).toEqual([{ repo: 0, num: 5 }, { repo: 0, num: 6 }]);
    t = setRef(setRef(t, 0, null), 1, { repo: "acme/api", num: 1 });
    expect(t.repos).toEqual(["acme/api"]);
    expect(t.windows.map((x) => x.ref)).toEqual([undefined, { repo: 0, num: 1 }]);
  });
});
