"use client";

import { useMemo } from "react";
import { occurrences } from "@/lib/timeline/occurrences";
import { findOverlaps } from "@/lib/timeline/overlaps";
import { addDays, dayOfMonth, formatDay, formatTime, startOfMonth, startOfWeek, type Zone } from "@/lib/timeline/time";
import { TEAM_COLORS, type Timeline } from "@/lib/timeline/types";

type Props = { timeline: Timeline; month: number; zone: Zone; onSelect?: (window: number) => void };

export default function MonthCalendar({ timeline, month, zone, onSelect }: Props) {
  const first = startOfMonth(month, zone);
  const gridStart = startOfWeek(first, zone);
  const nextMonth = startOfMonth(addDays(first, 32, zone), zone);

  const days = useMemo(() => {
    const out: { start: number; end: number }[] = [];
    for (let d = gridStart; d < nextMonth || out.length % 7 !== 0; d = addDays(d, 1, zone)) {
      out.push({ start: d, end: addDays(d, 1, zone) });
    }
    return out;
  }, [gridStart, nextMonth, zone]);

  const { occs, overlaps } = useMemo(() => {
    const range = { start: days[0].start, end: days[days.length - 1].end };
    const occs = occurrences(timeline, range);
    return { occs, overlaps: findOverlaps(occs) };
  }, [timeline, days]);

  const cells = days.map((d) => ({
    ...d,
    items: occs.filter((o) => o.start < d.end && o.end > d.start),
    clash: overlaps.some((x) => x.start < d.end && x.end > d.start),
  }));

  const chip = (d: (typeof cells)[number], o: (typeof occs)[number]) => {
    const w = timeline.windows[o.window];
    return (
      <button
        key={`${o.window}-${o.start}`}
        type="button"
        disabled={!onSelect}
        onClick={() => onSelect?.(o.window)}
        className="block w-full truncate border border-text px-1 text-left text-[11px] font-bold text-black disabled:cursor-default"
        style={{ background: TEAM_COLORS[timeline.teams[o.team].color] }}
        title={`${timeline.teams[o.team].name}: ${formatTime(o.start, zone)}–${formatTime(o.end, zone)}`}
      >
        {formatTime(Math.max(o.start, d.start), zone)} {w.label || timeline.teams[o.team].name}
      </button>
    );
  };

  return (
    <>
      {/* desktop: month grid */}
      <div className="hidden border-2 border-text bg-surface md:block" role="region" aria-label="Month calendar">
        <div className="grid grid-cols-7 border-b-2 border-text bg-secondary-gray text-center text-xs font-bold uppercase tracking-widest">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
            <div key={w} className="py-2">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d) => {
            const inMonth = d.start >= first && d.start < nextMonth;
            return (
              <div key={d.start} className={`min-h-28 space-y-1 border-b border-r border-text/20 p-1 ${inMonth ? "" : "bg-secondary-gray text-text-secondary"}`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{dayOfMonth(d.start, zone)}</span>
                  {d.clash && <span className="bg-red-500 px-1 text-[10px] text-white" title="Teams overlap">overlap</span>}
                </div>
                {d.items.slice(0, 3).map((o) => chip(d, o))}
                {d.items.length > 3 && <div className="text-[11px] text-text-secondary">+{d.items.length - 3} more</div>}
              </div>
            );
          })}
        </div>
      </div>
      {/* phones: a plain day list */}
      <ul className="space-y-2 md:hidden" aria-label="Month agenda">
        {cells.filter((d) => d.items.length && d.start >= first && d.start < nextMonth).map((d) => (
          <li key={d.start} className="border-2 border-text bg-surface p-2">
            <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-widest">
              {formatDay(d.start, zone)}
              {d.clash && <span className="bg-red-500 px-1 text-[10px] text-white">overlap</span>}
            </div>
            <div className="space-y-1">{d.items.map((o) => chip(d, o))}</div>
          </li>
        ))}
        {!cells.some((d) => d.items.length && d.start >= first && d.start < nextMonth) && <li className="text-text-secondary">No windows this month.</li>}
      </ul>
    </>
  );
}
