"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
 * The 404 page, dressed as Chrome's "no internet" dinosaur screen. The art is
 * drawn as pixel grids ('#' = a pixel) and turned into SVG paths below, so
 * there is no image to load.
 */

const DINO = [
  "..........#########.",
  ".........###########",
  ".........###.#######",
  ".........###########",
  ".........###########",
  ".........###########",
  ".........######.....",
  ".........#####......",
  "#........#########..",
  "#.......###########.",
  "#......###########..",
  "##.....#########.#..",
  "###...##########....",
  "####.############...",
  "#################...",
  ".###############....",
  "..#############.....",
  "...###########......",
  "....#########.......",
  ".....###..###.......",
  ".....##...##........",
  ".....###..###.......",
];

const CACTUS = [
  "....##....",
  "...####...",
  "...####...",
  "#..####...",
  "#..####..#",
  "##.####..#",
  "##.####.##",
  ".#######.#",
  ".#######.#",
  "..#######.",
  "...####...",
  "...####...",
  "...####...",
  "...####...",
  "...####...",
  "...####...",
];

const CLOUD = [
  "......####......",
  "....########....",
  "..############..",
  "################",
  ".##############.",
];

/** Turns a pixel grid into one SVG path, merging each row's runs of pixels. */
function pixelPath(rows: string[], originX: number, originY: number) {
  let d = "";
  rows.forEach((row, y) => {
    for (const run of row.matchAll(/#+/g)) {
      d += `M${originX + run.index},${originY + y}h${run[0].length}v1h-${run[0].length}z`;
    }
  });
  return d;
}

// Scene layout, in pixels (one grid square = one unit of the 150×56 viewBox)
const GROUND_Y = 50;
const dinoPath = pixelPath(DINO, 18, GROUND_Y - DINO.length + 1);
const cactusPath = pixelPath(CACTUS, 104, GROUND_Y - CACTUS.length + 1);
const cloudPath =
  pixelPath(CLOUD, 78, 9) + pixelPath(CLOUD, 38, 18) + pixelPath(CLOUD, 128, 22);
// The horizon: a line with a few bumps and gaps, like the game's ground
const groundPath =
  `M0,${GROUND_Y}h150v1h-150z` +
  [9, 31, 58, 77, 99, 121, 141].map((x) => `M${x},${GROUND_Y + 2}h${2 + (x % 3)}v1h-${2 + (x % 3)}z`).join("");

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

      <div className="mx-auto w-full max-w-6xl px-6 text-center">
        {/* The scene, with the score in the corner like the game's */}
        <div className="mx-auto w-full max-w-2xl text-[#535353]">
          <p aria-hidden className="mb-2 text-right font-mono text-sm tracking-widest">
            HI 00404
          </p>
          <svg
            aria-hidden
            viewBox="0 0 150 56"
            shapeRendering="crispEdges"
            className="h-auto w-full"
            fill="currentColor"
          >
            <path d={cloudPath} fill="currentColor" opacity="0.35" />
            <path d={dinoPath} />
            <path d={cactusPath} />
            <path d={groundPath} />
          </svg>
        </div>

        <h1 className="mt-10 font-heading text-3xl font-bold tracking-tight text-text md:text-4xl">
          Page not found
        </h1>

        <p className="mx-auto mt-3 max-w-md text-lg text-text-secondary">
          There&apos;s nothing at{" "}
          <code className="font-mono [overflow-wrap:anywhere] text-base text-text">{path}</code>.
        </p>

        <nav aria-label="Other pages" className="mt-8">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-text-secondary">
            Try:
          </p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 font-mono text-sm font-bold uppercase tracking-widest">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`border-b-2 border-transparent pb-0.5 transition-colors hover:border-text hover:bg-accent ${focus}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-10 font-mono text-xs uppercase tracking-widest text-text-secondary/70">
          ERR_PAGE_NOT_FOUND
        </p>
      </div>
    </section>
  );
}
