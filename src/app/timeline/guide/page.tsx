import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MiniSwimlane, ZoomLadder, LinkAnatomy, hatch, type Lane } from "@/components/guide/TimelineArt";

export const metadata: Metadata = {
  title: "Window Timeline — Guide",
  description:
    "How to use Window Timeline: plan every team's job windows on one zoomable swimlane, spot overlaps and change-freeze clashes, assign people, export to calendar and share the whole plan as a link. No accounts, nothing stored.",
  alternates: { canonical: "/timeline/guide" },
  openGraph: {
    title: "Window Timeline — Guide",
    description: "Plan every team's job windows on one zoomable timeline. Share it as a link. Nothing is stored anywhere.",
    url: "/timeline/guide",
    type: "article",
  },
};

/* ---------- shared bits ---------- */

const shadow = "shadow-[4px_4px_0_var(--color-primary-black)]";
const shadowLg = "shadow-[8px_8px_0_var(--color-primary-black)]";
const press =
  "transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-primary-black)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-text";
const btnPrimary = `inline-flex items-center justify-center gap-2 border-2 border-text bg-accent px-6 py-3 font-heading text-lg font-black uppercase tracking-tight text-text ${shadow} ${press}`;
const btnSecondary = `inline-flex items-center justify-center gap-2 border-2 border-text bg-white px-6 py-3 font-heading text-lg font-black uppercase tracking-tight text-text ${shadow} ${press}`;

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-block min-w-[1.6em] border-2 border-text bg-white px-1.5 py-px text-center font-mono text-[0.8em] font-bold leading-snug shadow-[2px_2px_0_var(--color-primary-black)]">
      {children}
    </kbd>
  );
}

