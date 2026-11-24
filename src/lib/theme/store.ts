/**
 * Where the theme lives. The single source of truth is the `data-theme`
 * attribute on <html>: CSS reads it, React subscribes to it, and the saved
 * choice in localStorage only decides what it is set to.
 *
 * Nothing here touches the DOM when imported, so it is safe to import from
 * server code (the no-flash script does, for the storage key).
 */

export type Theme = "light" | "dark";
export type Point = { x: number; y: number };

export const THEME_KEY = "anas-theme";

const root = () => document.documentElement;
const prefersDark = () => matchMedia("(prefers-color-scheme: dark)");

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null; // storage blocked (private mode): the choice just won't persist
  }
}

/** The theme on screen right now. */
export const currentTheme = (): Theme => (root().dataset.theme === "dark" ? "dark" : "light");

/** Points the attribute at the saved choice, or at the system setting when there isn't one. */
function syncWithSettings() {
  const theme = savedTheme() ?? (prefersDark().matches ? "dark" : "light");
  if (theme !== currentTheme()) root().dataset.theme = theme;
}

/** For useSyncExternalStore: tells React when the theme changes, and keeps it in step with the system and other tabs. */
export function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme"] });
  const system = prefersDark();
  system.addEventListener("change", syncWithSettings);
  window.addEventListener("storage", syncWithSettings);
  return () => {
    observer.disconnect();
    system.removeEventListener("change", syncWithSettings);
    window.removeEventListener("storage", syncWithSettings);
  };
}

/**
 * Switches theme and remembers the choice. Unless the user prefers reduced
 * motion, the new theme grows out of `origin` as a circle and sweeps across the
 * screen (see "Theme switch" in globals.css); without an origin it grows from
 * the middle of the viewport.
 */
export function toggleTheme(origin?: Point) {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  const apply = () => {
    root().dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* see savedTheme */
    }
  };

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();

  if (document.startViewTransition) {
    const { x, y } = origin ?? { x: innerWidth / 2, y: innerHeight / 2 };
    // Radius that reaches the corner furthest from the origin
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root().style.setProperty("--tx", `${x}px`);
    root().style.setProperty("--ty", `${y}px`);
    root().style.setProperty("--tr", `${radius}px`);
    root().classList.add("theme-reveal");
    const transition = document.startViewTransition(apply);
    // A resize mid-switch aborts the animation (the theme still changes); swallow that rejection.
    transition.ready.catch(() => {});
    transition.finished.catch(() => {}).finally(() => root().classList.remove("theme-reveal"));
    return;
  }

  // No View Transitions (older Firefox): a short cross-fade instead
  root().classList.add("theme-fade");
  apply();
  setTimeout(() => root().classList.remove("theme-fade"), 250);
}
