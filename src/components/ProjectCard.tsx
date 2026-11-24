import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type Project = {
  title: string;
  description: string;
  url: string;
  logo: { src: string; width: number; height: number };
  /** The site's own brand color, for the panel the logo sits on. */
  panel: string;
  /** Font classes for the title only, so the card's title wears the site's own font. */
  titleFont: string;
};

/**
 * A link card for a live site: its logo on its brand color, the title in that
 * site's font, then a plain description in this site's own font.
 */
export default function ProjectCard({ project }: { project: Project }) {
  const { title, description, url, logo, panel, titleFont } = project;

  return (
    <li className="group flex flex-col border-4 border-text bg-surface shadow-[8px_8px_0_var(--color-shadow)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_var(--color-shadow)]">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${title} in a new tab`}
        className="flex h-40 items-center justify-center border-b-4 border-text p-6"
        style={{ backgroundColor: panel }}
      >
        <Image
          src={logo.src}
          width={logo.width}
          height={logo.height}
          alt={`${title} logo`}
          sizes="(min-width: 1024px) 340px, (min-width: 768px) 45vw, 90vw"
          className="h-full w-full object-contain"
        />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h2 className={`${titleFont} leading-tight`}>{title}</h2>

        <p className="mt-4 text-base leading-relaxed text-text-secondary">{description}</p>

        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center gap-1 pt-8 text-sm font-bold uppercase tracking-widest transition-all hover:gap-2"
        >
          Visit project <ArrowUpRight size={16} />
        </Link>
      </div>
    </li>
  );
}
