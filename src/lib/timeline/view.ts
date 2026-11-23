import { addDays, addMonths, dayOfMonth, formatDay, formatTime, startOfDay, startOfMonth, weekdayOf, type Zone } from "./time";
import { DAY } from "./types";

/** What the Swimlane is showing: the instant at the left edge and how many minutes fit across. */
export type View = { start: number; span: number };
export type Level = "hour" | "day" | "week" | "month";

export const MIN_SPAN = 6 * 60;
export const MAX_SPAN = 2 * 365 * DAY;

const clampSpan = (s: number) => Math.min(MAX_SPAN, Math.max(MIN_SPAN, s));

/** Zoom by `factor` (>1 zooms in), keeping the instant at `anchor` (0..1 across the chart) in place. */
export function zoomAt(v: View, factor: number, anchor: number): View {
  const span = clampSpan(v.span / factor);
  return { start: v.start + anchor * (v.span - span), span };
}

export const panBy = (v: View, minutes: number): View => ({ start: v.start + minutes, span: v.span });

/** Frame [start, end] with generous padding. */
export function zoomToRange(start: number, end: number): View {
  const span = clampSpan((end - start) * 6);
  return { start: (start + end) / 2 - span / 2, span };
}

export function detailLevel(span: number): Level {
  if (span <= 36 * 60) return "hour";
  if (span <= 21 * DAY) return "day";
  if (span <= 120 * DAY) return "week";
  return "month";
}

export type Mark = { at: number; label: string; strong: boolean };
export type Group = { at: number; label: string };

const MIN_LABEL_PX = 56;
const HOUR_STEPS = [60, 120, 180, 360, 720];

/** Tick marks (with optional labels) plus the coarser header groups for the current view. */
export function ticks(v: View, width: number, zone: Zone): { level: Level; marks: Mark[]; groups: Group[] } {
  const level = detailLevel(v.span);
  const end = v.start + v.span;
  const pxPerMin = width / v.span;
  const marks: Mark[] = [];
  const groups: Group[] = [];

  if (level === "hour") {
    const step = HOUR_STEPS.find((s) => s * pxPerMin >= MIN_LABEL_PX) ?? 720;
    const sub = pxPerMin * 15 >= MIN_LABEL_PX ? 15 : pxPerMin * 30 >= MIN_LABEL_PX ? 30 : step;
    const stepMin = Math.min(step, sub);
    for (let day = startOfDay(v.start, zone); day < end; day = addDays(day, 1, zone)) {
      groups.push({ at: day, label: formatDay(day, zone, { weekday: "long", day: "numeric", month: "short" }) });
      for (let m = 0; m < DAY && day + m < end; m += stepMin) {
        const at = day + m;
        if (at + stepMin < v.start) continue;
        marks.push({ at, label: formatTime(at, zone), strong: m === 0 });
      }
    }
    return { level, marks, groups };
  }

  if (level === "month") {
    const stride = Math.max(1, Math.ceil(MIN_LABEL_PX / (pxPerMin * 30 * DAY)));
    let i = 0;
    for (let m = startOfMonth(v.start, zone); m < end; m = addMonths(m, 1, zone), i++) {
      const jan = formatDay(m, zone, { month: "numeric" }) === "1";
      marks.push({ at: m, label: i % stride === 0 ? formatDay(m, zone, { month: "short" }) : "", strong: jan });
      if (jan || i === 0) groups.push({ at: m, label: formatDay(m, zone, { year: "numeric" }) });
    }
    return { level, marks, groups };
  }

  const pxPerDay = pxPerMin * DAY;
  const everyDay = pxPerDay >= MIN_LABEL_PX;
  const mondays = !everyDay && pxPerDay * 7 >= MIN_LABEL_PX;
  for (let d = startOfDay(v.start, zone); d < end; d = addDays(d, 1, zone)) {
    const monday = weekdayOf(d, zone) === 1;
    const first = dayOfMonth(d, zone) === 1;
    let label = "";
    if (everyDay) label = formatDay(d, zone, { weekday: "short", day: "numeric" });
    else if (mondays ? monday : first) label = formatDay(d, zone, { day: "numeric", month: "short" });
    marks.push({ at: d, label, strong: monday || first });
  }
  for (let m = startOfMonth(v.start, zone); m < end; m = addMonths(m, 1, zone)) {
    groups.push({ at: m, label: formatDay(m, zone, { month: "long", year: "numeric" }) });
  }
  return { level, marks, groups };
}
