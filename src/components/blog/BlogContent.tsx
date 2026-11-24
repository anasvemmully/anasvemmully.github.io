"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Fuse from "fuse.js";
import { ArrowUpRight, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { PostMetadata } from "@/types/post";

/** Posts per page, counting the feature post on the first page. */
const POSTS_PER_PAGE = 12;
/** The search box only appears once there are this many posts. */
const SEARCH_MIN_POSTS = 8;

const SHADOW = "shadow-[8px_8px_0_var(--color-shadow)]";
const PRESS =
  "transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_var(--color-shadow)]";

/** "29 Apr 2026". Fixed locale and time zone, so server and browser agree. */
function formatDate(date: string) {
  const parsed = new Date(date);
  if (!date || Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Date and reading time: on one line by default, or stacked in the list's narrow column. */
function Meta({ post, stacked = false }: { post: PostMetadata; stacked?: boolean }) {
  return (
    <p className="font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">
      <span className={stacked ? "block" : undefined}>{formatDate(post.date)}</span>
      {post.time ? (
        <span className={stacked ? "mt-1 block" : undefined}>
          {stacked ? "" : " · "}
          {post.time} min read
        </span>
      ) : null}
    </p>
  );
}

function Tags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li
          key={tag}
          className="bg-tag-bg px-2 py-1 text-xs font-bold uppercase tracking-widest text-tag-text"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** The newest post, shown large at the top. */
function FeaturedPost({ post, latest }: { post: PostMetadata; latest: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group grid border-4 border-text bg-surface md:grid-cols-2 ${SHADOW} ${PRESS}`}
    >
      <div className="relative min-h-56 border-b-4 border-text bg-accent md:min-h-80 md:border-b-0 md:border-r-4">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 560px, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-8">
        {latest && (
          <span className="w-fit border-2 border-text bg-accent px-2 py-0.5 font-mono text-on-accent text-xs font-bold uppercase tracking-widest">
            Latest
          </span>
        )}
        <Meta post={post} />
        <h2 className="font-heading text-3xl font-black leading-tight tracking-tight md:text-4xl">
          {post.title}
        </h2>
        {post.description && (
          <p className="line-clamp-3 text-base leading-relaxed text-text-secondary">
            {post.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
          <Tags tags={post.tags} />
          <span className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest transition-all group-hover:gap-2">
            Read post <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** One post in the list: date, title and description, and a small thumbnail. */
function PostRow({ post }: { post: PostMetadata }) {
  return (
    <li>
      <Link
        href={`/blog/${post.slug}`}
        className="group grid gap-3 py-7 transition-colors hover:bg-surface md:grid-cols-[10rem_1fr_9rem] md:gap-8 md:px-4"
      >
        <Meta post={post} stacked />

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-2xl font-black leading-tight tracking-tight decoration-4 underline-offset-4 group-hover:underline group-hover:decoration-accent">
            {post.title}
          </h3>
          {post.description && (
            <p className="line-clamp-2 text-base leading-relaxed text-text-secondary">
              {post.description}
            </p>
          )}
          <Tags tags={post.tags} />
        </div>

        {post.coverImage && (
          <div className="relative hidden aspect-[4/3] border-2 border-text md:block">
            <Image src={post.coverImage} alt="" fill sizes="144px" className="object-cover" />
          </div>
        )}
      </Link>
    </li>
  );
}

export default function BlogContent({ allPosts }: { allPosts: PostMetadata[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Tag filters only make sense once there is more than one tag to pick from
  const allTags = useMemo(
    () => Array.from(new Set(allPosts.flatMap((post) => post.tags))).sort(),
    [allPosts],
  );
  const showTags = allTags.length >= 2;
  const showSearch = allPosts.length >= SEARCH_MIN_POSTS;

  const fuse = useMemo(
    () => new Fuse(allPosts, { keys: ["title", "description", "tags"], threshold: 0.3 }),
    [allPosts],
  );

  const posts = useMemo(() => {
    const matches = query ? fuse.search(query).map((result) => result.item) : allPosts;
    return activeTag ? matches.filter((post) => post.tags.includes(activeTag)) : matches;
  }, [query, activeTag, allPosts, fuse]);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const pagePosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  // The feature slot is the first post of the first page; later pages are plain lists
  const featured = page === 1 ? pagePosts[0] : undefined;
  const rows = featured ? pagePosts.slice(1) : pagePosts;

  const filtered = query !== "" || activeTag !== null;
  const reset = () => {
    setQuery("");
    setActiveTag(null);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-5xl font-black uppercase leading-none tracking-tighter text-text md:text-7xl">
            Blog
          </h1>
          <p className="mt-4 max-w-xl text-base font-medium text-text-secondary md:text-lg">
            Notes on building software, and what I learn along the way.
          </p>
        </div>

        {showSearch && (
          <div className="relative w-full md:max-w-sm">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-text-secondary">
              <Search size={18} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search posts"
              aria-label="Search posts"
              className="w-full border-4 border-text bg-surface py-3 pl-11 pr-4 font-bold shadow-[4px_4px_0_var(--color-shadow)] outline-none transition-all placeholder:font-medium placeholder:text-text-secondary/60 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0_var(--color-shadow)]"
            />
          </div>
        )}
      </header>

      {showTags && (
        <ul className="flex flex-wrap gap-2" aria-label="Filter by tag">
          {[null, ...allTags].map((tag) => (
            <li key={tag ?? "all"}>
              <button
                type="button"
                onClick={() => {
                  setActiveTag(tag);
                  setPage(1);
                }}
                aria-pressed={activeTag === tag}
                className={`border-2 border-text px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTag === tag
                    ? "bg-tag-bg text-tag-text"
                    : "bg-surface hover:bg-accent hover:text-on-accent"
                }`}
              >
                {tag ?? "All"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {posts.length > 0 ? (
        <>
          {featured && <FeaturedPost post={featured} latest={!filtered} />}

          {rows.length > 0 && (
            <ul className="divide-y-2 divide-text border-y-2 border-text">
              {rows.map((post) => (
                <PostRow key={post.slug} post={post} />
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="border-4 border-text bg-surface p-3 shadow-[4px_4px_0_var(--color-shadow)] transition-colors hover:bg-accent hover:text-on-accent disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-mono text-sm font-bold">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="border-4 border-text bg-surface p-3 shadow-[4px_4px_0_var(--color-shadow)] transition-colors hover:bg-accent hover:text-on-accent disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="border-4 border-dashed border-text bg-surface px-6 py-16 text-center">
          <p className="text-xl font-bold text-text-secondary">
            {filtered ? "No posts match that." : "No posts yet. Check back soon."}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={reset}
              className="mt-4 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-widest underline underline-offset-4"
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
