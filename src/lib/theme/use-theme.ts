"use client";

import { useSyncExternalStore } from "react";
import { currentTheme, subscribe, toggleTheme, type Point, type Theme } from "./store";

/**
 * The site's theme.
 *
 * - `theme` is what is on screen: the saved choice, else the system setting.
 *   On the server and during hydration it reads "light" and then corrects
 *   itself, so style things with CSS (the `dark:` variant or the color tokens)
 *   and use `theme` only when JavaScript needs to know, like a canvas.
 * - `toggle()` flips it and remembers the choice. Pass the point it should
 *   animate out from, such as the center of the button that was clicked.
 */
export function useTheme(): { theme: Theme; toggle: (origin?: Point) => void } {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light" as Theme);
  return { theme, toggle: toggleTheme };
}
