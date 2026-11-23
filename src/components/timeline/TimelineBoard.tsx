"use client";

import { useMemo, useState } from "react";
import { occurrences } from "@/lib/timeline/occurrences";
import { findOverlaps } from "@/lib/timeline/overlaps";
import { formatDateTime, formatDay, nowMinutes, startOfWeek, zoneLabel, type Zone } from "@/lib/timeline/time";
import { DAY, type Timeline } from "@/lib/timeline/types";
import { detailLevel, zoomToRange, type View } from "@/lib/timeline/view";
import Swimlane from "./Swimlane";

export type BoardProps = {
  timeline: Timeline;
  zone: Zone;
  onZoneChange: (z: Zone) => void;
  onSelect?: (window: number) => void;
};

/** About a week, from the start of this week; or the last Window's week if everything is already past. */
function initialView(t: Timeline, zone: Zone): View {
  const now = nowMinutes();
  let last = -Infinity;
  for (const w of t.windows) {
    const r = w.repeat;
    last = Math.max(last, r.kind === "none" ? w.start + w.duration : r.until ?? Infinity);
  }
  return { start: startOfWeek(last < now && last > -Infinity ? last - 1 : now, zone), span: 7 * DAY };
}

const btn = "rounded-sm border-2 border-text bg-surface px-3 py-1 text-xs font-bold uppercase tracking-widest hover:bg-secondary-gray";

export default function TimelineBoard({ timeline, zone, onZoneChange, onSelect }: BoardProps) {
  const [view, setView] = useState(() => initialView(timeline, zone));
  const [showOverlaps, setShowOverlaps] = useState(false);

  const end = view.start + view.span;
  // Overlaps across the whole Timeline near the view, so the list is useful when zoomed in too.
  const overlaps = useMemo(
    () => findOverlaps(occurrences(timeline, { start: view.start - view.span, end: end + view.span })),
    [timeline, view.start, view.span, end],
  );

  const range =
    detailLevel(view.span) === "hour"
      ? `${formatDateTime(view.start, zone)} – ${formatDateTime(end, zone)}`
      : `${formatDay(view.start, zone)} – ${formatDay(end - 1, zone)}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="relative flex flex-wrap items-center gap-2">
        <button className={btn} onClick={() => setView(initialView({ teams: [], windows: [] }, zone))}>Today</button>
        <h2 className="font-heading text-base font-black sm:text-lg">{range}</h2>
        <span className="hidden text-xs text-text-secondary lg:inline">Scroll to pan · Ctrl/⌘ + scroll or pinch to zoom</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            className={`${btn} ${overlaps.length ? "border-red-600 text-red-700" : "opacity-50"}`}
            disabled={!overlaps.length}
            aria-expanded={showOverlaps}
            onClick={() => setShowOverlaps((v) => !v)}
          >
            {overlaps.length} overlap{overlaps.length === 1 ? "" : "s"}
          </button>
          <button
            className="max-w-[10rem] truncate rounded-sm border-2 border-text bg-surface px-2 py-1 font-mono text-xs sm:max-w-none"
            onClick={() => onZoneChange(zone === "local" ? "utc" : "local")}
            title="Toggle between your local time zone and UTC"
          >
            {zoneLabel(zone)}
          </button>
        </div>
        {showOverlaps && overlaps.length > 0 && (
          <ul className="absolute right-0 top-full z-40 mt-1 max-h-72 w-full max-w-md space-y-px overflow-y-auto rounded-md border-2 border-text bg-surface p-1 text-sm shadow-[4px_4px_0_var(--color-primary-black)]">
            {overlaps.slice(0, 60).map((o, i) => (
              <li key={i}>
                <button
                  className="w-full rounded-sm px-2 py-1 text-left hover:bg-secondary-gray"
                  onClick={() => { setView(zoomToRange(o.start, o.end)); setShowOverlaps(false); }}
                >
                  <b>{timeline.teams[o.a.team].name}</b> × <b>{timeline.teams[o.b.team].name}</b>
                  <span className="block text-xs text-text-secondary">{formatDateTime(o.start, zone)} → {formatDateTime(o.end, zone)}</span>
                </button>
              </li>
            ))}
            {overlaps.length > 60 && <li className="px-2 py-1 text-xs text-text-secondary">…and {overlaps.length - 60} more nearby</li>}
          </ul>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <Swimlane timeline={timeline} view={view} onViewChange={setView} zone={zone} onSelect={onSelect} />
      </div>
    </div>
  );
}
