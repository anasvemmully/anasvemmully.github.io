import { Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Scope Bricolage Grotesque to the blog by overriding the sans and heading
// font variables for everything below this wrapper. Mono/serif stay as-is.
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${bricolage.variable} flex flex-grow flex-col`}
      style={{
        ["--font-sans" as string]: "var(--font-bricolage), ui-sans-serif, system-ui, sans-serif",
        ["--font-heading" as string]: "var(--font-bricolage), ui-sans-serif, system-ui, sans-serif",
        fontFamily: "var(--font-sans)",
      }}
    >
      {children}
    </div>
  );
}
