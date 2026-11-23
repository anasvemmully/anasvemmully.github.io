import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Window Timeline",
  description: "Plan and share multi-team job windows on a zoomable swimlane timeline. Everything lives in the link.",
  // Shared links (?view=1#data) all point back to the tool itself.
  alternates: { canonical: "/timeline" },
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
