import { isHandle } from "./github";
import {
  MAX_ASSIGNEES, MAX_FREEZES, MAX_LABEL, MAX_PEOPLE, MAX_REPO, MAX_REPOS, MAX_SERVICE, MAX_SERVICES,
  MAX_TEAMS, MAX_TEAM_NAME, MAX_WINDOWS, SLOT, TEAM_COLORS, type Repeat, type Timeline, type Window,
} from "./types";

const isGrid = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n % SLOT === 0;

/** Validates untrusted JSON (import) into a Timeline, or throws with a readable reason. */
export function parseTimeline(input: unknown): Timeline {
  const fail = (m: string): never => {
    throw new Error(m);
  };
  const t = input as { teams?: unknown; windows?: unknown; people?: unknown; repos?: unknown; services?: unknown; freezes?: unknown };
  const strings = (v: unknown, max: number, maxLen: number, what: string, ok: (s: string) => boolean = () => true): string[] => {
    if (v === undefined) return [];
    if (!Array.isArray(v) || v.length > max) return fail(`Bad ${what} list`);
    return v.map((x) => (typeof x === "string" && x && x.length <= maxLen && ok(x) ? x : fail(`Bad ${what}: ${String(x)}`)));
  };
  const people = strings(Array.isArray(t?.people) ? t.people.map((p: { gh?: unknown }) => p?.gh) : t?.people, MAX_PEOPLE, 39, "GitHub handle", isHandle);
  const repos = strings(t?.repos, MAX_REPOS, MAX_REPO, "repo", (r) => /^[\w.-]+\/[\w.-]+$/.test(r));
  const services = strings(t?.services, MAX_SERVICES, MAX_SERVICE, "service");
  const idx = (v: unknown, len: number) => Number.isInteger(v) && (v as number) >= 0 && (v as number) < len;
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
    const win: Window = { team: x.team as number, label: x.label as string, start: x.start as number, duration: x.duration as number, repeat };
    if (x.assignees !== undefined) {
      const a = x.assignees as unknown[];
      if (!Array.isArray(a) || !a.length || a.length > MAX_ASSIGNEES || !a.every((v) => idx(v, people.length))) fail("Bad assignees");
      win.assignees = a as number[];
    }
    if (x.ref !== undefined) {
      const r = x.ref as { repo?: unknown; num?: unknown };
      if (!idx(r?.repo, repos.length) || !Number.isInteger(r.num) || (r.num as number) < 1) fail("Bad GitHub ref");
      win.ref = { repo: r.repo as number, num: r.num as number };
    }
    if (x.service !== undefined) {
      if (!idx(x.service, services.length)) fail("Bad service");
      win.service = x.service as number;
    }
    return win;
  });
  const out: Timeline = { teams, windows };
  if (t.freezes !== undefined) {
    if (!Array.isArray(t.freezes) || t.freezes.length > MAX_FREEZES) fail("Bad freezes");
    const freezes = (t.freezes as Record<string, unknown>[]).map((f) => {
      if (typeof f?.label !== "string" || f.label.length > MAX_LABEL || !isGrid(f.start) || !isGrid(f.duration) || (f.duration as number) <= 0) fail("Bad freeze");
      return { label: f.label as string, start: f.start as number, duration: f.duration as number };
    });
    if (freezes.length) out.freezes = freezes;
  }
  if (people.length) out.people = people.map((gh) => ({ gh }));
  if (repos.length) out.repos = repos;
  if (services.length) out.services = services;
  return out;
}
