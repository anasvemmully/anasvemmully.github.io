"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/works", label: "Works" },
  { href: "/blog", label: "Blog" },
];

const focus =
  "focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-text";

export default function NotFound() {
  const path = usePathname();

  return (
    <section className="flex flex-1 items-center overflow-x-clip py-16">
      <title>Page not found | Anas</title>
      <style>{`
        @keyframes lost-dot {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-0.2em, -0.25em); }
          50% { transform: translate(-0.45em, 0.05em); }
          75% { transform: translate(-0.25em, 0.22em); }
        }
        .lost-dot { animation: lost-dot 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .lost-dot { animation: none; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-6xl px-6">
        <h1 className="font-heading font-black leading-none tracking-tighter text-[clamp(6rem,26vw,16rem)]">
          <span className="sr-only">404, page not found</span>
          <span aria-hidden className="flex items-center">
            <span>4</span>
            {/* The missing "0": an empty outline, with its dot wandering off */}
            <span className="relative mx-[0.08em] inline-block size-[0.62em] shrink-0 rounded-full border-[0.04em] border-dashed border-text/30">
              <span className="lost-dot absolute left-full top-1/2 -ml-[0.1em] -mt-[0.1em] size-[0.2em] rounded-full bg-accent shadow-[0_0_0_0.02em_var(--color-text)]" />
            </span>
            <span>4</span>
          </span>
        </h1>

        <p className="mt-8 max-w-md text-lg text-text-secondary">
          I looked everywhere, but there&apos;s nothing at{" "}
          <code className="font-mono [overflow-wrap:anywhere] text-base text-text">{path}</code>.
          The zero wandered off as well. Let&apos;s get you back somewhere real.
        </p>

        <nav aria-label="Other pages" className="mt-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-sm font-bold uppercase tracking-widest">
            {links.map(({ href, label }, i) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`border-b-2 pb-0.5 transition-colors hover:bg-accent ${focus} ${
                    i === 0 ? "border-text" : "border-transparent hover:border-text"
                  }`}
                >
                  {i === 0 ? `← ${label}` : label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
