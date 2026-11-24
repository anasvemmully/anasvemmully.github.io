import React from "react";
import Image from "next/image";
import Link from "next/link";
import YouTube from "./YouTube";
import Tweet from "./Tweet";
import AdBanner from "./AdBanner";
import ImageGallery from "./ImageGallery";

/**
 * Medium-style reading: a serif at 21px on a 1.58 line height, in a column of
 * about 680px. The serif itself is set on the post's column (see the post page).
 */
const BODY = "text-[1.3125rem] leading-[1.58] tracking-[-0.003em]";

/** Headings stay in the site's sans, plain and bold. */
const HEADING = "scroll-mt-24 font-heading font-bold tracking-tight text-text";

const LINK =
  "text-text underline decoration-1 underline-offset-[3px] transition-colors hover:text-text-secondary";

const MDXComponents = {
  img: (props: React.HTMLProps<HTMLImageElement>) => (
    <div className="my-10">
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <Image
        {...props}
        width={1200}
        height={675}
        className="h-auto w-full"
        alt={props.alt || "Blog image"}
        sizes="(max-width: 768px) 100vw, 680px"
      />
    </div>
  ),
  a: (props: React.HTMLProps<HTMLAnchorElement>) => {
    const href = props.href || "";
    if (href.startsWith("/") || href.startsWith("#")) {
      return <Link href={href} {...props} className={LINK} />;
    }
    return <a target="_blank" rel="noopener noreferrer" {...props} className={LINK} />;
  },
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 {...props} className={`${HEADING} mt-14 mb-4 text-[2.25rem] leading-[1.1]`} />
  ),
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2 {...props} className={`${HEADING} mt-14 mb-3 text-[2rem] leading-[1.15]`} />
  ),
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h3 {...props} className={`${HEADING} mt-12 mb-3 text-[1.75rem] leading-[1.2]`} />
  ),
  h4: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h4 {...props} className={`${HEADING} mt-10 mb-2 text-[1.375rem] leading-[1.25]`} />
  ),
  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p {...props} className={`mb-[1.38em] text-text/90 ${BODY}`} />
  ),
  ul: (props: React.HTMLProps<HTMLUListElement>) => (
    <ul
      {...props}
      className={`mb-[1.38em] list-disc space-y-3 pl-8 text-text/90 marker:text-text-secondary ${BODY}`}
    />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol
      {...props}
      className={`mb-[1.38em] list-decimal space-y-3 pl-8 text-text/90 marker:text-text-secondary ${BODY}`}
    />
  ),
  li: (props: React.HTMLProps<HTMLLIElement>) => <li {...props} className="pl-1" />,
  blockquote: (props: React.HTMLProps<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="my-10 border-l-[3px] border-text pl-6 text-[1.5rem] italic leading-[1.5] [&>p]:mb-0 [&>p]:text-[1em] [&>p]:leading-[inherit]"
    />
  ),
  // Medium's section break: three dots
  hr: () => (
    <div
      role="separator"
      className="my-14 text-center text-xl tracking-[0.6em] text-text-secondary"
    >
      •••
    </div>
  ),
  pre: (props: React.HTMLProps<HTMLPreElement>) => (
    <pre
      {...props}
      className="my-8 overflow-x-auto rounded-md bg-code-bg p-6 font-mono text-sm leading-relaxed text-white"
    />
  ),
  YouTube,
  Tweet,
  AdBanner,
  ImageGallery,
};

export default MDXComponents;
