"use client";

import Link from "next/link";
import { useState } from "react";
import TimelineBoard from "./TimelineBoard";
import { useFragmentTimeline } from "./useFragment";
import type { Zone } from "@/lib/timeline/time";

const btn = "rounded-sm border-2 border-text px-3 py-1 text-xs font-bold uppercase tracking-widest";

export default function ViewerScreen() {
  const loaded = useFragmentTimeline();
  const [zone, setZone] = useState<Zone>("local");

  return (
    <div className="flex h-dvh min-h-0 flex-col gap-2 p-2">
      {loaded.status === "loading" && <p className="p-6 text-text-secondary">Loading…</p>}
      {loaded.status === "error" && (
        <div className="m-auto max-w-md border-2 border-text bg-surface p-6">
          <p className="mb-3 font-bold">This link couldn&apos;t be read.</p>
          <p className="mb-4 text-text-secondary">
            {loaded.reason === "unsupported-version" ? "It was made with a newer version of this tool." : "It looks truncated or damaged."}
          </p>
          <Link href="/timeline" className={`${btn} bg-accent`}>Open an empty editor</Link>
        </div>
      )}
      {loaded.status === "ready" && (
        <div className="flex min-h-0 flex-1 flex-col">
          <TimelineBoard
            timeline={loaded.timeline}
            zone={zone}
            onZoneChange={setZone}
            leading={<Link href="/" className={`${btn} bg-surface`} aria-label="Back to site">←</Link>}
            trailing={
              <button className={`${btn} bg-accent shadow-[2px_2px_0_var(--color-primary-black)]`} onClick={() => (window.location.href = `/timeline${window.location.hash}`)}>
                Open in editor
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
