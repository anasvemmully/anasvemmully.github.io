import type { Timeline, Window } from "./types";

/** Drop optional fields that became empty, so the link stays minimal. */
function tidy(w: Window): Window {
  const { assignees, ref, service, ...rest } = w;
  return { ...rest, ...(assignees?.length ? { assignees } : {}), ...(ref ? { ref } : {}), ...(service !== undefined ? { service } : {}) };
}

/** Re-index a table-backed field after removing entry `i` (undefined = cleared). */
const shift = (v: number, i: number) => (v === i ? undefined : v > i ? v - 1 : v);

export function removeTeam(t: Timeline, i: number): Timeline {
  return {
    ...t,
    teams: t.teams.filter((_, k) => k !== i),
    windows: t.windows.filter((w) => w.team !== i).map((w) => (w.team > i ? { ...w, team: w.team - 1 } : w)),
  };
}

export function removePerson(t: Timeline, i: number): Timeline {
  const people = (t.people ?? []).filter((_, k) => k !== i);
  return {
    ...t,
    ...(people.length ? { people } : { people: undefined }),
    windows: t.windows.map((w) => tidy({ ...w, assignees: w.assignees?.map((a) => shift(a, i)).filter((a): a is number => a !== undefined) })),
  };
}

export function removeService(t: Timeline, i: number): Timeline {
  const services = (t.services ?? []).filter((_, k) => k !== i);
  const out: Timeline = { ...t, windows: t.windows.map((w) => tidy({ ...w, service: w.service === undefined ? undefined : shift(w.service, i) })) };
  if (services.length) out.services = services;
  else delete out.services;
  return out;
}

/** Point Window `wi` at a GitHub issue/PR (or clear it), keeping the repo table to repos in use. */
export function setRef(t: Timeline, wi: number, ref: { repo: string; num: number } | null): Timeline {
  let repos = [...(t.repos ?? [])];
  let idx = -1;
  if (ref) {
    idx = repos.indexOf(ref.repo);
    if (idx === -1) idx = repos.push(ref.repo) - 1;
  }
  let windows = t.windows.map((w, k) => (k === wi ? tidy({ ...w, ref: ref ? { repo: idx, num: ref.num } : undefined }) : w));
  // prune repos no Window points at
  const used = new Set(windows.flatMap((w) => (w.ref ? [w.ref.repo] : [])));
  const remap = new Map<number, number>();
  repos = repos.filter((_, k) => used.has(k) && remap.set(k, remap.size));
  windows = windows.map((w) => (w.ref ? { ...w, ref: { ...w.ref, repo: remap.get(w.ref.repo)! } } : w));
  const out: Timeline = { ...t, windows };
  if (repos.length) out.repos = repos;
  else delete out.repos;
  return out;
}
