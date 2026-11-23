import { TEAM_COLORS, type Timeline } from "./types";

/**
 * The same Timeline with one lane per person instead of per Team.
 * A Window with several assignees appears in each of their lanes; `source[i]` is the original Window index.
 */
export function byPerson(t: Timeline): { timeline: Timeline; source: number[] } {
  const people = t.people ?? [];
  const unassigned = people.length;
  const source: number[] = [];
  const windows = t.windows.flatMap((w, i) => {
    const team = t.teams[w.team]?.name ?? "";
    const label = w.label ? `${team} · ${w.label}` : team;
    return (w.assignees?.length ? w.assignees : [unassigned]).map((p) => {
      source.push(i);
      return { ...w, team: p, label };
    });
  });
  const teams = [...people.map((p, k) => ({ name: `@${p.gh}`, color: k % TEAM_COLORS.length })), { name: "Unassigned", color: TEAM_COLORS.length - 1 }];
  return { timeline: { ...t, teams, windows }, source };
}
