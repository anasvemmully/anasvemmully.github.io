"use client";

import { useEffect, useState } from "react";

interface Heading {
  level: number;
  text: string;
  slug: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

/** The mark at the end of a post; once it scrolls into view the whole essay counts as read. */
export const END_OF_POST_ID = "end-of-post";

type TileState = "done" | "current" | "todo";

/**
 * Each section is a tile, like the tiles on the home page: green once you've
 * read past it, yellow while you're in it, pale while it's still ahead.
 */
const TILE: Record<TileState, string> = {
  done: "bg-[var(--ink-green-3)]",
  current: "bg-accent",
  todo: "bg-[var(--ink-green-0)] ring-1 ring-inset ring-border/30",
};

/** Where the reader is: the last section whose heading has passed the reading line, and whether they reached the end. */
function useReadingPosition(headings: Heading[]) {
  const [position, setPosition] = useState({ active: -1, finished: false });

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const readingLine = window.innerHeight * 0.35;
      let active = -1;
      headings.forEach((heading, i) => {
        const el = document.getElementById(heading.slug);
        if (el && el.getBoundingClientRect().top <= readingLine) active = i;
      });
      const end = document.getElementById(END_OF_POST_ID);
      const finished = !!end && end.getBoundingClientRect().top <= window.innerHeight * 0.9;
      setPosition((prev) =>
        prev.active === active && prev.finished === finished ? prev : { active, finished },
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  return position;
}

function tileState(i: number, active: number, finished: boolean): TileState {
  if (finished || i < active) return "done";
  return i === active ? "current" : "todo";
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const { active, finished } = useReadingPosition(headings);

  if (headings.length === 0) return null;

  const total = headings.length;
  const caption = finished
    ? `All ${total} sections read`
    : active < 0
      ? `${total} sections`
      : `Section ${active + 1} of ${total}`;
  const currentTitle = active >= 0 ? headings[active].text : "Start reading";

  const goTo = (slug: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(slug)
      ?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    window.history.pushState(null, "", `#${slug}`);
  };

  return (
    // On a phone this is a thin strip that sticks to the top; from lg up, a rail on the right
    <aside className="sticky top-0 z-20 order-first -mx-6 lg:static lg:order-none lg:mx-0 lg:justify-self-end">
      <div className="flex items-center gap-4 border-b border-border bg-bg/95 px-6 py-3 backdrop-blur lg:hidden">
        <div className="flex shrink-0 gap-1.5" aria-hidden>
          {headings.map((heading, i) => (
            <span
              key={heading.slug}
              className={`size-3 transition-colors duration-300 ${TILE[tileState(i, active, finished)]}`}
            />
          ))}
        </div>
        <span className="min-w-0 truncate text-sm font-medium text-text-secondary">
          {finished ? caption : currentTitle}
        </span>
      </div>

      <nav aria-label="Table of contents" className="sticky top-8 hidden w-64 lg:block">
        <p className="mb-4 text-sm font-medium text-text-secondary">{caption}</p>
        <ol className="flex flex-col">
          {headings.map((heading, i) => {
            const state = tileState(i, active, finished);
            return (
              <li key={heading.slug}>
                <a
                  href={`#${heading.slug}`}
                  onClick={goTo(heading.slug)}
                  aria-current={state === "current" ? "location" : undefined}
                  className={`group flex items-start gap-3 py-2 text-[0.95rem] leading-snug transition-colors ${
                    state === "current"
                      ? "font-bold text-text"
                      : "font-medium text-text-secondary hover:text-text"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-[0.28em] size-3.5 shrink-0 transition-colors duration-300 ${TILE[state]}`}
                  />
                  <span>{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
