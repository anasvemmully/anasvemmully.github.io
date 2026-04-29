"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { PostMetadata } from "@/types/post";

const POSTS_PER_PAGE = 12; // Increased for better bento display

export default function BlogContent({ allPosts }: { allPosts: PostMetadata[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fuse = useMemo(() => {
    return new Fuse(allPosts, {
      keys: ["title", "description", "tags"],
      threshold: 0.3,
    });
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return allPosts;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, allPosts, fuse]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const currentPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter uppercase text-text">
          BLOG
        </h1>
        
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-4 flex items-center text-text-secondary z-10">
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery("")}
                className="hover:text-accent transition-colors"
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            ) : (
              <Search size={20} className="pointer-events-none" />
            )}
          </div>
          <input
            type="text"
            placeholder="SEARCH POSTS..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-4 bg-white border-4 border-text font-bold uppercase tracking-widest focus:outline-none focus:ring-0 focus:translate-x-1 focus:translate-y-1 shadow-[4px_4px_0_var(--color-primary-black)] transition-all placeholder:text-text-secondary/50"
          />
        </div>
      </div>

      {currentPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 auto-rows-[250px]">
            {/* Featured Post (Large) */}
            {currentPosts[0] && (
              <Link
                href={`/blog/${currentPosts[0].slug}`}
                className="group relative col-span-1 md:col-span-2 row-span-2 bento-card flex flex-col justify-end p-8 text-white overflow-hidden"
              >
                {currentPosts[0].coverImage ? (
                  <Image src={currentPosts[0].coverImage} alt={currentPosts[0].title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-deep-teal" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white">
                      {currentPosts[0].time} min read
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight uppercase leading-none">
                    {currentPosts[0].title}
                  </h2>
                </div>
              </Link>
            )}

            {/* Accent Post */}
            {currentPosts[1] && (
              <Link
                href={`/blog/${currentPosts[1].slug}`}
                className="group col-span-1 row-span-1 bento-card p-6 flex flex-col bg-accent text-text relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                  <ChevronRight size={20} />
                </div>
                <h3 className="text-xl md:text-2xl font-heading font-black tracking-tight uppercase leading-none mb-4">
                  {currentPosts[1].title}
                </h3>
                <p className="text-sm line-clamp-3 mt-auto font-medium text-black/70">
                  {currentPosts[1].description}
                </p>
              </Link>
            )}

            {/* Outline Post */}
            {currentPosts[2] && (
              <Link
                href={`/blog/${currentPosts[2].slug}`}
                className="group col-span-1 md:col-span-2 row-span-1 bento-card p-6 flex flex-col bg-surface border-2 border-border relative overflow-hidden"
              >
                <h3 className="text-xl md:text-2xl font-heading font-black tracking-tight uppercase leading-none text-text z-10">
                  {currentPosts[2].title}
                </h3>
                {currentPosts[2].coverImage && (
                  <Image src={currentPosts[2].coverImage} alt={currentPosts[2].title} width={128} height={128} className="absolute bottom-0 right-0 w-32 h-32 object-cover rounded-tl-full opacity-50 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            )}

            {/* Image Post */}
            {currentPosts[3] && (
              <Link
                href={`/blog/${currentPosts[3].slug}`}
                className="group relative col-span-1 md:col-span-2 row-span-1 bento-card flex flex-col justify-end p-6 text-white overflow-hidden"
              >
                {currentPosts[3].coverImage ? (
                  <Image src={currentPosts[3].coverImage} alt={currentPosts[3].title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-rosy-taupe" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="relative z-10">
                  <h3 className="text-lg font-heading font-black tracking-tight uppercase leading-tight">
                    {currentPosts[3].title}
                  </h3>
                </div>
              </Link>
            )}

            {/* Regular Posts */}
            {currentPosts.slice(4).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group col-span-1 md:col-span-2 row-span-1 bento-card p-6 flex items-center gap-6 bg-surface border border-border"
              >
                 {post.coverImage && (
                   <Image src={post.coverImage} alt={post.title} width={96} height={96} className="w-24 h-24 object-cover rounded-xl shrink-0" />
                 )}
                 <div className="flex flex-col gap-2">
                   <div className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                     {post.time} min read
                   </div>
                   <h3 className="text-xl font-heading font-black tracking-tight uppercase leading-tight group-hover:text-accent transition-colors">
                     {post.title}
                   </h3>
                 </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-3 border-4 border-text bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent transition-colors shadow-[4px_4px_0_var(--color-primary-black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-12 h-12 flex items-center justify-center border-4 border-text font-black transition-all shadow-[4px_4px_0_var(--color-primary-black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                      currentPage === num ? "bg-accent text-text" : "bg-white text-text hover:bg-surface"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-3 border-4 border-text bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent transition-colors shadow-[4px_4px_0_var(--color-primary-black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center border-4 border-dashed border-text bg-white">
          <p className="text-2xl font-black uppercase tracking-widest text-text-secondary">
            No posts match your search...
          </p>
          <button 
            onClick={() => setSearchQuery("")}
            className="mt-6 font-bold underline hover:text-accent transition-colors"
          >
            CLEAR SEARCH
          </button>
        </div>
      )}
    </div>
  );
}