function SectionHead({ n, kicker, title, children }: { n: string; kicker: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-10 max-w-3xl md:mb-14">
      <p className="mb-3 inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] text-text-secondary uppercase">
        <span className="border-2 border-text bg-text px-1.5 py-0.5 text-accent">{n}</span>
        {kicker}
      </p>
      <h2 className="text-4xl leading-[1.02] font-black tracking-tighter text-balance md:text-6xl">{title}</h2>
      {children && <p className="mt-4 max-w-2xl text-lg text-text-secondary">{children}</p>}
    </div>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

/* ---------- icons (24px, stroke = currentColor) ---------- */

const I = ({ d, children }: { d?: string; children?: ReactNode }) => (
  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
    {d && <path d={d} />}
    {children}
  </svg>
);

const icons = {
  lanes: <I d="M3 6h18M3 12h18M3 18h18M7 4v4M13 10v4M9 16v4" />,
  zoom: <I><circle cx="10" cy="10" r="6" /><path d="M15 15l6 6M7.5 10h5M10 7.5v5" /></I>,
  drag: <I d="M4 9h10v6H4zM14 12h6M17 9l3 3-3 3" />,
  overlap: <I><rect x="3" y="5" width="11" height="6" /><rect x="10" y="13" width="11" height="6" /><path d="M10 11v2M14 11v2" /></I>,
  pane: <I><rect x="3" y="4" width="18" height="16" /><path d="M14 4v16M16.5 8h2M16.5 11h2M16.5 14h2" /></I>,
  freeze: <I d="M12 2v20M4 6.5l16 11M20 6.5l-16 11M9 3.5l3 2 3-2M9 20.5l3-2 3 2" />,
  people: <I><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.2-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.8a3.5 3.5 0 010 6.4M18.5 14.8c1.5.9 2.5 2.6 3 5.2" /></I>,
  service: <I><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="8.5" y="14" width="7" height="7" /><path d="M6.5 10v2h11v-2M12 12v2" /></I>,
  person: <I><circle cx="12" cy="7" r="4" /><path d="M4 21c1-4.5 4-7 8-7s7 2.5 8 7" /></I>,
  calendar: <I><rect x="3" y="5" width="18" height="16" /><path d="M3 10h18M8 2v5M16 2v5M8 14h3v3H8z" /></I>,
  link: <I d="M10 14a4 4 0 005.7 0l3.6-3.6a4 4 0 00-5.7-5.7L12 6.3M14 10a4 4 0 00-5.7 0l-3.6 3.6a4 4 0 005.7 5.7L12 17.7" />,
};

/* ---------- content ---------- */

const heroLanes: Lane[] = [
  { team: "Payments", bars: [{ at: 4, w: 30, label: "DB migrate", tone: "yellow" }, { at: 70, w: 22, label: "Rollout", tone: "yellow" }] },
  { team: "Search", bars: [{ at: 24, w: 28, label: "Reindex", tone: "blue", clash: true }] },
  { team: "Data", bars: [{ at: 40, w: 26, label: "Nightly ETL", tone: "black" }, { at: 82, w: 14, label: "Sync", tone: "black" }] },
  { team: "Infra", bars: [{ at: 10, w: 12, label: "Patch", tone: "pink" }, { at: 56, w: 30, label: "K8s upgrade", tone: "pink", clash: true }] },
];

type Feature = { icon: ReactNode; title: string; body: ReactNode; wide?: boolean; art?: ReactNode; tag?: string };

const features: Feature[] = [
  {
    icon: icons.lanes,
    title: "Teams as lanes",
    tag: "The basics",
    wide: true,
    body: (
      <>
        Every team gets its own lane. A window is <b>one-off</b>, <b>daily</b>, or <b>weekly</b> on the weekdays you pick. Everything snaps to{" "}
        <b>15 minutes</b>. Windows are stored in UTC and shown in your local zone, with a toggle to see them in UTC.
      </>
    ),
    art: (
      <MiniSwimlane
        compact
        ticks={["Mon", "Tue", "Wed", "Thu", "Fri"]}
        lanes={[
          { team: "Billing", bars: [{ at: 2, w: 12, tone: "yellow" }, { at: 22, w: 12, tone: "yellow" }, { at: 42, w: 12, tone: "yellow" }, { at: 62, w: 12, tone: "yellow" }, { at: 82, w: 12, tone: "yellow" }] },
          { team: "Backup", bars: [{ at: 30, w: 16, tone: "black" }, { at: 70, w: 16, tone: "black" }] },
          { team: "Launch", bars: [{ at: 50, w: 22, tone: "pink", label: "one-off" }] },
        ]}
      />
    ),
  },
  {
    icon: icons.zoom,
    title: "Zoom from 6 hours to 2 years",
    tag: "Navigate",
    body: (
      <>
        Pinch, or <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + scroll. The axis switches from hours to days, weeks and months on its own. Pan by dragging, <Kbd>Shift</Kbd> +
        scroll, or <Kbd>←</Kbd> <Kbd>→</Kbd>. <b>Today</b> jumps back, and a red line marks now.
      </>
    ),
    art: <ZoomLadder />,
  },
  {
    icon: icons.drag,
    title: "Edit it like a spreadsheet",
    tag: "Edit",
    body: (
      <>
        Drag on an empty lane to create a window. Drag a bar to move it, drag its edge to resize, double-click to rename. Add a team from the{" "}
        <b>+ Add team</b> row at the bottom.
      </>
    ),
  },
  {
    icon: icons.overlap,
    title: "Overlaps light up",
    tag: "Spot clashes",
    body: (
      <>
        When windows from different teams overlap, the shared time is tinted. The <b>N overlaps</b> button lists every one and jumps to it.
      </>
    ),
    art: (
      <div aria-hidden="true" className="relative h-16 border-2 border-text bg-white">
        <div className="absolute top-2 left-[6%] h-5 w-[52%] border-2 border-text bg-accent" />
        <div className="absolute bottom-2 left-[38%] h-5 w-[54%] border-2 border-text bg-[#9EC5FF]" />
        <div className={`absolute inset-y-0 left-[38%] w-[20%] border-x-2 border-red-600 ${hatch}`} />
        <span className="absolute -top-3 right-2 border-2 border-text bg-red-600 px-1.5 font-mono text-[10px] font-bold text-white">1 overlap</span>
      </div>
    ),
  },
  {
    icon: icons.pane,
    title: "Details on click",
    tag: "Inspect",
    body: <>Click any bar to open a side pane with its time, duration, repeat rule, overlaps, people and links.</>,
  },
  {
    icon: icons.freeze,
    title: "Change freezes",
    tag: "Guardrails",
    wide: true,
    body: (
      <>
        A freeze is a band across <b>every</b> lane, for a release, a holiday or an audit. Any window that falls inside one gets flagged.
      </>
    ),
    art: (
      <MiniSwimlane
        compact
        ticks={["Dec 18", "Dec 22", "Dec 26", "Dec 30"]}
        freeze={{ at: 38, w: 34 }}
        lanes={[
          { team: "Web", bars: [{ at: 6, w: 22, tone: "yellow" }, { at: 46, w: 16, tone: "yellow", clash: true }] },
          { team: "API", bars: [{ at: 76, w: 20, tone: "blue" }] },
          { team: "Ops", bars: [{ at: 14, w: 18, tone: "pink" }] },
        ]}
      />
    ),
  },
  {
    icon: icons.people,
    title: "People and pull requests",
    tag: "Ownership",
    body: (
      <>
        Assign people by GitHub handle and their avatars show up. Link a window to a PR or issue as <code className="font-mono text-sm font-bold">owner/repo#123</code>.
      </>
    ),
  },
  {
    icon: icons.service,
    title: "Services and conflicts",
    tag: "Severity",
    body: (
      <>
        Tag windows with the services they touch. Two windows on the <b>same service</b> at once is an <b className="text-red-700">error</b>. A plain time overlap
        is only a <b>warning</b>. The <b>Conflicts</b> panel lists them all.
      </>
    ),
  },
  {
    icon: icons.person,
    title: "By person view",
    tag: "People",
    body: <>Switch lanes from teams to people to see at a glance when someone is booked in two places at once.</>,
  },
  {
    icon: icons.calendar,
    title: "Export to calendar",
    tag: ".ics",
    body: <>Download the timeline as an <code className="font-mono text-sm font-bold">.ics</code> file and import it into Google Calendar, Outlook or Apple Calendar.</>,
  },
  {
    icon: icons.link,
    title: "Share as a link",
    tag: "Share",
    wide: true,
    body: (
      <>
        The whole timeline is packed into the URL after the <b>#</b>, and browsers never send that part to a server. People who open it get a read-only view with an{" "}
        <b>Open in editor</b> button.
      </>
    ),
    art: (
      <div className="border-2 border-text bg-secondary-gray p-3">
        <LinkAnatomy />
      </div>
    ),
  },
];

const steps = [
  {
    title: "Add teams",
    body: "Type a name in the + Add team row. Each team becomes a lane.",
    art: (
      <div aria-hidden="true" className="space-y-1 font-mono text-[10px]">
        {["Payments", "Search"].map((t) => (
          <div key={t} className="border-2 border-text bg-white px-2 py-1 font-bold">{t}</div>
        ))}
        <div className="border-2 border-dashed border-text px-2 py-1 text-text-secondary">+ Add team</div>
      </div>
    ),
  },
  {
    title: "Add windows",
    body: "Drag across a lane. Set the repeat rule, people, services and links in the form.",
    art: (
      <div aria-hidden="true" className="relative h-[76px] border-2 border-text bg-white">
        <div className="absolute top-3 left-[12%] h-6 w-[50%] border-2 border-text bg-accent shadow-[2px_2px_0_var(--color-primary-black)]" />
        <div className="absolute top-3 left-[62%] h-6 w-1.5 -translate-x-1/2 bg-text" />
        <svg viewBox="0 0 24 24" className="absolute top-8 left-[60%] size-6" aria-hidden="true">
          <path d="M5 3l14 8-6 1.5L10 19z" fill="white" stroke="#0F0F0F" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <span className="absolute bottom-1 left-2 font-mono text-[9px] text-text-secondary">snaps to :15</span>
      </div>
    ),
  },
  {
    title: "Spot conflicts",
    body: "Hatched areas are overlaps. Open the overlaps list or the Conflicts panel and jump to each one.",
    art: (
      <div aria-hidden="true" className="space-y-1 font-mono text-[10px]">
        <div className="flex items-center gap-1.5 border-2 border-text bg-white px-2 py-1"><span className="size-2.5 bg-red-600" />payments-db: error</div>
        <div className="flex items-center gap-1.5 border-2 border-text bg-white px-2 py-1"><span className="size-2.5 bg-accent ring-2 ring-text" />Search × Infra: warning</div>
        <div className="flex items-center gap-1.5 border-2 border-text bg-white px-2 py-1"><span className="size-2.5 bg-text" />Inside freeze</div>
      </div>
    ),
  },
  {
    title: "Copy share link",
    body: "Send it in chat or paste it in a ticket. Anyone with it sees exactly what you see.",
    art: (
      <div aria-hidden="true" className="flex h-[76px] items-center gap-2">
        <div className="flex-1 truncate border-2 border-text bg-white px-2 py-2 font-mono text-[10px]">…/timeline?view=1#H4sI…</div>
        <div className="border-2 border-text bg-accent px-2 py-2 font-mono text-[10px] font-bold shadow-[2px_2px_0_var(--color-primary-black)]">Copied</div>
      </div>
    ),
  },
];

const shortcuts: { action: string; mouse: ReactNode; keys: ReactNode; touch: ReactNode }[] = [
  { action: "Zoom in / out", mouse: <><Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + scroll, or trackpad pinch</>, keys: <><Kbd>+</Kbd> <Kbd>−</Kbd></>, touch: "Pinch" },
  { action: "Pan through time", mouse: <>Drag the background, <Kbd>Shift</Kbd> + scroll, or scroll sideways</>, keys: <><Kbd>←</Kbd> <Kbd>→</Kbd></>, touch: "Drag" },
  { action: "Back to now", mouse: <>Click <b>Today</b></>, keys: "—", touch: <>Tap <b>Today</b></> },
  { action: "Create a window", mouse: "Drag across an empty part of a lane", keys: "—", touch: "Use the form" },
  { action: "Move / resize", mouse: "Drag the bar / drag its left or right edge", keys: "—", touch: "Edit in the form" },
  { action: "Rename", mouse: "Double-click the bar", keys: <><Kbd>Enter</Kbd> saves, <Kbd>Esc</Kbd> cancels</>, touch: "—" },
  { action: "See details", mouse: "Click the bar", keys: "—", touch: "Tap the bar" },
];

const useCases = [
  { who: "Release managers", what: "Line up every team's deploy windows before a big launch, and protect launch week with a freeze.", glyph: "▲" },
  { who: "SRE & on-call", what: "See maintenance, patching and failover drills in one place, and catch two of them hitting the same service.", glyph: "◆" },
  { who: "Data teams", what: "Map nightly ETLs, backfills and syncs so heavy jobs stop fighting over the same warehouse hours.", glyph: "●" },
  { who: "Change freezes", what: "Draw holiday and audit freezes once. Anything scheduled inside one is flagged for every team.", glyph: "■" },
];

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "Do I need an account?",
    a: "No. There is no sign-up and no login. Open the page and start adding teams.",
  },
  {
    q: "Where is my timeline saved?",
    a: (
      <>
        In the address bar. The editor keeps the URL up to date as you work, so bookmarking the page or copying the share link is how you save it. If you clear
        the URL, the timeline is gone. There is no copy anywhere else.
      </>
    ),
  },
  {
    q: "Can people who open my link change it?",
    a: (
      <>
        A share link opens read-only. They can click <b>Open in editor</b> to get their own editable copy, but their changes only go into their own URL. Your link
        stays the same until you send a new one.
      </>
    ),
  },
  {
    q: "How do time zones work?",
    a: "Windows are stored in UTC, and each viewer sees them in their own local zone. Use the zone toggle to see everything in UTC, which helps when you're agreeing times across regions.",
  },
  {
    q: "What's the difference between an overlap and a conflict?",
    a: "An overlap just means two teams' windows share time, which is a warning. If both windows also touch the same service, it's a conflict and counts as an error. Windows inside a change freeze are flagged too.",
  },
  {
    q: "Is there a limit on size?",
    a: "Only the length of a URL. The timeline is compressed before it goes into the link, so dozens of teams and windows fit easily. Some chat apps cut off very long links, so check that a huge timeline still opens after you paste it.",
  },
  {
    q: "Does it work on a phone?",
    a: "Yes. Pinch to zoom, drag to pan, and tap a bar for its details. Creating and reshaping windows by dragging works best with a mouse or trackpad.",
  },
];

