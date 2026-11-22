import { weekdayOf } from "./time";
import { DAY, type Occurrence, type Timeline, type Window } from "./types";

export type Range = { start: number; end: number };

function fires(w: Window, start: number): boolean {
  const r = w.repeat;
  if (r.kind === "none") return start === w.start;
  if (start < w.start) return false;
  if (r.until !== undefined && start >= r.until) return false;
  if (r.kind === "daily") return true;
  return (r.days & (1 << weekdayOf(start, "utc"))) !== 0;
}

export function occurrences(timeline: Timeline, range: Range): Occurrence[] {
  const out: Occurrence[] = [];
  timeline.windows.forEach((w, window) => {
    if (w.repeat.kind === "none") {
      const end = w.start + w.duration;
      if (w.start < range.end && end > range.start) {
        out.push({ team: w.team, window, start: w.start, end });
      }
      return;
    }
    const tod = ((w.start % DAY) + DAY) % DAY;
    // first day whose occurrence could still reach into the range
    let day = Math.floor((range.start - w.duration - tod) / DAY);
    for (; day * DAY + tod < range.end; day++) {
      const start = day * DAY + tod;
      const end = start + w.duration;
      if (end > range.start && fires(w, start)) {
        out.push({ team: w.team, window, start, end });
      }
    }
  });
  return out.sort((a, b) => a.start - b.start || a.window - b.window);
}
