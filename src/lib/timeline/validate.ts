import { MAX_LABEL, MAX_TEAMS, MAX_TEAM_NAME, MAX_WINDOWS, SLOT, TEAM_COLORS, type Repeat, type Timeline } from "./types";

const isGrid = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n % SLOT === 0;

/** Validates untrusted JSON (import) into a Timeline, or throws with a readable reason. */
export function parseTimeline(input: unknown): Timeline {
  const fail = (m: string): never => {
    throw new Error(m);
  };
  const t = input as { teams?: unknown; windows?: unknown };
  if (!t || !Array.isArray(t.teams) || !Array.isArray(t.windows)) return fail("Expected { teams: [], windows: [] }");
  if (t.teams.length > MAX_TEAMS) fail(`At most ${MAX_TEAMS} teams`);
  if (t.windows.length > MAX_WINDOWS) fail(`At most ${MAX_WINDOWS} windows`);
  const teams = t.teams.map((x: { name?: unknown; color?: unknown }) => {
    if (typeof x?.name !== "string" || x.name.length > MAX_TEAM_NAME) fail("Bad team name");
    if (!Number.isInteger(x.color) || (x.color as number) < 0 || (x.color as number) >= TEAM_COLORS.length) fail("Bad team color");
    return { name: x.name as string, color: x.color as number };
  });
  const windows = t.windows.map((x: Record<string, unknown>) => {
    if (!Number.isInteger(x?.team) || (x.team as number) < 0 || (x.team as number) >= teams.length) fail("Bad window team");
    if (typeof x.label !== "string" || x.label.length > MAX_LABEL) fail("Bad window label");
    if (!isGrid(x.start) || (x.start as number) < 0) fail("Window start must be on the 15-minute grid");
    if (!isGrid(x.duration) || (x.duration as number) <= 0) fail("Window duration must be a positive multiple of 15");
    const r = x.repeat as { kind?: string; days?: unknown; until?: unknown } | undefined;
    let repeat: Repeat;
    if (r?.kind === "none") repeat = { kind: "none" };
    else if (r?.kind === "daily") repeat = { kind: "daily" };
    else if (r?.kind === "weekly") {
      if (!Number.isInteger(r.days) || (r.days as number) < 1 || (r.days as number) > 0x7f) fail("Bad weekly days");
      repeat = { kind: "weekly", days: r.days as number };
    } else return fail("Bad repeat");
    if (r.until !== undefined) {
      if (repeat.kind === "none" || !isGrid(r.until)) fail("Bad repeat end");
      (repeat as { until?: number }).until = r.until as number;
    }
    return { team: x.team as number, label: x.label as string, start: x.start as number, duration: x.duration as number, repeat };
  });
  return { teams, windows };
}