/* ---------- page ---------- */

export default function TimelineGuidePage() {
  return (
    <div className="overflow-x-clip">
      {/* HERO */}
      <section className="relative border-b-2 border-text">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,15,15,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,15,15,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div>
            <p className={`mb-6 inline-flex items-center gap-2 border-2 border-text bg-white px-3 py-1 font-mono text-xs font-bold tracking-widest uppercase ${shadow}`}>
              <span className="size-2 rounded-full bg-red-600 motion-safe:animate-pulse" aria-hidden="true" />
              Window Timeline · Guide
            </p>
            <h1 className="text-[2.6rem] leading-[0.95] font-black tracking-tighter text-balance sm:text-6xl lg:text-7xl">
              Every team&apos;s windows.{" "}
              <span className="relative inline-block">
                <span aria-hidden="true" className="absolute inset-x-[-0.15em] bottom-[0.08em] top-[0.45em] -rotate-1 bg-accent" />
                <span className="relative">One timeline.</span>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary sm:text-xl">
              Plan every team&apos;s job windows on one zoomable timeline. Share it as a link. <b className="text-text">Nothing is stored anywhere.</b>
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <a href="/timeline" className={btnPrimary}>
                Open the timeline <Arrow />
              </a>
              <a href="#tour" className={btnSecondary}>
                <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
                Watch the tour
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs font-bold tracking-wider text-text-secondary uppercase">
              {["No account", "No database", "Free"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <svg viewBox="0 0 16 16" className="size-3.5 text-text" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M2.5 8.5l3.5 3.5 7.5-8" /></svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className={`relative border-2 border-text bg-white p-2 ${shadowLg} lg:rotate-1`}>
              <div className="mb-2 flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-bold uppercase">
                <span className="border-2 border-text bg-white px-1.5 py-0.5">Today</span>
                <span className="border-2 border-text bg-white px-1.5 py-0.5">Local · UTC</span>
                <span className="border-2 border-red-600 bg-white px-1.5 py-0.5 text-red-700">2 overlaps</span>
                <span className="ml-auto border-2 border-text bg-accent px-1.5 py-0.5">Share</span>
              </div>
              <MiniSwimlane
                lanes={heroLanes}
                now={47}
                overlaps={[
                  { lane: 1, at: 24, w: 10 },
                  { lane: 3, at: 56, w: 10 },
                ]}
              />
            </div>
            <span className={`absolute -top-4 -left-2 -rotate-6 border-2 border-text bg-accent px-2 py-1 font-mono text-xs font-black uppercase sm:-left-5 ${shadow}`}>
              Snaps to :15
            </span>
            <span className={`absolute -right-1 -bottom-5 rotate-3 border-2 border-text bg-text px-2 py-1 font-mono text-xs font-black text-accent uppercase sm:-right-4 ${shadow}`}>
              6h ⟷ 2y zoom
            </span>
          </div>
        </div>

        {/* marquee */}
        <div className="relative overflow-hidden border-t-2 border-text bg-text py-3 text-accent" aria-hidden="true">
          <div className="flex w-max motion-safe:animate-[marquee_40s_linear_infinite]">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center gap-8 pr-8 font-heading text-xl font-black tracking-tight whitespace-nowrap uppercase">
                {["Lanes", "Windows", "Overlaps", "Freezes", "Conflicts", "People", "Calendar export", "Share links", "Zero storage"].map((w) => (
                  <span key={w} className="flex items-center gap-8">
                    {w}
                    <span className="text-white">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOUR */}
      <section id="tour" className="scroll-mt-6 border-b-2 border-text bg-accent">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <SectionHead n="01" kicker="The tour" title="Two minutes, start to share link.">
            Watch a timeline go from empty to shared: teams, windows, a freeze, a conflict found and fixed.
          </SectionHead>
          <figure className="mx-auto max-w-5xl">
            <div className={`border-2 border-text bg-white ${shadowLg}`}>
              <div className="flex items-center gap-3 border-b-2 border-text bg-secondary-gray px-3 py-2">
                <div className="flex shrink-0 gap-1.5" aria-hidden="true">
                  <span className="size-3 rounded-full border-2 border-text bg-[#FF5F57]" />
                  <span className="size-3 rounded-full border-2 border-text bg-accent" />
                  <span className="size-3 rounded-full border-2 border-text bg-[#28C840]" />
                </div>
                <div className="min-w-0 flex-1 truncate border-2 border-text bg-white px-2 py-0.5 font-mono text-xs">
                  anas.vemmully.in<b>/timeline</b>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden bg-white">
                {/* Backdrop shown until the poster/video loads, or if they're missing */}
                <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center p-4 sm:p-10">
                  <MiniSwimlane lanes={heroLanes} now={47} overlaps={[{ lane: 1, at: 24, w: 10 }]} className="w-full opacity-30" />
                  <span className={`absolute flex size-16 items-center justify-center rounded-full border-2 border-text bg-accent sm:size-20 ${shadow}`}>
                    <svg viewBox="0 0 24 24" className="ml-1 size-7 sm:size-9" fill="currentColor"><path d="M7 4l13 8-13 8z" /></svg>
                  </span>
                </div>
                <video
                  className="relative size-full bg-transparent object-contain"
                  src="/videos/timeline-tutorial.webm"
                  poster="/videos/timeline-tutorial-poster.png"
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="Screen recording: a tour of the Window Timeline tool"
                >
                  Your browser can&apos;t play this video. <a href="/timeline">Open the timeline</a> and try it directly.
                </video>
              </div>
            </div>
            <figcaption className="mt-5 font-mono text-xs font-bold tracking-wider uppercase">
              Muted screen recording · use the player controls to pause or scrub
            </figcaption>
          </figure>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-6 border-b-2 border-text">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <SectionHead n="02" kicker="What you can do" title={<>Everything a shared calendar can&apos;t show you.</>}>
            Calendars show one person&apos;s week. This shows every team at once, and the places where they collide.
          </SectionHead>
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <li
                key={f.title}
                className={`group flex flex-col border-2 border-text bg-white p-5 transition-transform motion-safe:hover:-translate-y-1 ${shadow} ${f.wide ? "md:col-span-2" : ""}`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center border-2 border-text bg-accent transition-colors group-hover:bg-text group-hover:text-accent">
                    {f.icon}
                  </span>
                  {f.tag && <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-text-secondary uppercase">{f.tag}</span>}
                </div>
                <div className={f.wide && f.art ? "grid flex-1 gap-5 lg:grid-cols-[1fr_1.15fr] lg:items-center" : "flex flex-1 flex-col"}>
                  <div>
                    <h3 className="text-2xl leading-tight font-black tracking-tight">{f.title}</h3>
                    <p className="mt-2 leading-relaxed text-text-secondary [&_b]:text-text">{f.body}</p>
                  </div>
                  {f.art && <div className={f.wide ? "" : "mt-5"}>{f.art}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* STEPS */}
      <section id="steps" className="scroll-mt-6 border-b-2 border-text bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <SectionHead n="03" kicker="How it works" title="Four steps. No setup." />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <div className={`flex h-full flex-col border-2 border-text bg-bg p-5 ${shadow}`}>
                  <span className="font-heading text-6xl leading-none font-black tracking-tighter text-transparent [-webkit-text-stroke:2px_var(--color-primary-black)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-xl font-black tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 mb-5 text-sm leading-relaxed text-text-secondary">{s.body}</p>
                  <div className="mt-auto">{s.art}</div>
                </div>
                {i < steps.length - 1 && (
                  <span className="absolute top-1/2 -right-[22px] z-10 hidden size-8 -translate-y-1/2 items-center justify-center border-2 border-text bg-accent lg:flex" aria-hidden="true">
                    <Arrow className="size-4" />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SHORTCUTS */}
      <section id="shortcuts" className="scroll-mt-6 border-b-2 border-text">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <SectionHead n="04" kicker="Cheat sheet" title="Keyboard & gestures.">
            Keyboard shortcuts work once the timeline has focus. Click anywhere on it first.
          </SectionHead>
          <div className={`border-2 border-text bg-white ${shadowLg}`}>
            <table className="w-full border-collapse text-left text-sm max-md:block">
              <caption className="sr-only">Window Timeline controls by input method</caption>
              <thead className="bg-text text-accent max-md:sr-only">
                <tr>
                  {["Action", "Mouse & trackpad", "Keyboard", "Touch"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-mono text-xs font-bold tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="max-md:block">
                {shortcuts.map((s) => (
                  <tr key={s.action} className="border-t-2 border-text first:border-t-0 even:bg-bg max-md:block max-md:px-4 max-md:py-3">
                    <th scope="row" className="px-4 py-3 align-top font-heading text-base font-black max-md:block max-md:p-0 max-md:pb-2">{s.action}</th>
                    {[
                      ["Mouse", s.mouse],
                      ["Keys", s.keys],
                      ["Touch", s.touch],
                    ].map(([label, v]) => (
                      <td
                        key={label as string}
                        data-label={label as string}
                        className="px-4 py-3 align-top leading-loose max-md:flex max-md:gap-3 max-md:p-0 max-md:py-0.5 max-md:before:w-14 max-md:before:shrink-0 max-md:before:font-mono max-md:before:text-[10px] max-md:before:font-bold max-md:before:leading-loose max-md:before:tracking-widest max-md:before:text-text-secondary max-md:before:uppercase max-md:before:content-[attr(data-label)]"
                      >
                        <span>{v}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" className="scroll-mt-6 border-b-2 border-text bg-text text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="mb-10 max-w-3xl md:mb-14">
            <p className="mb-3 inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] text-white/60 uppercase">
              <span className="border-2 border-accent bg-accent px-1.5 py-0.5 text-text">05</span>
              Who it&apos;s for
            </p>
            <h2 className="text-4xl leading-[1.02] font-black tracking-tighter text-balance md:text-6xl">
              Anyone who has asked <span className="text-accent">&ldquo;wait, who else is running then?&rdquo;</span>
            </h2>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((u, i) => (
              <li
                key={u.who}
                className={`border-2 border-accent p-5 shadow-[4px_4px_0_var(--color-primary-yellow)] ${i % 2 ? "bg-text" : "bg-[#1c1c1c]"}`}
              >
                <span className="font-heading text-4xl text-accent" aria-hidden="true">{u.glyph}</span>
                <h3 className="mt-3 text-xl font-black tracking-tight">{u.who}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{u.what}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRIVACY */}
      <section id="privacy" className="scroll-mt-6 border-b-2 border-text">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHead n="06" kicker="Privacy" title="Your plan lives in the link. Nowhere else." />
            <ul className="-mt-4 space-y-4 text-lg leading-relaxed">
              {[
                <><b>No accounts.</b> Nothing to sign up for, nothing to log in to.</>,
                <><b>No storage.</b> There is no database and nothing is saved on a server.</>,
                <><b>The fragment stays local.</b> Everything after <code className="bg-accent px-1 font-mono font-bold">#</code> stays in the browser and is never sent in the HTTP request.</>,
                <><b>Mind who you send it to.</b> Anyone with the link can read the whole timeline, including GitHub handles and linked PRs. Treat it like a document link.</>,
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 flex size-5 shrink-0 items-center justify-center border-2 border-text bg-accent font-mono text-[10px] font-black" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="text-text-secondary [&_b]:text-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* request diagram */}
          <figure className={`border-2 border-text bg-white p-5 sm:p-6 ${shadowLg}`}>
            <figcaption className="mb-4 font-mono text-xs font-bold tracking-widest text-text-secondary uppercase">What a share link sends</figcaption>
            <div className="border-2 border-text bg-secondary-gray p-3">
              <LinkAnatomy />
            </div>
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 font-mono text-xs sm:gap-3">
              <div className="border-2 border-text bg-accent p-3 text-center font-bold">
                Your browser
                <span className="mt-1 block text-[10px] font-normal">decodes the # part</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px]" aria-hidden="true">
                <span className="whitespace-nowrap">/timeline?view=1</span>
                <svg viewBox="0 0 60 12" className="w-12 sm:w-16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M0 6h56M50 1l6 5-6 5" /></svg>
                <span className="whitespace-nowrap text-red-700 line-through decoration-2">#H4sI…</span>
              </div>
              <div className="border-2 border-text bg-white p-3 text-center font-bold">
                Server
                <span className="mt-1 block text-[10px] font-normal">sees only the page</span>
              </div>
            </div>
            <p className="sr-only">The browser asks the server only for the page path. The part after the hash, which holds the timeline, is never sent.</p>
          </figure>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-6 border-b-2 border-text bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
          <SectionHead n="07" kicker="FAQ" title="Questions, answered." />
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className={`group border-2 border-text bg-bg open:bg-white ${shadow}`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-heading text-lg font-black tracking-tight focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-text [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex size-7 shrink-0 items-center justify-center border-2 border-text bg-accent font-mono text-lg leading-none transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="border-t-2 border-text px-5 py-4 leading-relaxed text-text-secondary [&_b]:text-text">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-accent">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-15">
          <div className="absolute top-8 left-[-5%] h-10 w-[45%] border-2 border-text bg-white" />
          <div className="absolute top-24 left-[30%] h-10 w-[40%] border-2 border-text bg-text" />
          <div className="absolute bottom-10 right-[-5%] h-10 w-[50%] border-2 border-text bg-white" />
          <div className="absolute inset-y-0 left-[62%] w-1 bg-red-600" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-end md:justify-between md:py-28">
          <h2 className="max-w-3xl text-5xl leading-[0.95] font-black tracking-tighter text-balance md:text-7xl">
            Stop guessing who&apos;s running when.
          </h2>
          <a
            href="/timeline"
            className="inline-flex shrink-0 items-center justify-center gap-2 border-2 border-text bg-text px-6 py-3 font-heading text-lg font-black tracking-tight text-accent uppercase shadow-[6px_6px_0_var(--color-primary-white)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-primary-white)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-text"
          >
            Open the timeline <Arrow />
          </a>
        </div>
      </section>
    </div>
  );
}
