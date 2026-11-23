"use client";

import { useState } from "react";
import { parseRef } from "@/lib/timeline/github";
import Avatar from "./Avatar";
import { fromInputValue, toInputValue, type Zone } from "@/lib/timeline/time";
import { DAY, MAX_ASSIGNEES, MAX_LABEL, SLOT, TEAM_COLORS, type Repeat, type Timeline, type Window } from "@/lib/timeline/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const field = "w-full border-2 border-text bg-surface px-2 py-1 text-sm";

export default function WindowForm({ timeline, initial, zone, onSave, onDelete, onCancel }: {
  timeline: Timeline;
  initial: Window;
  zone: Zone;
  onSave: (w: Window, ref: { repo: string; num: number } | null) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [team, setTeam] = useState(initial.team);
  const [label, setLabel] = useState(initial.label);
  const [start, setStart] = useState(toInputValue(initial.start, zone));
  const [duration, setDuration] = useState(initial.duration);
  const [kind, setKind] = useState<Repeat["kind"]>(initial.repeat.kind);
  const [days, setDays] = useState(initial.repeat.kind === "weekly" ? initial.repeat.days : 0);
  const [until, setUntil] = useState(initial.repeat.kind !== "none" && initial.repeat.until !== undefined ? toInputValue(initial.repeat.until, zone) : "");
  const [assignees, setAssignees] = useState<number[]>(initial.assignees ?? []);
  const [service, setService] = useState<number | undefined>(initial.service);
  const [ref, setRef] = useState(initial.ref && timeline.repos?.[initial.ref.repo] ? `${timeline.repos[initial.ref.repo]}#${initial.ref.num}` : "");
  const [error, setError] = useState("");

  const save = () => {
    const s = fromInputValue(start, zone);
    if (s === null) return setError("Pick a start time");
    if (!(duration > 0)) return setError("Duration must be positive");
    const u = until ? fromInputValue(until, zone) : undefined;
    if (until && u === null) return setError("Bad end date");
    if (kind === "weekly" && days === 0) return setError("Choose at least one weekday");
    const untilPart = u != null ? { until: u } : {};
    const repeat: Repeat = kind === "none" ? { kind } : kind === "daily" ? { kind, ...untilPart } : { kind, days, ...untilPart };
    const parsed = ref.trim() ? parseRef(ref) : null;
    if (ref.trim() && !parsed) return setError("GitHub link: use owner/repo#123 or paste the PR/issue URL");
    onSave({
      team, label: label.trim(), start: s, duration: Math.round(duration / SLOT) * SLOT, repeat,
      ...(assignees.length ? { assignees } : {}), ...(service !== undefined ? { service } : {}),
    }, parsed);
  };

  return (
    <form className="space-y-3 border-2 border-text bg-surface p-3" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <label className="block text-xs font-bold uppercase tracking-widest">Team
        <select className={field} value={team} onChange={(e) => setTeam(+e.target.value)}>
          {timeline.teams.map((t, i) => <option key={i} value={i}>{t.name}</option>)}
        </select>
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest">Label (optional)
        <input className={field} value={label} maxLength={MAX_LABEL} onChange={(e) => setLabel(e.target.value)} />
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest">Start ({zone === "utc" ? "UTC" : "local"})
        <input className={field} type="datetime-local" step={SLOT * 60} value={start} onChange={(e) => setStart(e.target.value)} />
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest">Duration (minutes, steps of {SLOT})
        <input className={field} type="number" min={SLOT} step={SLOT} max={DAY * 7} value={duration} onChange={(e) => setDuration(+e.target.value)} />
      </label>
      <label className="block text-xs font-bold uppercase tracking-widest">Repeat
        <select className={field} value={kind} onChange={(e) => setKind(e.target.value as Repeat["kind"])}>
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>
      {kind === "weekly" && (
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-widest">On these UTC weekdays</legend>
          <div className="mt-1 flex flex-wrap gap-1">
            {WEEKDAYS.map((d, i) => (
              <label key={d} className={`cursor-pointer border-2 border-text px-2 py-1 text-xs font-bold ${days & (1 << i) ? "bg-accent" : "bg-surface"}`}>
                <input type="checkbox" className="sr-only" checked={!!(days & (1 << i))} onChange={() => setDays(days ^ (1 << i))} />
                {d}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {kind !== "none" && (
        <label className="block text-xs font-bold uppercase tracking-widest">Stop repeating at (optional)
          <input className={field} type="datetime-local" step={SLOT * 60} value={until} onChange={(e) => setUntil(e.target.value)} />
        </label>
      )}
      {!!timeline.people?.length && (
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-widest">Assignees (up to {MAX_ASSIGNEES})</legend>
          <div className="mt-1 flex flex-wrap gap-1">
            {timeline.people.map((p, i) => {
              const on = assignees.includes(i);
              return (
                <label key={p.gh} className={`flex cursor-pointer items-center gap-1 rounded-full border-2 border-text py-0.5 pl-0.5 pr-2 text-xs font-bold ${on ? "bg-accent" : "bg-surface"}`}>
                  <input type="checkbox" className="sr-only" checked={on} disabled={!on && assignees.length >= MAX_ASSIGNEES} onChange={() => setAssignees(on ? assignees.filter((a) => a !== i) : [...assignees, i])} />
                  <Avatar gh={p.gh} size={18} />@{p.gh}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      {!!timeline.services?.length && (
        <label className="block text-xs font-bold uppercase tracking-widest">Service
          <select className={field} value={service ?? ""} onChange={(e) => setService(e.target.value === "" ? undefined : +e.target.value)}>
            <option value="">None</option>
            {timeline.services.map((s, i) => <option key={s} value={i}>{s}</option>)}
          </select>
        </label>
      )}
      <label className="block text-xs font-bold uppercase tracking-widest">GitHub PR / issue (optional)
        <input className={`${field} font-mono`} placeholder="owner/repo#123 or URL" value={ref} onChange={(e) => setRef(e.target.value)} />
      </label>
      {error && <p className="text-sm font-bold text-red-600" role="alert">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="border-2 border-text bg-accent px-3 py-1 text-xs font-bold uppercase tracking-widest">Save</button>
        <button type="button" onClick={onCancel} className="border-2 border-text px-3 py-1 text-xs font-bold uppercase tracking-widest">Cancel</button>
        {onDelete && <button type="button" onClick={onDelete} className="ml-auto border-2 border-text bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">Delete</button>}
      </div>
      <p className="text-[11px] text-text-secondary">Stored in UTC; swatch: <span className="inline-block size-2 border border-text align-middle" style={{ background: TEAM_COLORS[timeline.teams[team]?.color ?? 0] }} /></p>
    </form>
  );
}
