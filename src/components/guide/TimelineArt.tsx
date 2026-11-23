/**
 * Decorative, CSS-drawn pictures of the Window Timeline for the guide page.
 * Purely presentational server components: no state, no images, aria-hidden.
 */

type Bar = {
  /** Left edge and width as a percentage of the lane. */
  at: number;
  w: number;
  label?: string;
  tone?: "yellow" | "black" | "white" | "pink" | "blue";
  /** Marks the bar as clashing with another team. */
  clash?: boolean;
};

export type Lane = { team: string; bars: Bar[] };

const tones: Record<NonNullable<Bar["tone"]>, string> = {
  yellow: "bg-accent text-text",
  black: "bg-text text-accent",
  white: "bg-white text-text",
  pink: "bg-[#FF9ECF] text-text",
  blue: "bg-[#9EC5FF] text-text",
};

/** Diagonal red hatching used for overlaps, matching the tool's "tinted" clash. */
export const hatch =
  "bg-[repeating-linear-gradient(135deg,rgba(220,38,38,0.55)_0_4px,transparent_4px_9px)]";

/** A miniature swimlane: team names on the left, bars on a shared time axis. */
export function MiniSwimlane({
  lanes,
  ticks = ["00:00", "06:00", "12:00", "18:00"],
  now,
  freeze,
  overlaps = [],
  compact = false,
  className = "",
}: {
  lanes: Lane[];
  ticks?: string[];
  /** Position of the red now-line, in percent. */
  now?: number;
  /** A change freeze band across every lane, in percent. */
  freeze?: { at: number; w: number };
  /** Overlap regions to hatch: lane index plus percent range. */
  overlaps?: { lane: number; at: number; w: number }[];
  compact?: boolean;
  className?: string;
}) {
  const laneH = compact ? "h-7" : "h-10 sm:h-11";
  const label = compact ? "w-14 text-[9px]" : "w-16 text-[10px] sm:w-20 sm:text-xs";
  return (
    <div aria-hidden="true" className={`select-none border-2 border-text bg-white font-mono ${className}`}>
      {/* axis */}
      <div className="flex border-b-2 border-text bg-secondary-gray">
        <div className={`${label} shrink-0 border-r-2 border-text px-1.5 py-1 font-bold uppercase`}>Team</div>
        <div className="relative flex flex-1">
          {ticks.map((t) => (
            <div key={t} className={`flex-1 border-l border-text/20 px-1 py-1 ${compact ? "text-[8px]" : "text-[9px] sm:text-[11px]"} text-text-secondary first:border-l-0`}>
              {t}
            </div>
          ))}
        </div>
      </div>
      {/* lanes */}
      <div className="relative">
        {lanes.map((lane, i) => (
          <div key={lane.team} className={`flex ${laneH} border-b border-text/15 last:border-b-0`}>
            <div className={`${label} flex shrink-0 items-center truncate border-r-2 border-text px-1.5 font-bold`}>{lane.team}</div>
            <div className="relative flex-1 bg-[linear-gradient(90deg,rgba(15,15,15,0.06)_1px,transparent_1px)] bg-[length:25%_100%]">
              {lane.bars.map((b, j) => (
                <div
                  key={j}
                  className={`absolute inset-y-1 flex items-center overflow-hidden border-2 border-text px-1 ${compact ? "text-[8px]" : "text-[9px] sm:text-[11px]"} font-bold whitespace-nowrap shadow-[2px_2px_0_var(--color-primary-black)] ${tones[b.tone ?? "yellow"]} ${b.clash ? "outline-2 outline-offset-1 outline-red-600" : ""}`}
                  style={{ left: `${b.at}%`, width: `${b.w}%` }}
                >
                  {b.label}
                </div>
              ))}
              {overlaps
                .filter((o) => o.lane === i)
                .map((o, k) => (
                  <div key={k} className={`pointer-events-none absolute inset-y-0 ${hatch}`} style={{ left: `${o.at}%`, width: `${o.w}%` }} />
                ))}
            </div>
          </div>
        ))}
        {/* freeze + now overlay share the plot area (offset by the label column) */}
        <div className={`pointer-events-none absolute inset-y-0 right-0 ${compact ? "left-14" : "left-16 sm:left-20"}`}>
          {freeze && (
            <div
              className="absolute inset-y-0 border-x-2 border-dashed border-text bg-[repeating-linear-gradient(45deg,rgba(15,15,15,0.12)_0_6px,transparent_6px_12px)]"
              style={{ left: `${freeze.at}%`, width: `${freeze.w}%` }}
            >
              <span className={`absolute top-0 left-1/2 -translate-x-1/2 bg-text px-1 ${compact ? "text-[7px]" : "text-[9px]"} font-bold tracking-widest text-accent uppercase`}>Freeze</span>
            </div>
          )}
          {now !== undefined && (
            <div className="absolute inset-y-0 w-0.5 bg-red-600" style={{ left: `${now}%` }}>
              <span className="absolute -top-0.5 -left-[5px] size-3 rounded-full border-2 border-white bg-red-600 motion-safe:animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** The four detail levels, drawn as a ruler that gets coarser. */
export function ZoomLadder() {
  const rows = [
    { label: "6h", unit: ["09", "10", "11", "12", "13", "14"] },
    { label: "1w", unit: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { label: "3mo", unit: ["W1", "W2", "W3", "W4"] },
    { label: "2y", unit: ["Jan", "Apr", "Jul"] },
  ];
  return (
    <div aria-hidden="true" className="space-y-1.5 font-mono">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-2" style={{ paddingLeft: `${i * 6}%` }}>
          <span className="w-9 shrink-0 text-right text-[10px] font-bold text-text-secondary">{r.label}</span>
          <div className="flex flex-1 border-2 border-text bg-white">
            {r.unit.map((u) => (
              <span key={u} className="flex-1 border-l border-text/25 px-1 py-0.5 text-[10px] first:border-l-0">
                {u}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A share link split into the part a server sees and the part it never does. */
export function LinkAnatomy({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`break-all font-mono text-xs leading-relaxed sm:text-sm ${dark ? "text-white" : "text-text"}`}>
      <span className={dark ? "text-white/70" : "text-text-secondary"}>anas.vemmully.in/timeline?view=1</span>
      <span className="mx-0.5 bg-accent px-1 font-black text-text">#</span>
      <span className={`underline decoration-wavy decoration-2 underline-offset-4 ${dark ? "decoration-accent" : "decoration-text"}`}>
        H4sIAAAAAAAAA6tWKkktLlGyUlAqzy_KTlXSUcpLzE0FChqZGRmAuUWpRSWZQF
      </span>
    </div>
  );
}
