"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

/**
 * Light/dark switch for the header: a pill with a yellow thumb that slides
 * between sun (light) and moon (dark). The new theme grows out of the thumb.
 */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Dark theme"
      title={`Switch to ${next} theme`}
      onClick={(e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        toggle({ x: left + width / 2, y: top + height / 2 });
      }}
      className="inline-flex h-8 w-15 shrink-0 items-center rounded-full border-2 border-border bg-surface p-0.5 transition-colors hover:border-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-text"
    >
      {/* Position and icon follow CSS (`dark:`), not `theme`, so they are right on first paint */}
      <span className="flex size-6 items-center justify-center rounded-full bg-accent text-on-accent transition-transform duration-200 ease-out motion-reduce:transition-none dark:translate-x-7">
        <Sun size={14} aria-hidden className="dark:hidden" />
        <Moon size={14} aria-hidden className="hidden dark:block" />
      </span>
    </button>
  );
}
