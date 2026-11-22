"use client";

import { useEffect } from "react";

// Old share links: /timeline/view#data  ->  /timeline?view=1#data
export default function LegacyViewRedirect() {
  useEffect(() => {
    window.location.replace(`/timeline?view=1${window.location.hash}`);
  }, []);
  return <p className="p-8 text-text-secondary">Redirecting…</p>;
}
