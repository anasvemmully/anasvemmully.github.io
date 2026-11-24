"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

/** Light/dark switch for the header. The new theme grows out of this button. */
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
      className="inline-flex size-9 items-center justify-center border-2 border-text text-text transition-colors hover:bg-accent hover:text-on-accent focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-text"
    >
      {/* Swapped with CSS, not with `theme`, so the right icon is there on first paint */}
      <Moon size={16} aria-hidden className="dark:hidden" />
      <Sun size={16} aria-hidden className="hidden dark:block" />
    </button>
  );
}
