"use client";

import Link from "next/link";
import { useState } from "react";
import TimelineBoard from "./TimelineBoard";
import { useFragmentTimeline } from "./useFragment";
import type { Zone } from "@/lib/timeline/time";

export default function ViewerScreen() {
  const loaded = useFragmentTimeline();
  const [zone, setZone] = useState<Zone>("local");

  return (
    <div className="flex min-h-[calc(100dvh-4.1rem)] flex-1 flex-col gap-2 px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-black uppercase tracking-tighter">Window Timeline</h1>
        {loaded.status === "ready" && (
          <button
            className="border-2 border-text bg-accent px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0_var(--color-primary-black)]"
            onClick={() => (window.location.href = `/timeline${window.location.hash}`)}
          >
            Open in editor
          </button>
        )}
      </div>
      {loaded.status === "loading" && <p className="text-text-secondary">Loading…</p>}
      {loaded.status === "error" && (
        <div className="border-2 border-text bg-surface p-6">
          <p className="mb-3 font-bold">This link couldn&apos;t be read.</p>
          <p className="mb-4 text-text-secondary">
            {loaded.reason === "unsupported-version" ? "It was made with a newer version of this tool." : "It looks truncated or damaged."}
          </p>
          <Link href="/timeline" className="border-2 border-text bg-accent px-3 py-1 text-xs font-bold uppercase tracking-widest">
            Open an empty editor
          </Link>
        </div>
      )}
      {loaded.status === "ready" && (
        <div className="flex min-h-[420px] flex-1 flex-col">
          <TimelineBoard timeline={loaded.timeline} zone={zone} onZoneChange={setZone} />
        </div>
      )}
    </div>
  );
}
