"use client";

import { useSyncExternalStore } from "react";
import EditorScreen from "@/components/timeline/EditorScreen";
import ViewerScreen from "@/components/timeline/ViewerScreen";

const subscribe = () => () => {};

/**
 * One route, two modes. `?view=1` opens the read-only Viewer; without it you
 * get the Editor. The Timeline data itself stays in the #fragment, which is
 * never sent to a server (the query string is, so it only carries the mode).
 */
export default function TimelinePage() {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => null);
  if (search === null) return <p className="p-8 text-text-secondary">Loading…</p>;
  return new URLSearchParams(search).has("view") ? <ViewerScreen /> : <EditorScreen />;
}
