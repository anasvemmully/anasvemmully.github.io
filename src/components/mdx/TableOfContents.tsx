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

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // We want to track which heading is currently visible near the top of the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -60% 0%", // Triggers when the heading is in the upper part of the screen
      }
    );

    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.slug);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden lg:block lg:col-span-4">
      <div className="sticky top-8 flex flex-col gap-4">
        <h3 className="text-accent text-sm font-bold uppercase tracking-widest">
          Table of Contents
        </h3>
        <div className="w-full h-1 bg-text/10 mb-4 overflow-hidden">
          <div className="w-1/3 h-full bg-accent" />
        </div>
        <ul className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.slug;
            return (
              <li
                key={index}
                className={`border-b border-border pb-4 transition-colors ${
                  heading.level === 3 ? "pl-6" : "pl-2 border-l-2"
                } ${isActive ? "border-l-text" : "border-l-transparent"}`}
              >
                <a
                  href={`#${heading.slug}`}
                  onClick={(e) => {
                    // Smooth scroll when clicking
                    e.preventDefault();
                    const element = document.getElementById(heading.slug);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                      // Also push to history without jumping
                      window.history.pushState(null, "", `#${heading.slug}`);
                    }
                  }}
                  className={`transition-colors font-mono text-sm uppercase tracking-wide block hover:text-text ${
                    isActive ? "text-text font-black" : "text-text-secondary font-medium"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
