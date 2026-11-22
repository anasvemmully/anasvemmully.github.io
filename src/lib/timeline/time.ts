import { DAY, SLOT } from "./types";

/** "local" shows the viewer's own time zone; "utc" shows UTC. Stored data is always UTC. */
export type Zone = "local" | "utc";

const tz = (z: Zone) => (z === "utc" ? "UTC" : undefined);
const ms = (min: number) => min * 60000;

export function startOfDay(min: number, z: Zone): number {
  if (z === "utc") return Math.floor(min / DAY) * DAY;
  const d = new Date(ms(min));
  d.setHours(0, 0, 0, 0);
  return d.getTime() / 60000;
}

export function addDays(min: number, n: number, z: Zone): number {
  if (z === "utc") return min + n * DAY;
  const d = new Date(ms(min));
  d.setDate(d.getDate() + n);
  return Math.round(d.getTime() / 60000);
}

/** 0 = Sunday, in the given zone. */
export function weekdayOf(min: number, z: Zone): number {
  if (z === "utc") return (((Math.floor(min / DAY) + 4) % 7) + 7) % 7;
  return new Date(ms(min)).getDay();
}

export function startOfWeek(min: number, z: Zone): number {
  const day = startOfDay(min, z);
  return addDays(day, -((weekdayOf(day, z) + 6) % 7), z); // weeks start Monday
}

export function startOfMonth(min: number, z: Zone): number {
  const day = startOfDay(min, z);
  return addDays(day, -(dayOfMonth(day, z) - 1), z);
}

export function dayOfMonth(min: number, z: Zone): number {
  return z === "utc" ? new Date(ms(min)).getUTCDate() : new Date(ms(min)).getDate();
}

export function addMonths(min: number, n: number, z: Zone): number {
  const d = new Date(ms(startOfMonth(min, z)));
  if (z === "utc") d.setUTCMonth(d.getUTCMonth() + n, 1);
  else d.setMonth(d.getMonth() + n, 1);
  return Math.round(d.getTime() / 60000);
}

export const nowMinutes = () => Math.floor(Date.now() / 60000);

export function formatTime(min: number, z: Zone): string {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: tz(z) }).format(ms(min));
}

export function formatDay(min: number, z: Zone, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }): string {
  return new Intl.DateTimeFormat(undefined, { ...opts, timeZone: tz(z) }).format(ms(min));
}

export function formatDateTime(min: number, z: Zone): string {
  return `${formatDay(min, z)} ${formatTime(min, z)}`;
}

export function formatMonth(min: number, z: Zone): string {
  return formatDay(min, z, { month: "long", year: "numeric" });
}

export function zoneLabel(z: Zone): string {
  if (z === "utc") return "UTC";
  const name = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const off = -new Date().getTimezoneOffset();
  const sign = off < 0 ? "-" : "+";
  const abs = Math.abs(off);
  const hh = Math.floor(abs / 60);
  const mm = abs % 60;
  return `${name} (UTC${sign}${hh}${mm ? ":" + String(mm).padStart(2, "0") : ""})`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Value for <input type="datetime-local"> in the given zone. */
export function toInputValue(min: number, z: Zone): string {
  const d = new Date(ms(min));
  if (z === "utc") return d.toISOString().slice(0, 16);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parses a datetime-local value in the given zone to epoch minutes, snapped to 15 minutes. */
export function fromInputValue(value: string, z: Zone): number | null {
  const t = z === "utc" ? Date.parse(value + ":00Z") : new Date(value).getTime();
  if (Number.isNaN(t)) return null;
  return Math.round(t / 60000 / SLOT) * SLOT;
}
