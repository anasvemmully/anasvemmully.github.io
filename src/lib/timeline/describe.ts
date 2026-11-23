import type { Repeat } from "./types";

const NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatDuration(min: number): string {
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  return [d && `${d} d`, h && `${h} h`, m && `${m} min`].filter(Boolean).join(" ") || "0 min";
}

/** Weekdays are defined in UTC, so the summary says so. */
export function describeRepeat(r: Repeat): string {
  if (r.kind === "none") return "One-off";
  if (r.kind === "daily") return "Daily";
  const days = NAMES.filter((_, i) => r.days & (1 << i));
  // list Monday first, like the week header
  days.push(...days.splice(0, days[0] === "Sun" ? 1 : 0));
  return `Weekly on ${days.join(", ")} (UTC)`;
}
