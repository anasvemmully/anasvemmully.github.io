"use client";

import { useEffect, useState } from "react";
import { decodeTimeline } from "@/lib/timeline/codec";
import type { Timeline } from "@/lib/timeline/types";

export type Loaded =
  | { status: "loading" }
  | { status: "ready"; timeline: Timeline }
  | { status: "error"; reason: "corrupt" | "unsupported-version" };

/** Reads the Timeline out of the URL fragment once on mount. An empty fragment is an empty Timeline. */
export function useFragmentTimeline(): Loaded {
  const [state, setState] = useState<Loaded>({ status: "loading" });
  useEffect(() => {
    const frag = window.location.hash.replace(/^#/, "");
    const empty: Loaded = { status: "ready", timeline: { teams: [], windows: [] } };
    const load: Promise<Loaded> = frag
      ? decodeTimeline(frag).then((r) => (r.ok ? { status: "ready", timeline: r.timeline } : { status: "error", reason: r.reason }))
      : Promise.resolve(empty);
    load.then(setState);
  }, []);
  return state;
}
