"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Book, Home, LayoutGrid } from "lucide-react";

const routes = [
  { href: "/", label: "Home", note: "Start over", icon: Home },
  { href: "/projects", label: "Projects", note: "Things I've built", icon: LayoutGrid },
  { href: "/blog", label: "Blog", note: "Things I've learned", icon: Book },
];

const shadow = "shadow-[4px_4px_0_var(--color-primary-black)]";
const press =
  "transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-primary-black)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-text";

export default function NotFound() {
  const path = usePathname();

  return (
    <section
      className="flex flex-1 items-center overflow-x-clip px-6 py-16"
      style={{
        backgroundImage: "linear-gradient(rgba(15,15,15,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,15,15,.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <div className="mx-auto grid w-full max-w-5xl items-center gap-12 md:grid-cols-[1.1fr_1fr]">
        {/* The crumpled "page" */}
        <div className="relative mx-auto w-full max-w-sm md:order-2" aria-hidden>
          <div className="relative rotate-[-4deg] border-2 border-text bg-surface p-6 shadow-[10px_10px_0_var(--color-primary-black)]">
            <div className="mb-4 flex items-center gap-1.5 border-b-2 border-text pb-3">
              <span className="size-3 rounded-full border-2 border-text bg-red-500" />
              <span className="size-3 rounded-full border-2 border-text bg-accent" />
              <span className="size-3 rounded-full border-2 border-text bg-emerald-400" />
              <span className="ml-2 truncate font-mono text-xs text-text-secondary">{path}</span>
            </div>
            <p className="font-heading text-[7rem] font-black leading-[0.8] tracking-tighter sm:text-[8.5rem]">
              4<span className="inline-block rotate-12 text-accent [-webkit-text-stroke:3px_var(--color-text)]">0</span>4
            </p>
            {/* crumple creases */}
            <svg viewBox="0 0 300 120" className="mt-4 h-20 w-full text-text/25">
              <path d="M0 30 L70 55 L130 20 L190 70 L250 35 L300 60" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M0 85 L60 70 L120 100 L180 80 L240 105 L300 90" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M70 55 L60 70 M190 70 L180 80 M130 20 L120 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
          </div>
          <span className={`absolute -right-3 -top-4 rotate-6 border-2 border-text bg-accent px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest ${shadow}`}>
            Crumpled
          </span>
        </div>

        {/* Message */}
        <div className="min-w-0 text-center md:order-1 md:text-left">
          <p className="mb-4 inline-block border-2 border-text bg-surface px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-[0.2em]">
            Error 404 · Page not found
          </p>
          <h1 className="font-heading text-5xl font-black leading-[0.95] tracking-tighter md:text-7xl">
            This page got crumpled.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-text-secondary md:mx-0">
            Nothing lives at <code className="break-all rounded-sm bg-surface px-1.5 py-0.5 font-mono text-base text-text">{path}</code>. It may have
            moved, or the link has a typo. Try one of these instead:
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {routes.map(({ href, label, note, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className={`group flex h-full flex-col gap-2 border-2 border-text bg-surface p-4 text-left ${shadow} ${press} hover:bg-accent`}>
                  <Icon size={20} />
                  <span className="flex items-center justify-between font-heading text-lg font-black uppercase tracking-tight">
                    {label}
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="text-sm text-text-secondary group-hover:text-text">{note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
