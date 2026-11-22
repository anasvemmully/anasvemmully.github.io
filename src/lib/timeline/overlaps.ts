import type { Occurrence } from "./types";

export type Overlap = { start: number; end: number; a: Occurrence; b: Occurrence };

/** Spans where occurrences of different Teams coincide. Touching ends do not count. */
export function findOverlaps(occs: Occurrence[]): Overlap[] {
  const sorted = [...occs].sort((x, y) => x.start - y.start || x.team - y.team || x.window - y.window);
  const out: Overlap[] = [];
  let active: Occurrence[] = [];
  for (const cur of sorted) {
    active = active.filter((p) => p.end > cur.start);
    for (const prev of active) {
      if (prev.team !== cur.team) {
        out.push({ start: cur.start, end: Math.min(prev.end, cur.end), a: prev, b: cur });
      }
    }
    active.push(cur);
  }
  return out;
}
