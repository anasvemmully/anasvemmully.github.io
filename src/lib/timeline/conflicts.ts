import { occurrences, type Range } from "./occurrences";
import { findOverlaps } from "./overlaps";
import type { Occurrence, Timeline } from "./types";

export type Conflict = {
  severity: "error" | "warning";
  /** freeze: a Window inside a freeze · service: two Teams on the same service · person: someone double-booked · overlap: time only */
  kind: "freeze" | "service" | "person" | "overlap";
  start: number;
  end: number;
  a: Occurrence;
  b?: Occurrence;
  freeze?: number;
  person?: number;
};

/** Every conflict among occurrences in `range`, errors first, then by time. */
export function findConflicts(t: Timeline, range: Range): Conflict[] {
  const occs = occurrences(t, range);
  const out: Conflict[] = [];

  (t.freezes ?? []).forEach((f, freeze) => {
    const end = f.start + f.duration;
    for (const o of occs)
      if (o.start < end && o.end > f.start)
        out.push({ severity: "error", kind: "freeze", start: Math.max(o.start, f.start), end: Math.min(o.end, end), a: o, freeze });
  });

  for (const ov of findOverlaps(occs)) {
    const sa = t.windows[ov.a.window].service;
    const same = sa !== undefined && sa === t.windows[ov.b.window].service;
    out.push({ severity: same ? "error" : "warning", kind: same ? "service" : "overlap", start: ov.start, end: ov.end, a: ov.a, b: ov.b });
  }

  // Same person on two overlapping Windows (any Teams).
  const sorted = [...occs].sort((x, y) => x.start - y.start);
  for (let i = 0; i < sorted.length; i++) {
    const pa = t.windows[sorted[i].window].assignees;
    if (!pa?.length) continue;
    for (let j = i + 1; j < sorted.length && sorted[j].start < sorted[i].end; j++) {
      const pb = t.windows[sorted[j].window].assignees ?? [];
      for (const person of pa)
        if (pb.includes(person))
          out.push({ severity: "error", kind: "person", start: sorted[j].start, end: Math.min(sorted[i].end, sorted[j].end), a: sorted[i], b: sorted[j], person });
    }
  }

  return out.sort((x, y) => (x.severity === y.severity ? x.start - y.start : x.severity === "error" ? -1 : 1));
}
