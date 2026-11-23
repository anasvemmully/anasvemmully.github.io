import type { Timeline } from "./types";

const stamp = (min: number) => new Date(min * 60000).toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/** RFC 5545 folding: lines of at most 75 octets, continuations start with a space. */
function fold(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    const limit = out.length ? 74 : 75;
    if (new TextEncoder().encode(cur + ch).length > limit) {
      out.push(cur);
      cur = "";
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((l, i) => (i ? " " + l : l));
}

/** The whole Timeline as an .ics calendar. Times are UTC, so no VTIMEZONE is needed. */
export function toIcs(t: Timeline, shareUrl: string, now = Date.now()): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//anas.vemmully.in//Window Timeline//EN", "CALSCALE:GREGORIAN"];
  const dtstamp = stamp(Math.floor(now / 60000));
  const event = (uid: string, summary: string, start: number, end: number, extra: string[] = []) =>
    lines.push("BEGIN:VEVENT", `UID:${uid}@window-timeline`, `DTSTAMP:${dtstamp}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${summary}`, ...extra, `URL:${shareUrl}`, "END:VEVENT");

  t.windows.forEach((w, i) => {
    const team = t.teams[w.team]?.name ?? "";
    const r = w.repeat;
    const rule: string[] = [];
    if (r.kind !== "none") {
      let s = `RRULE:FREQ=${r.kind === "daily" ? "DAILY" : "WEEKLY"}`;
      if (r.kind === "weekly") s += `;BYDAY=${DAYS.filter((_, d) => r.days & (1 << d)).join(",")}`;
      if (r.until !== undefined) s += `;UNTIL=${stamp(r.until)}`;
      rule.push(s);
    }
    event(`w${i}-${w.start}`, esc(w.label ? `${team}: ${w.label}` : team), w.start, w.start + w.duration, [...rule, `CATEGORIES:${esc(team)}`]);
  });
  (t.freezes ?? []).forEach((f, i) => event(`f${i}-${f.start}`, esc(`Freeze: ${f.label}`), f.start, f.start + f.duration));

  lines.push("END:VCALENDAR");
  return lines.flatMap(fold).join("\r\n") + "\r\n";
}
