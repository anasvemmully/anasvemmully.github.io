"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TimelineBoard from "./TimelineBoard";
import type { EditApi } from "./Swimlane";
import WindowForm from "./WindowForm";
import { useFragmentTimeline } from "./useFragment";
import { encodeTimeline } from "@/lib/timeline/codec";
import { removePerson, removeService, removeTeam as dropTeam, setRef } from "@/lib/timeline/edit";
import { FreezesSection, PeopleSection, ServicesSection } from "./EditorSections";
import { nowMinutes, type Zone } from "@/lib/timeline/time";
import { LINK_WARN, MAX_LABEL, MAX_TEAMS, MAX_TEAM_NAME, MAX_WINDOWS, TEAM_COLORS, type Timeline, type Window } from "@/lib/timeline/types";
import { parseTimeline } from "@/lib/timeline/validate";

import { btn, field } from "./EditorSections";

export default function EditorScreen() {
  const loaded = useFragmentTimeline();
  if (loaded.status === "loading") return <p className="p-8 text-text-secondary">Loading…</p>;
  if (loaded.status === "error")
    return (
      <div className="mx-auto max-w-xl p-8">
        <p className="mb-3 font-bold">This link couldn&apos;t be read ({loaded.reason === "unsupported-version" ? "newer format" : "damaged"}).</p>
        <button className={`${btn} bg-accent`} onClick={() => { history.replaceState(null, "", "/timeline"); location.reload(); }}>Open empty editor</button>
      </div>
    );
  return <Editor initial={loaded.timeline} />;
}

