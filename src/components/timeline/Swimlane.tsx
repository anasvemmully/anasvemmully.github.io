"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { describeRepeat, formatDuration } from "@/lib/timeline/describe";
import { occurrences } from "@/lib/timeline/occurrences";
import { findOverlaps } from "@/lib/timeline/overlaps";
import { formatDateTime, formatDay, formatTime, nowMinutes, startOfDay, type Zone } from "@/lib/timeline/time";
import { TEAM_COLORS, type Occurrence, type Timeline } from "@/lib/timeline/types";
import { panBy, ticks, zoomAt, type View } from "@/lib/timeline/view";

type Props = {
  timeline: Timeline;
  view: View;
  onViewChange: (v: View) => void;
  zone: Zone;
  onPick: (occ: Occurrence) => void;
  selected?: Occurrence | null;
};

const LANE = 34;
const MIN_TEXT_PX = 44;

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

type Hover = { occ: Occurrence; rect: DOMRect };

export default function Swimlane({ timeline, view, onViewChange, zone, onPick, selected }: Props) {
  const hasTeams = timeline.teams.length > 0;
  const root = useRef<HTMLDivElement>(null);
  const plot = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<Hover | null>(null);
  const [now, setNow] = useState(() => nowMinutes());

  // Always-current view for the native event handlers below.
  const viewRef = useRef(view);
  const widthRef = useRef(width);
  const changeRef = useRef(onViewChange);
  useEffect(() => {
    viewRef.current = view;
    widthRef.current = width;
    changeRef.current = onViewChange;
  });

  useEffect(() => {
    const el = plot.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [timeline.teams.length]);

  useEffect(() => {
    const t = setInterval(() => setNow(nowMinutes()), 30000);
    return () => clearInterval(t);
  }, []);

  // Wheel, pinch, drag and keys all feed the same pan/zoom functions.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const frac = (clientX: number) => {
      const r = plot.current?.getBoundingClientRect();
      if (!r || r.width === 0) return 0.5;
      return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    };
    const pxToMin = () => viewRef.current.span / Math.max(widthRef.current, 1);

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        changeRef.current(zoomAt(viewRef.current, Math.exp(-e.deltaY * 0.01), frac(e.clientX)));
      } else if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        changeRef.current(panBy(viewRef.current, (e.deltaX || e.deltaY) * pxToMin()));
      }
    };

    const pointers = new Map<number, { x: number; y: number }>();
    let dragging = false;
    let pinchDist = 0;
    const dist = () => {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) pinchDist = dist();
    };
    const onMove = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x;
      if (pointers.size === 2) {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const d = dist();
        const [a, b] = [...pointers.values()];
        if (pinchDist > 0) changeRef.current(zoomAt(viewRef.current, d / pinchDist, frac((a.x + b.x) / 2)));
        pinchDist = d;
        dragging = true;
        return;
      }
      if (!dragging && Math.abs(dx) < 4) return;
      if (!dragging) {
        dragging = true;
        setHover(null);
        try { el.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      changeRef.current(panBy(viewRef.current, -dx * pxToMin()));
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinchDist = 0;
      if (pointers.size === 0) setTimeout(() => (dragging = false), 0);
    };
    // A drag must not also click the bar it ended on.
    const onClick = (e: MouseEvent) => {
      if (dragging) { e.stopPropagation(); e.preventDefault(); }
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea,select")) return;
      const v = viewRef.current;
      if (e.key === "ArrowLeft") changeRef.current(panBy(v, -v.span * 0.1));
      else if (e.key === "ArrowRight") changeRef.current(panBy(v, v.span * 0.1));
      else if (e.key === "+" || e.key === "=") changeRef.current(zoomAt(v, 1.5, 0.5));
      else if (e.key === "-" || e.key === "_") changeRef.current(zoomAt(v, 1 / 1.5, 0.5));
      else return;
      e.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("keydown", onKey);
    };
  }, [hasTeams]);

  const end = view.start + view.span;
  const ppm = width / view.span;
  const x = (m: number) => (m - view.start) * ppm;

  const { occs, shades, rows } = useMemo(() => {
    const occs = occurrences(timeline, { start: view.start, end });
    const shades = merge(findOverlaps(occs));
    const rows = timeline.teams.map((_, i) => {
      const laid = stack(occs.filter((o) => o.team === i));
      return { laid, lanes: Math.max(1, ...laid.map((l) => l.lane + 1)) };
    });
    return { occs, shades, rows };
  }, [timeline, view.start, end]);

  const { marks, groups, level } = useMemo(() => ticks(view, width || 1000, zone), [view, width, zone]);

  if (timeline.teams.length === 0) {
    return <p className="p-8 text-text-secondary">No teams yet.</p>;
  }

  const showNow = now >= view.start && now <= end;
  const cell = "w-[88px] shrink-0 sm:w-[148px]";

  return (
    <div
      ref={root}
      tabIndex={0}
      role="region"
      aria-label="Swimlane timeline. Arrow keys pan, plus and minus zoom."
      className="flex min-h-0 flex-1 select-none flex-col overflow-hidden rounded-md border-2 border-text bg-surface outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{ touchAction: "pan-y" }}
    >
      {/* time axis: pinned to the top */}
      <div className="flex shrink-0 border-b-2 border-text bg-surface">
        <div className={`${cell} border-r-2 border-text`} />
        <div ref={plot} className="relative h-[3.75rem] min-w-0 flex-1 overflow-hidden">
          <div className="relative h-6 border-b border-text/15">
            {groups.map((g, i) => {
              const left = Math.max(x(g.at), 0);
              const next = groups[i + 1] ? x(groups[i + 1].at) : width;
              return (
                <span key={g.at} className="absolute top-0 h-full truncate border-l border-text/30 pl-1.5 text-[11px] font-bold uppercase leading-6 tracking-wider text-text" style={{ left, width: Math.max(next - left, 0) }}>
                  {g.label}
                </span>
              );
            })}
          </div>
          <div className="relative h-8">
            {marks.map((m) => (
              <span key={m.at} className={`absolute bottom-0 border-l pl-1 font-mono text-[11px] leading-8 text-text-secondary ${m.strong ? "top-0 border-text/40" : "top-3 border-text/20"}`} style={{ left: x(m.at) }}>
                {m.label}
              </span>
            ))}
          </div>
          {showNow && (
            <span className="absolute bottom-0 z-10 -translate-x-1/2 rounded-sm bg-red-600 px-1 text-[10px] font-bold leading-4 text-white" style={{ left: x(now) }}>
              now
            </span>
          )}
        </div>
      </div>

      {/* lanes: scroll vertically when there are many teams */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className="relative flex flex-1 flex-col">
          {timeline.teams.map((team, i) => (
            <div key={i} className="flex border-b border-text/15">
              <div className={`${cell} sticky left-0 z-20 flex items-center gap-2 border-r-2 border-text bg-surface px-2 text-sm font-bold sm:px-3`}>
                <span className="size-3 shrink-0 rounded-sm border border-text" style={{ background: TEAM_COLORS[team.color] }} />
                <span className="truncate" title={team.name}>{team.name}</span>
              </div>
              <div className="relative min-w-0 flex-1 overflow-hidden" style={{ height: Math.max(rows[i].lanes * LANE + 14, 56) }}>
                {marks.map((m) => (
                  <span key={m.at} className={`absolute inset-y-0 border-l ${m.strong ? "border-text/20" : "border-text/10"}`} style={{ left: x(m.at) }} />
                ))}
                {rows[i].laid.map(({ o, lane }) => {
                  const w = timeline.windows[o.window];
                  const left = x(o.start);
                  const barW = Math.max((o.end - o.start) * ppm, 3);
                  const text = w.label || formatTime(o.start, zone);
                  const timeText = level === "hour" ? `${formatTime(o.start, zone)}–${formatTime(o.end, zone)}` : "";
                  return (
                    <button
                      key={`${o.window}-${o.start}`}
                      type="button"
                      onClick={() => { setHover(null); onPick(o); }}
                      onMouseEnter={(e) => setHover({ occ: o, rect: e.currentTarget.getBoundingClientRect() })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={(e) => setHover({ occ: o, rect: e.currentTarget.getBoundingClientRect() })}
                      onBlur={() => setHover(null)}
                      aria-label={`${team.name}: ${text}, ${formatDateTime(o.start, zone)} to ${formatTime(o.end, zone)}`}
                      className={`absolute z-10 flex flex-col justify-center overflow-hidden rounded-sm border-2 border-text px-1.5 text-left text-xs font-bold leading-[1.05] text-black shadow-[1px_1px_0_var(--color-primary-black)] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-text ${selected && selected.window === o.window && selected.start === o.start ? "outline outline-[3px] outline-offset-1 outline-red-600" : ""}`}
                      style={{ left, width: barW, top: 7 + lane * LANE, height: LANE - 6, background: TEAM_COLORS[team.color] }}
                    >
                      {barW >= MIN_TEXT_PX && <span className="truncate">{text}</span>}
                      {barW >= 96 && timeText && <span className="truncate text-[10px] font-medium opacity-70">{timeText}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {/* overlap shading + now line across every lane */}
          <div className="pointer-events-none absolute inset-0 z-[5] flex">
            <div className={cell} />
            <div className="relative min-w-0 flex-1 overflow-hidden">
              {shades.map((s) => (
                <div key={s.start} className="absolute inset-y-0 bg-red-500/[0.16]" style={{ left: x(s.start), width: Math.max(x(s.end) - x(s.start), 3) }} />
              ))}
              {showNow && <div className="absolute inset-y-0 w-px bg-red-600" style={{ left: x(now) }} />}
            </div>
          </div>
          <div className="flex min-h-0 flex-1">
            <div className={`${cell} sticky left-0 border-r-2 border-text bg-surface`} />
            <div className="relative min-w-0 flex-1 overflow-hidden">
              {marks.map((m) => (
                <span key={m.at} className={`absolute inset-y-0 border-l ${m.strong ? "border-text/20" : "border-text/10"}`} style={{ left: x(m.at) }} />
              ))}
            </div>
          </div>
        </div>
        {occs.length === 0 && <p className="p-4 text-sm text-text-secondary">No windows in this range — drag or zoom out to find them.</p>}
      </div>

      {hover && <HoverCard hover={hover} timeline={timeline} zone={zone} />}
    </div>
  );
}

function HoverCard({ hover, timeline, zone }: { hover: Hover; timeline: Timeline; zone: Zone }) {
  const { occ, rect } = hover;
  const w = timeline.windows[occ.window];
  const team = timeline.teams[occ.team];
  const sameDay = startOfDay(occ.start, zone) === startOfDay(occ.end - 1, zone);
  const when = sameDay
    ? `${formatDay(occ.start, zone)}, ${formatTime(occ.start, zone)} – ${formatTime(occ.end, zone)}`
    : `${formatDateTime(occ.start, zone)} → ${formatDateTime(occ.end, zone)}`;
  const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const left = Math.min(Math.max(rect.left, 8), vw - 296);
  const below = rect.bottom + 150 < vh;
  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 w-72 rounded-md border-2 border-text bg-surface p-3 text-sm shadow-[4px_4px_0_var(--color-primary-black)]"
      style={{ left, top: below ? rect.bottom + 6 : undefined, bottom: below ? undefined : vh - rect.top + 6 }}
    >
      <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
        <span className="size-3 rounded-sm border border-text" style={{ background: TEAM_COLORS[team.color] }} />
        {team.name}
      </div>
      <div className="mb-1 break-words font-heading text-base font-black leading-tight">{w.label || "(no label)"}</div>
      <div>{when}</div>
      <div className="text-text-secondary">{formatDuration(w.duration)} · {describeRepeat(w.repeat)}</div>
    </div>
  );
}
