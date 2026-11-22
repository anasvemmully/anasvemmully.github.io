"use client";

import { useMemo, useState } from "react";
import { occurrences } from "@/lib/timeline/occurrences";
import { findOverlaps } from "@/lib/timeline/overlaps";
import { addDays, addMonths, formatDay, formatDateTime, formatMonth, nowMinutes, startOfDay, startOfMonth, startOfWeek, zoneLabel, type Zone } from "@/lib/timeline/time";
import type { Timeline } from "@/lib/timeline/types";
import Swimlane from "./Swimlane";

type Zoom = "day" | "week" | "month";

export type BoardProps = {
  timeline: Timeline;
  zone: Zone;
  onZoneChange: (z: Zone) => void;
  onSelect?: (window: number) => void;
};

/** Open on today, or on the last Window's week if every Window is already in the past. */
function initialAnchor(t: Timeline, zone: Zone): number {
  const now = nowMinutes();
  let last = -Infinity;
  for (const w of t.windows) {
    const r = w.repeat;
    const end = r.kind === "none" ? w.start + w.duration : r.until ?? Infinity;
    last = Math.max(last, end);
  }
  return startOfDay(last < now && last > -Infinity ? last - 1 : now, zone);
}

const btn = (active: boolean) =>
  `border-2 border-text px-3 py-1 text-xs font-bold uppercase tracking-widest ${active ? "bg-accent shadow-[2px_2px_0_var(--color-primary-black)]" : "bg-surface hover:bg-secondary-gray"}`;

export default function TimelineBoard({ timeline, zone, onZoneChange, onSelect }: BoardProps) {
  const [zoom, setZoom] = useState<Zoom>("week");
  const [anchor, setAnchor] = useState(() => initialAnchor(timeline, zone));

  const { start, end } = useMemo(() => {
    if (zoom === "day") return { start: anchor, end: addDays(anchor, 1, zone) };
    if (zoom === "week") {
      const s = startOfWeek(anchor, zone);
      return { start: s, end: addDays(s, 7, zone) };
    }
    const s = startOfMonth(anchor, zone);
    return { start: s, end: addMonths(s, 1, zone) };
  }, [zoom, anchor, zone]);

  const step = (dir: 1 | -1) => {
    if (zoom === "month") setAnchor(addMonths(anchor, dir, zone));
    else setAnchor(addDays(anchor, dir * (zoom === "week" ? 7 : 1), zone));
  };

  const overlaps = useMemo(() => findOverlaps(occurrences(timeline, { start, end })), [timeline, start, end]);
  const title = zoom === "month" ? formatMonth(start, zone) : zoom === "day" ? formatDay(start, zone, { weekday: "long", day: "numeric", month: "long" }) : `${formatDay(start, zone)} – ${formatDay(end - 1, zone)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1" role="group" aria-label="Zoom">
          {(["day", "week", "month"] as const).map((z) => (
            <button key={z} className={btn(zoom === z)} onClick={() => setZoom(z)}>{z}</button>
          ))}
        </div>
        <div className="flex gap-1">
          <button className={btn(false)} onClick={() => step(-1)} aria-label="Previous">←</button>
          <button className={btn(false)} onClick={() => setAnchor(startOfDay(nowMinutes(), zone))}>Today</button>
          <button className={btn(false)} onClick={() => step(1)} aria-label="Next">→</button>
        </div>
        <h2 className="font-heading text-lg font-black">{title}</h2>
        <button
          className="ml-auto border-2 border-text bg-surface px-2 py-1 text-xs font-mono"
          onClick={() => onZoneChange(zone === "local" ? "utc" : "local")}
          title="Toggle between your local time zone and UTC"
        >
          Times in {zoneLabel(zone)} · {zone === "local" ? "show UTC" : "show local"}
        </button>
      </div>

      <Swimlane timeline={timeline} start={start} end={end} zoom={zoom} zone={zone} onSelect={onSelect} />

      {overlaps.length > 0 && (
        <section className="border-2 border-text bg-surface p-3">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-red-600">Overlaps in view ({overlaps.length})</h3>
          <ul className="space-y-1 text-sm">
            {overlaps.slice(0, 20).map((o, i) => (
              <li key={i}>
                <b>{timeline.teams[o.a.team].name}</b> × <b>{timeline.teams[o.b.team].name}</b>: {formatDateTime(o.start, zone)} → {formatDateTime(o.end, zone)}
              </li>
            ))}
            {overlaps.length > 20 && <li className="text-text-secondary">…and {overlaps.length - 20} more</li>}
          </ul>
        </section>
      )}
    </div>
  );
}
