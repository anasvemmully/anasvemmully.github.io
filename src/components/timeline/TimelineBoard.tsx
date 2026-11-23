"use client";

import { useMemo, useState } from "react";
import { occurrences } from "@/lib/timeline/occurrences";
import { findOverlaps } from "@/lib/timeline/overlaps";
import { formatDateTime, formatDay, nowMinutes, startOfWeek, zoneLabel, type Zone } from "@/lib/timeline/time";
import { DAY, type Timeline } from "@/lib/timeline/types";
import { detailLevel, zoomToRange, type View } from "@/lib/timeline/view";
import { describeRepeat, formatDuration } from "@/lib/timeline/describe";
import { formatTime, startOfDay } from "@/lib/timeline/time";
import { TEAM_COLORS, type Occurrence } from "@/lib/timeline/types";
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
  const [picked, setPicked] = useState<Occurrence | null>(null);

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

      <div className="relative flex min-h-0 flex-1 gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <Swimlane timeline={timeline} view={view} onViewChange={setView} zone={zone} onPick={setPicked} selected={picked} />
        </div>
        {picked && timeline.windows[picked.window] && (
          <DetailPane
            occ={picked}
            timeline={timeline}
            zone={zone}
            overlaps={overlaps.filter((o) => o.a === picked || o.b === picked || [o.a, o.b].some((x) => x.window === picked.window && x.start === picked.start))}
            onClose={() => setPicked(null)}
            onEdit={onSelect ? () => onSelect(picked.window) : undefined}
          />
        )}
      </div>
    </div>
  );
}

function DetailPane({ occ, timeline, zone, overlaps, onClose, onEdit }: {
  occ: Occurrence; timeline: Timeline; zone: Zone; overlaps: ReturnType<typeof findOverlaps>; onClose: () => void; onEdit?: () => void;
}) {
  const w = timeline.windows[occ.window];
  const team = timeline.teams[occ.team];
  const sameDay = startOfDay(occ.start, zone) === startOfDay(occ.end - 1, zone);
  return (
    <aside className="z-30 flex w-80 shrink-0 flex-col gap-3 overflow-y-auto rounded-md border-2 border-text bg-surface p-4 text-sm max-lg:absolute max-lg:inset-x-0 max-lg:bottom-0 max-lg:max-h-[60%] max-lg:w-auto max-lg:shadow-[0_-4px_0_var(--color-primary-black)]" aria-label="Window details">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
            <span className="size-3 rounded-sm border border-text" style={{ background: TEAM_COLORS[team.color] }} />
            {team.name}
          </div>
          <h3 className="mt-1 break-words font-heading text-xl font-black leading-tight">{w.label || "(no label)"}</h3>
        </div>
        <button onClick={onClose} aria-label="Close details" className="px-2 text-xl leading-none">×</button>
      </div>
      <dl className="space-y-2">
        <div><dt className="text-xs font-bold uppercase tracking-wider text-text-secondary">When</dt>
          <dd>{sameDay ? `${formatDay(occ.start, zone)}, ${formatTime(occ.start, zone)} – ${formatTime(occ.end, zone)}` : `${formatDateTime(occ.start, zone)} → ${formatDateTime(occ.end, zone)}`}</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wider text-text-secondary">Duration</dt><dd>{formatDuration(w.duration)}</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wider text-text-secondary">Repeat</dt><dd>{describeRepeat(w.repeat)}</dd></div>
      </dl>
      <div>
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-red-700">Overlaps ({overlaps.length})</h4>
        {overlaps.length === 0 ? <p className="text-text-secondary">No other team runs at the same time.</p> : (
          <ul className="space-y-1">
            {overlaps.map((o, i) => {
              const other = o.a.window === occ.window && o.a.start === occ.start ? o.b : o.a;
              return (
                <li key={i} className="rounded-sm bg-red-500/10 px-2 py-1">
                  <b>{timeline.teams[other.team].name}</b>: {timeline.windows[other.window].label || "(no label)"}
                  <span className="block text-xs text-text-secondary">{formatTime(o.start, zone)} – {formatTime(o.end, zone)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {onEdit && <button onClick={onEdit} className="mt-auto rounded-sm border-2 border-text bg-accent px-3 py-1.5 text-xs font-bold uppercase tracking-widest shadow-[2px_2px_0_var(--color-primary-black)]">Edit window</button>}
    </aside>
  );
}
