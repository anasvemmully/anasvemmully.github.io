"use client";

import { useState } from "react";
import { avatarUrl } from "@/lib/timeline/github";

/** GitHub avatar for a handle, falling back to initials if it can't load. */
export default function Avatar({ gh, size = 18 }: { gh: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const hue = [...gh].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    <span
      title={`@${gh}`}
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-text font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${hue} 55% 42%)` }}
    >
      {failed ? (
        gh.slice(0, 2).toUpperCase()
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- tiny external avatar; next/image would need remote config
        <img src={avatarUrl(gh, size * 2)} alt="" width={size} height={size} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      )}
    </span>
  );
}
