"use client";

import { useMemo } from "react";
import { occurrences } from "@/lib/timeline/occurrences";
import { findOverlaps } from "@/lib/timeline/overlaps";
import { addDays, formatDay, formatTime, startOfDay, type Zone } from "@/lib/timeline/time";
import { TEAM_COLORS, type Occurrence, type Timeline } from "@/lib/timeline/types";

type Props = {
  timeline: Timeline;
  start: number;
  end: number;
  zoom: "day" | "week" | "month";
  zone: Zone;
  onSelect?: (window: number) => void;
};

const MIN_WIDTH = { day: 960, week: 1400, month: 2400 };

/** Union of spans, so shading doesn't stack. */
function merge(spans: { start: number; end: number }[]) {
  const s = [...spans].sort((a, b) => a.start - b.start);
  const out: { start: number; end: number }[] = [];
  for (const x of s) {
    const last = out[out.length - 1];
    if (last && x.start <= last.end) last.end = Math.max(last.end, x.end);
    else out.push({ ...x });
  }
  return out;
}

/** Greedy sub-lane assignment so a Team's own overlapping bars don't draw on top of each other. */
function stack(occs: Occurrence[]) {
  const ends: number[] = [];
  return occs.map((o) => {
    let lane = ends.findIndex((e) => e <= o.start);
    if (lane === -1) lane = ends.length;
    ends[lane] = o.end;
    return { o, lane };
  });
}

export default function Swimlane({ timeline, start, end, zoom, zone, onSelect }: Props) {
  const span = end - start;
  const pct = (m: number) => ((Math.min(Math.max(m, start), end) - start) / span) * 100;

  const { occs, shades, rows } = useMemo(() => {
    const occs = occurrences(timeline, { start, end });
    const shades = merge(findOverlaps(occs));
    const rows = timeline.teams.map((_, i) => {
      const own = occs.filter((o) => o.team === i);
      const laid = stack(own);
      return { laid, lanes: Math.max(1, ...laid.map((l) => l.lane + 1)) };
    });
    return { occs, shades, rows };
  }, [timeline, start, end]);

  const ticks = useMemo(() => {
    const out: { at: number; label: string }[] = [];
    if (zoom === "day") {
      for (let h = 0; h < 24; h += 2) {
        const at = start + h * 60;
        out.push({ at, label: formatTime(at, zone) });
      }
    } else {
      for (let d = startOfDay(start, zone); d < end; d = addDays(d, 1, zone)) {
        out.push({ at: d, label: formatDay(d, zone, zoom === "week" ? { weekday: "short", day: "numeric" } : { day: "numeric" }) });
      }
    }
    return out;
  }, [zoom, start, end, zone]);

  if (timeline.teams.length === 0) {
    return <p className="p-8 text-text-secondary">No teams yet.</p>;
  }

  return (
    <div className="overflow-x-auto border-2 border-text bg-surface" role="region" aria-label="Swimlane timeline">
      <div style={{ minWidth: MIN_WIDTH[zoom] + 140 }}>
        <div className="flex border-b-2 border-text">
          <div className="sticky left-0 z-20 w-[140px] shrink-0 bg-surface border-r-2 border-text" />
          <div className="relative h-8 flex-1">
            {ticks.map((t) => (
              <span key={t.at} className="absolute top-0 h-full border-l border-text/20 pl-1 text-[11px] font-mono leading-8 text-text-secondary" style={{ left: `${pct(t.at)}%` }}>
                {t.label}
              </span>
            ))}
          </div>
        </div>
        <div className="relative">
          {/* overlap shading across every lane */}
          <div className="pointer-events-none absolute inset-y-0 left-[140px] right-0 z-0">
            {shades.map((s) => (
              <div
                key={s.start}
                className="absolute inset-y-0 bg-red-500/15"
                style={{ left: `${pct(s.start)}%`, width: `${pct(s.end) - pct(s.start)}%`, backgroundImage: "repeating-linear-gradient(45deg, transparent 0 6px, rgba(239,68,68,.25) 6px 8px)" }}
                title="Overlap between teams"
              />
            ))}
          </div>
          {timeline.teams.map((team, i) => (
            <div key={i} className="relative z-10 flex border-b border-text/20 last:border-b-0">
              <div className="sticky left-0 z-20 flex w-[140px] shrink-0 items-center gap-2 border-r-2 border-text bg-surface px-3 text-sm font-bold">
                <span className="size-3 shrink-0 border border-text" style={{ background: TEAM_COLORS[team.color] }} />
                <span className="truncate">{team.name}</span>
              </div>
              <div className="relative flex-1" style={{ height: rows[i].lanes * 34 + 12 }}>
                {ticks.map((t) => (
                  <span key={t.at} className="absolute inset-y-0 border-l border-text/10" style={{ left: `${pct(t.at)}%` }} />
                ))}
                {rows[i].laid.map(({ o, lane }) => {
                  const w = timeline.windows[o.window];
                  const left = pct(o.start);
                  return (
                    <button
                      key={`${o.window}-${o.start}`}
                      type="button"
                      disabled={!onSelect}
                      onClick={() => onSelect?.(o.window)}
                      title={`${w.label || team.name}  ${formatTime(o.start, zone)}–${formatTime(o.end, zone)}`}
                      className="absolute h-7 overflow-hidden border-2 border-text px-1 text-left text-[11px] font-bold leading-6 text-black enabled:hover:brightness-95 disabled:cursor-default"
                      style={{ left: `${left}%`, width: `${Math.max(pct(o.end) - left, 0.4)}%`, top: 6 + lane * 34, background: TEAM_COLORS[team.color] }}
                    >
                      <span className="whitespace-nowrap">{w.label || formatTime(o.start, zone)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {occs.length === 0 && <p className="border-t border-text/20 p-4 text-sm text-text-secondary">No windows in this range.</p>}
      </div>
    </div>
  );
}
