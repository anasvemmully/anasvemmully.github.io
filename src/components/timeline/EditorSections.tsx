"use client";

import { useState } from "react";
import { isHandle } from "@/lib/timeline/github";
import { formatDateTime, fromInputValue, toInputValue, nowMinutes, type Zone } from "@/lib/timeline/time";
import { MAX_FREEZES, MAX_LABEL, MAX_PEOPLE, MAX_SERVICE, MAX_SERVICES, SLOT, type Timeline } from "@/lib/timeline/types";
import Avatar from "./Avatar";

export const field = "w-full border-2 border-text bg-surface px-2 py-1 text-sm";
export const btn = "border-2 border-text px-3 py-1 text-xs font-bold uppercase tracking-widest";
const h2 = "mb-2 text-xs font-bold uppercase tracking-widest";

type Update = (f: (t: Timeline) => Timeline) => void;

export function PeopleSection({ timeline, update, remove }: { timeline: Timeline; update: Update; remove: (i: number) => void }) {
  const [gh, setGh] = useState("");
  const [err, setErr] = useState("");
  const people = timeline.people ?? [];
  const add = () => {
    const h = gh.trim().replace(/^@/, "");
    if (!isHandle(h)) return setErr("Use a GitHub handle, like octocat");
    if (people.some((p) => p.gh.toLowerCase() === h.toLowerCase())) return setErr("Already added");
    update((t) => ({ ...t, people: [...(t.people ?? []), { gh: h }] }));
    setGh("");
    setErr("");
  };
  return (
    <section>
      <h2 className={h2}>People ({people.length}/{MAX_PEOPLE})</h2>
      <ul className="mb-2 flex flex-wrap gap-1">
        {people.map((p, i) => (
          <li key={p.gh} className="flex items-center gap-1 rounded-full border-2 border-text bg-surface py-0.5 pl-0.5 pr-1 text-sm">
            <Avatar gh={p.gh} size={20} />@{p.gh}
            <button className="px-1" onClick={() => remove(i)} aria-label={`Remove @${p.gh}`}>×</button>
          </li>
        ))}
      </ul>
      <form className="flex gap-1" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <input className={field} placeholder="GitHub handle" value={gh} onChange={(e) => setGh(e.target.value)} disabled={people.length >= MAX_PEOPLE} aria-label="GitHub handle" />
        <button className={`${btn} bg-surface`} type="submit">Add</button>
      </form>
      {err && <p className="mt-1 text-xs font-bold text-red-600" role="alert">{err}</p>}
      <p className="mt-1 text-[11px] text-text-secondary">Handles are visible to anyone with the link. Never add emails.</p>
    </section>
  );
}

export function ServicesSection({ timeline, update, remove }: { timeline: Timeline; update: Update; remove: (i: number) => void }) {
  const [name, setName] = useState("");
  const services = timeline.services ?? [];
  const add = () => {
    const s = name.trim().slice(0, MAX_SERVICE);
    if (!s || services.includes(s) || services.length >= MAX_SERVICES) return;
    update((t) => ({ ...t, services: [...(t.services ?? []), s] }));
    setName("");
  };
  return (
    <section>
      <h2 className={h2}>Services ({services.length}/{MAX_SERVICES})</h2>
      <ul className="mb-2 flex flex-wrap gap-1">
        {services.map((s, i) => (
          <li key={s} className="flex items-center gap-1 rounded-sm border-2 border-text/50 bg-surface px-1.5 font-mono text-xs">
            {s}
            <button className="px-1 text-sm" onClick={() => remove(i)} aria-label={`Remove ${s}`}>×</button>
          </li>
        ))}
      </ul>
      <form className="flex gap-1" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <input className={field} placeholder="e.g. prod-db" value={name} maxLength={MAX_SERVICE} onChange={(e) => setName(e.target.value)} aria-label="Service name" />
        <button className={`${btn} bg-surface`} type="submit">Add</button>
      </form>
      <p className="mt-1 text-[11px] text-text-secondary">Two teams on the same service at the same time is an error; other overlaps are warnings.</p>
    </section>
  );
}

export function FreezesSection({ timeline, update, zone }: { timeline: Timeline; update: Update; zone: Zone }) {
  const freezes = timeline.freezes ?? [];
  const day = Math.ceil(nowMinutes() / 1440) * 1440;
  const [label, setLabel] = useState("Change freeze");
  const [from, setFrom] = useState(() => toInputValue(day, zone));
  const [to, setTo] = useState(() => toInputValue(day + 1440, zone));
  const [err, setErr] = useState("");
  const add = () => {
    const s = fromInputValue(from, zone), e = fromInputValue(to, zone);
    if (s === null || e === null || e <= s) return setErr("End must be after start");
    update((t) => ({ ...t, freezes: [...(t.freezes ?? []), { label: label.trim().slice(0, MAX_LABEL), start: s, duration: e - s }] }));
    setErr("");
  };
  return (
    <section>
      <h2 className={h2}>Freezes ({freezes.length}/{MAX_FREEZES})</h2>
      <ul className="mb-2 space-y-1 text-sm">
        {freezes.map((f, i) => (
          <li key={i} className="flex items-start gap-2 border-2 border-sky-700/60 bg-sky-50 px-2 py-1">
            <span className="min-w-0 flex-1">
              <b className="block truncate">❄ {f.label || "Freeze"}</b>
              <span className="text-[11px] text-text-secondary">{formatDateTime(f.start, zone)} → {formatDateTime(f.start + f.duration, zone)}</span>
            </span>
            <button onClick={() => update((t) => ({ ...t, freezes: (t.freezes ?? []).filter((_, k) => k !== i) }))} aria-label={`Remove ${f.label}`}>×</button>
          </li>
        ))}
      </ul>
      {freezes.length < MAX_FREEZES && (
        <form className="space-y-1" onSubmit={(e) => { e.preventDefault(); add(); }}>
          <input className={field} value={label} maxLength={MAX_LABEL} onChange={(e) => setLabel(e.target.value)} aria-label="Freeze label" />
          <div className="flex gap-1">
            <input className={field} type="datetime-local" step={SLOT * 60} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Freeze start" />
            <input className={field} type="datetime-local" step={SLOT * 60} value={to} onChange={(e) => setTo(e.target.value)} aria-label="Freeze end" />
          </div>
          <button className={`${btn} bg-surface`} type="submit">Add freeze</button>
          {err && <p className="text-xs font-bold text-red-600" role="alert">{err}</p>}
        </form>
      )}
    </section>
  );
}
