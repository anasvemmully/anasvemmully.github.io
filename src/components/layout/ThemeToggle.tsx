"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

/**
 * Light/dark switch for the header: just an icon (a sun in dark mode, a moon in
 * light mode, showing where a click takes you). The new theme grows out of it.
 */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={(e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        toggle({ x: left + width / 2, y: top + height / 2 });
      }}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="inline-flex size-9 shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-text"
    >
      {/* Swapped with CSS, not with `theme`, so the right icon is there on first paint */}
      <Moon size={18} aria-hidden className="dark:hidden" />
      <Sun size={18} aria-hidden className="hidden dark:block" />
    </button>
  );
}
