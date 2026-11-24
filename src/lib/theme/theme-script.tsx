import { THEME_KEY } from "./store";

/** Runs before the first paint: sets the saved theme, or the system's, so the page never flashes the wrong one. */
const script = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

/**
 * Render once inside <head> of the root layout, and put `suppressHydrationWarning`
 * on <html> (the script sets an attribute the server HTML doesn't have).
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
