"use client";

import { useMemo, useState } from "react";
import { findConflicts, type Conflict } from "@/lib/timeline/conflicts";
import { describeRepeat, formatDuration } from "@/lib/timeline/describe";
import { refUrl } from "@/lib/timeline/github";
import { toIcs } from "@/lib/timeline/ics";
import { byPerson } from "@/lib/timeline/people";
import { formatDateTime, formatDay, formatTime, nowMinutes, startOfDay, startOfWeek, zoneLabel, type Zone } from "@/lib/timeline/time";
import { DAY, TEAM_COLORS, type Occurrence, type Timeline } from "@/lib/timeline/types";
import { detailLevel, zoomToRange, type View } from "@/lib/timeline/view";
import Avatar from "./Avatar";
import Swimlane, { type EditApi } from "./Swimlane";

export type BoardProps = {
  timeline: Timeline;
  zone: Zone;
  onZoneChange: (z: Zone) => void;
  onSelect?: (window: number) => void;
  edit?: EditApi;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
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
const KIND_LABEL: Record<Conflict["kind"], string> = { freeze: "Inside a freeze", service: "Same service", person: "Double-booked", overlap: "Overlap" };

function downloadIcs(t: Timeline) {
  const blob = new Blob([toIcs(t, location.href)], { type: "text/calendar" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "window-timeline.ics" });
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function TimelineBoard({ timeline: teamTimeline, zone, onZoneChange, onSelect, edit, leading, trailing }: BoardProps) {
  const [view, setView] = useState(() => initialView(teamTimeline, zone));
  const [panel, setPanel] = useState(false);
  const [lens, setLens] = useState<"team" | "person">("team");
  const [picked, setPicked] = useState<Occurrence | null>(null);

  const hasPeople = !!teamTimeline.people?.length;
  const personView = lens === "person" && hasPeople;
  // In the person lens, lanes are people and Windows are copies; `source` maps back to the real Window.
  const { timeline, source } = useMemo(
    () => (personView ? byPerson(teamTimeline) : { timeline: teamTimeline, source: null }),
    [personView, teamTimeline],
  );
  const real = (w: number) => (source ? source[w] : w);

  const end = view.start + view.span;
  // Conflicts across the real Timeline near the view, so the list is useful when zoomed in too.
  const conflicts = useMemo(
    () => findConflicts(teamTimeline, { start: view.start - view.span, end: end + view.span }),
    [teamTimeline, view.start, view.span, end],
  );
  const errors = conflicts.filter((c) => c.severity === "error");
  const flagged = useMemo(() => new Set(errors.flatMap((c) => [c.a, c.b].filter(Boolean).map((o) => `${o!.window}:${o!.start}`))), [errors]);

  const bands = (teamTimeline.freezes ?? []).map((f) => ({ start: f.start, end: f.start + f.duration, label: f.label || "Freeze" }));

  const range =
    detailLevel(view.span) === "hour"
      ? `${formatDateTime(view.start, zone)} – ${formatDateTime(end, zone)}`
      : `${formatDay(view.start, zone)} – ${formatDay(end - 1, zone)}`;

  const decorate = (o: Occurrence, w: number) => {
    const win = teamTimeline.windows[real(o.window)];
    const people = (win.assignees ?? []).map((a) => teamTimeline.people![a]).filter(Boolean);
    return (
      <>
        {flagged.has(`${real(o.window)}:${o.start}`) && (
          <span className="pointer-events-none absolute -right-1 -top-1 size-3 rounded-full border-2 border-text bg-red-600" aria-hidden />
        )}
        {!personView && w >= 64 && people.length > 0 && (
          <span className="pointer-events-none absolute right-1 top-1/2 flex -translate-y-1/2 -space-x-1.5">
            {people.slice(0, 3).map((p) => <Avatar key={p.gh} gh={p.gh} size={18} />)}
          </span>
        )}
        {w >= 150 && win.ref && (
          <span className="pointer-events-none absolute bottom-0.5 right-1 rounded-sm bg-zinc-900 px-1 font-mono text-[9px] leading-3 text-white" style={{ right: !personView && people.length ? 12 + Math.min(people.length, 3) * 12 : 4 }}>
            #{win.ref.num}
          </span>
        )}
      </>
    );
  };

  const pickedReal = picked && teamTimeline.windows[real(picked.window)] ? { ...picked, window: real(picked.window), team: teamTimeline.windows[real(picked.window)].team } : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="relative flex flex-wrap items-center gap-2">
        {leading}
        <button className={btn} onClick={() => setView(initialView({ teams: [], windows: [] }, zone))}>Today</button>
        <h2 className="font-heading text-base font-black sm:text-lg">{range}</h2>
        <span className="hidden text-xs text-text-secondary 2xl:inline">Scroll to pan · Ctrl/⌘ + scroll or pinch to zoom</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {trailing}
          {hasPeople && (
            <div className="flex overflow-hidden rounded-sm border-2 border-text text-xs font-bold uppercase tracking-widest" role="group" aria-label="Lanes">
              {(["team", "person"] as const).map((l) => (
                <button key={l} className={`px-2 py-1 ${lens === l ? "bg-text text-bg" : "bg-surface hover:bg-secondary-gray"}`} aria-pressed={lens === l} onClick={() => { setLens(l); setPicked(null); }}>
                  By {l}
                </button>
              ))}
            </div>
          )}
          <button
            className={`${btn} ${errors.length ? "border-red-600 bg-red-50 text-red-700" : conflicts.length ? "text-amber-700" : ""}`}
            aria-expanded={panel}
            onClick={() => { setPanel((v) => !v); setPicked(null); }}
          >
            {errors.length ? `${errors.length} conflict${errors.length === 1 ? "" : "s"}` : `${conflicts.length} overlap${conflicts.length === 1 ? "" : "s"}`}
          </button>
          <button className={btn} onClick={() => downloadIcs(teamTimeline)} disabled={!teamTimeline.windows.length} title="Download every Window as a calendar file">
            .ics
          </button>
          <button
            className="max-w-[10rem] truncate rounded-sm border-2 border-text bg-surface px-2 py-1 font-mono text-xs sm:max-w-none"
            onClick={() => onZoneChange(zone === "local" ? "utc" : "local")}
            title="Toggle between your local time zone and UTC"
          >
            {zoneLabel(zone)}
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <Swimlane
            timeline={timeline}
            view={view}
            onViewChange={setView}
            zone={zone}
            onPick={(o) => { setPicked(o); setPanel(false); }}
            selected={picked}
            edit={personView ? undefined : edit}
            bands={bands}
            decorate={decorate}
          />
        </div>
        {pickedReal ? (
          <DetailPane
            occ={pickedReal}
            timeline={teamTimeline}
            zone={zone}
            conflicts={conflicts.filter((c) => [c.a, c.b].some((x) => x && x.window === pickedReal.window && x.start === pickedReal.start))}
            onClose={() => setPicked(null)}
            onEdit={onSelect ? () => onSelect(pickedReal.window) : undefined}
          />
        ) : (
          panel && (
            <ConflictsPanel
              conflicts={conflicts}
              timeline={teamTimeline}
              zone={zone}
              onJump={(c) => setView(zoomToRange(c.start, c.end))}
              onClose={() => setPanel(false)}
            />
          )
        )}
      </div>
    </div>
  );
}

const paneCls =
  "z-30 flex w-80 shrink-0 flex-col gap-3 overflow-y-auto rounded-md border-2 border-text bg-surface p-4 text-sm max-lg:absolute max-lg:inset-x-0 max-lg:bottom-0 max-lg:max-h-[60%] max-lg:w-auto max-lg:shadow-[0_-4px_0_var(--color-primary-black)]";

function describeConflict(c: Conflict, t: Timeline) {
  const name = (o: Occurrence) => t.windows[o.window].label || t.teams[o.team].name;
  if (c.kind === "freeze") return { title: `${name(c.a)} runs in “${t.freezes![c.freeze!].label || "Freeze"}”`, sub: t.teams[c.a.team].name };
  if (c.kind === "person") return { title: `@${t.people![c.person!].gh} is double-booked`, sub: `${name(c.a)} + ${name(c.b!)}` };
  const teams = `${t.teams[c.a.team].name} × ${t.teams[c.b!.team].name}`;
  if (c.kind === "service") return { title: `${teams} on ${t.services![t.windows[c.a.window].service!]}`, sub: `${name(c.a)} / ${name(c.b!)}` };
  return { title: teams, sub: `${name(c.a)} / ${name(c.b!)}` };
}

function ConflictsPanel({ conflicts, timeline, zone, onJump, onClose }: { conflicts: Conflict[]; timeline: Timeline; zone: Zone; onJump: (c: Conflict) => void; onClose: () => void }) {
  const errors = conflicts.filter((c) => c.severity === "error").length;
  return (
    <aside className={paneCls} aria-label="Conflicts">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-xl font-black leading-tight">Conflicts</h3>
          <p className="text-xs text-text-secondary">
            <b className="text-red-700">{errors} error{errors === 1 ? "" : "s"}</b> (freeze, same service, double-booked) · {conflicts.length - errors} warning{conflicts.length - errors === 1 ? "" : "s"} (time overlap only)
          </p>
        </div>
        <button onClick={onClose} aria-label="Close conflicts" className="px-2 text-xl leading-none">×</button>
      </div>
      {conflicts.length === 0 && <p className="text-text-secondary">Nothing clashes near this view.</p>}
      <ul className="space-y-1">
        {conflicts.slice(0, 80).map((c, i) => {
          const d = describeConflict(c, timeline);
          return (
            <li key={i}>
              <button onClick={() => onJump(c)} className={`w-full rounded-sm border-l-4 px-2 py-1 text-left hover:bg-secondary-gray ${c.severity === "error" ? "border-red-600 bg-red-500/10" : "border-amber-500"}`}>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">{KIND_LABEL[c.kind]}</span>
                <b className="block">{d.title}</b>
                <span className="block text-xs text-text-secondary">{d.sub} · {formatDateTime(c.start, zone)}</span>
              </button>
            </li>
          );
        })}
        {conflicts.length > 80 && <li className="px-2 py-1 text-xs text-text-secondary">…and {conflicts.length - 80} more nearby</li>}
      </ul>
    </aside>
  );
}

function DetailPane({ occ, timeline, zone, conflicts, onClose, onEdit }: {
  occ: Occurrence; timeline: Timeline; zone: Zone; conflicts: Conflict[]; onClose: () => void; onEdit?: () => void;
}) {
  const w = timeline.windows[occ.window];
  const team = timeline.teams[occ.team];
  const sameDay = startOfDay(occ.start, zone) === startOfDay(occ.end - 1, zone);
  const people = (w.assignees ?? []).map((a) => timeline.people?.[a]).filter((p) => !!p);
  const repo = w.ref ? timeline.repos?.[w.ref.repo] : undefined;
  const service = w.service !== undefined ? timeline.services?.[w.service] : undefined;
  const dt = "text-xs font-bold uppercase tracking-wider text-text-secondary";
  return (
    <aside className={paneCls} aria-label="Window details">
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
        <div><dt className={dt}>When</dt>
          <dd>{sameDay ? `${formatDay(occ.start, zone)}, ${formatTime(occ.start, zone)} – ${formatTime(occ.end, zone)}` : `${formatDateTime(occ.start, zone)} → ${formatDateTime(occ.end, zone)}`}</dd></div>
        <div><dt className={dt}>Duration</dt><dd>{formatDuration(w.duration)}</dd></div>
        <div><dt className={dt}>Repeat</dt><dd>{describeRepeat(w.repeat)}</dd></div>
        {people.length > 0 && (
          <div><dt className={dt}>Assignees</dt>
            <dd><ul className="mt-1 space-y-1">{people.map((p) => (
              <li key={p.gh} className="flex items-center gap-2"><Avatar gh={p.gh} size={22} /><a className="font-bold underline decoration-dotted underline-offset-2" href={`https://github.com/${p.gh}`} target="_blank" rel="noreferrer">@{p.gh}</a></li>
            ))}</ul></dd></div>
        )}
        {(repo || service) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {repo && w.ref && (
              <a href={refUrl(repo, w.ref.num)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-sm border-2 border-text bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white hover:bg-zinc-700">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.88.87 2.34.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>
                {repo}#{w.ref.num}
              </a>
            )}
            {service && <span className="rounded-sm border-2 border-text/40 px-1.5 py-0.5 font-mono text-[11px]">{service}</span>}
          </div>
        )}
      </dl>
      <div>
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-red-700">Conflicts ({conflicts.length})</h4>
        {conflicts.length === 0 ? <p className="text-text-secondary">Nothing clashes with this window.</p> : (
          <ul className="space-y-1">
            {conflicts.map((c, i) => {
              const d = describeConflict(c, timeline);
              return (
                <li key={i} className={`rounded-sm border-l-4 px-2 py-1 ${c.severity === "error" ? "border-red-600 bg-red-500/10" : "border-amber-500 bg-amber-500/10"}`}>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">{KIND_LABEL[c.kind]}</span>
                  <b>{d.title}</b>
                  <span className="block text-xs text-text-secondary">{formatTime(c.start, zone)} – {formatTime(c.end, zone)}</span>
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