function Editor({ initial }: { initial: Timeline }) {
  const [timeline, setTimeline] = useState(initial);
  // Always update from the latest state, so quick successive edits can't overwrite each other.
  const update = (f: (t: Timeline) => Timeline) => setTimeline(f);
  const [zone, setZone] = useState<Zone>("local");
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [linkLen, setLinkLen] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sidebar, setSidebar] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [teamName, setTeamName] = useState("");
  const [json, setJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  // The URL fragment is the only storage: rewrite it on every change.
  useEffect(() => {
    let live = true;
    encodeTimeline(timeline).then((f) => {
      if (!live) return;
      setLinkLen(f.length);
      history.replaceState(null, "", f && (timeline.teams.length || timeline.windows.length) ? `#${f}` : location.pathname);
    });
    return () => { live = false; };
  }, [timeline]);

  const addTeam = () => {
    const name = teamName.trim();
    if (!name || timeline.teams.length >= MAX_TEAMS) return;
    update((t) => ({ ...t, teams: [...t.teams, { name, color: t.teams.length % TEAM_COLORS.length }] }));
    setTeamName("");
  };
  const removeTeam = (i: number) => update((t) => dropTeam(t, i));
  const patchTeam = (i: number, p: Partial<Timeline["teams"][number]>) =>
    update((t) => ({ ...t, teams: t.teams.map((x, k) => (k === i ? { ...x, ...p } : x)) }));

  const saveWindow = (w: Window, ref: { repo: string; num: number } | null) => {
    const target = editing;
    update((t) => {
      const i = target === "new" ? t.windows.length : (target as number);
      const next = { ...t, windows: target === "new" ? [...t.windows, w] : t.windows.map((x, k) => (k === i ? w : x)) };
      return setRef(next, i, ref);
    });
    setEditing(null);
  };

  const blank: Window = { team: 0, label: "", start: Math.ceil(nowMinutes() / 60) * 60, duration: 120, repeat: { kind: "none" } };

  const copyLink = async () => {
    const url = `${location.origin}/timeline?view=1#${await encodeTimeline(timeline)}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { prompt("Copy this link", url); }
  };

  const edit: EditApi = {
    create: (team, start, duration) => {
      if (timeline.windows.length >= MAX_WINDOWS) return false;
      update((t) => ({ ...t, windows: [...t.windows, { team, label: "", start, duration, repeat: { kind: "none" } }] }));
      return true;
    },
    reshape: (i, shift, duration) =>
      update((t) => ({ ...t, windows: t.windows.map((w, k) => (k === i ? { ...w, start: w.start + shift, duration } : w)) })),
    rename: (i, label) =>
      update((t) => ({ ...t, windows: t.windows.map((w, k) => (k === i ? { ...w, label: label.trim().slice(0, MAX_LABEL) } : w)) })),
    addTeam: (name) =>
      update((t) => (t.teams.length >= MAX_TEAMS ? t : { ...t, teams: [...t.teams, { name: name.slice(0, MAX_TEAM_NAME), color: t.teams.length % TEAM_COLORS.length }] })),
  };

  const leading = (
    <>
      <Link href="/" className={`${btn} bg-surface`} aria-label="Back to site">←</Link>
      <button className={`${btn} bg-surface`} onClick={() => setSidebar((v) => !v)} aria-expanded={sidebar}>
        {sidebar ? "Hide panel" : "Teams & windows"}
      </button>
      <h1 className="hidden font-heading text-base font-black uppercase tracking-tighter md:block">Window Timeline</h1>
    </>
  );
  const trailing = (
    <>
      <span className={`hidden text-xs font-mono xl:inline ${linkLen > LINK_WARN ? "font-bold text-red-600" : "text-text-secondary"}`}>
        link ≈ {linkLen} chars{linkLen > LINK_WARN ? " — getting long" : ""}
      </span>
      <button className={`${btn} bg-accent shadow-[2px_2px_0_var(--color-primary-black)]`} onClick={copyLink} disabled={!timeline.teams.length}>
        {copied ? "Copied!" : "Copy share link"}
      </button>
    </>
  );

  return (
    <div className="flex h-dvh min-h-0 flex-col gap-2 p-2">
      <div className="relative flex min-h-0 flex-1 gap-3">
        {sidebar && (
        <aside className="space-y-6 overflow-y-auto bg-bg max-lg:absolute max-lg:inset-0 max-lg:z-30 max-lg:p-1 lg:w-80 lg:shrink-0 lg:pr-1">
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest">Teams ({timeline.teams.length}/{MAX_TEAMS})</h2>
            <ul className="mb-2 space-y-1">
              {timeline.teams.map((t, i) => (
                <li key={i} className="flex items-center gap-1">
                  <button
                    className="size-6 shrink-0 border-2 border-text" style={{ background: TEAM_COLORS[t.color] }}
                    onClick={() => patchTeam(i, { color: (t.color + 1) % TEAM_COLORS.length })} title="Change color" aria-label={`Change color of ${t.name}`}
                  />
                  <input className={field} value={t.name} maxLength={MAX_TEAM_NAME} onChange={(e) => patchTeam(i, { name: e.target.value })} aria-label="Team name" />
                  <button className="px-2 text-lg" onClick={() => removeTeam(i)} aria-label={`Remove ${t.name}`}>×</button>
                </li>
              ))}
            </ul>
            <form className="flex gap-1" onSubmit={(e) => { e.preventDefault(); addTeam(); }}>
              <input className={field} placeholder="New team" value={teamName} maxLength={MAX_TEAM_NAME} onChange={(e) => setTeamName(e.target.value)} />
              <button className={`${btn} bg-surface`} type="submit">Add</button>
            </form>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest">Windows ({timeline.windows.length}/{MAX_WINDOWS})</h2>
            {editing !== null ? (
              <WindowForm
                key={`${editing}-${zone}`}
                timeline={timeline}
                zone={zone}
                initial={editing === "new" ? blank : timeline.windows[editing]}
                onSave={saveWindow}
                onCancel={() => setEditing(null)}
                onDelete={editing === "new" ? undefined : () => { const i = editing; update((t) => setRef(t, i, null)); update((t) => ({ ...t, windows: t.windows.filter((_, k) => k !== i) })); setEditing(null); }}
              />
            ) : (
              <>
                <button className={`${btn} mb-2 bg-surface`} disabled={!timeline.teams.length || timeline.windows.length >= MAX_WINDOWS} onClick={() => setEditing("new")}>
                  + Add window
                </button>
                {!timeline.teams.length && <p className="text-xs text-text-secondary">Add a team first.</p>}
                <ul className="space-y-1 text-sm">
                  {timeline.windows.map((w, i) => (
                    <li key={i}>
                      <button className="flex w-full items-center gap-2 border-2 border-text bg-surface px-2 py-1 text-left hover:bg-secondary-gray" onClick={() => setEditing(i)}>
                        <span className="size-3 shrink-0 border border-text" style={{ background: TEAM_COLORS[timeline.teams[w.team].color] }} />
                        <span className="truncate">{timeline.teams[w.team].name}{w.label ? ` · ${w.label.slice(0, MAX_LABEL)}` : ""}</span>
                        <span className="ml-auto text-[11px] text-text-secondary">{w.repeat.kind === "none" ? "once" : w.repeat.kind}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <PeopleSection timeline={timeline} update={update} remove={(i) => update((t) => removePerson(t, i))} />
          <ServicesSection timeline={timeline} update={update} remove={(i) => update((t) => removeService(t, i))} />
          <FreezesSection key={zone} timeline={timeline} update={update} zone={zone} />

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest">Export / import</h2>
            <textarea className={`${field} h-28 font-mono text-xs`} value={json} onChange={(e) => setJson(e.target.value)} placeholder="JSON" aria-label="Timeline JSON" />
            <div className="mt-1 flex gap-1">
              <button className={`${btn} bg-surface`} onClick={() => { setJson(JSON.stringify(timeline, null, 2)); setJsonError(""); }}>Export</button>
              <button
                className={`${btn} bg-surface`}
                onClick={() => { try { setTimeline(parseTimeline(JSON.parse(json))); setJsonError(""); } catch (e) { setJsonError((e as Error).message); } }}
              >
                Import
              </button>
            </div>
            {jsonError && <p className="mt-1 text-xs font-bold text-red-600" role="alert">{jsonError}</p>}
          </section>
        </aside>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TimelineBoard timeline={timeline} zone={zone} onZoneChange={setZone} onSelect={(i) => setEditing(i)} edit={edit} leading={leading} trailing={trailing} />
        </div>
      </div>
    </div>
  );
}
