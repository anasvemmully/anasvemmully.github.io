import React from "react";
import Image from "next/image";
import Link from "next/link";
import YouTube from "./YouTube";
import Tweet from "./Tweet";
import AdBanner from "./AdBanner";
import ImageGallery from "./ImageGallery";

/** Body copy: comfortable for long reading, at about 64 characters per line in the post column. */
const BODY = "text-[1.1875rem] leading-[1.8]";

/**
 * Section heading. The site's yellow tile hangs beside it, the same square that
 * marks the bullets, the numbered steps and the reading tiles in the contents.
 */
function Section({
  level,
  children,
  ...props
}: React.HTMLProps<HTMLHeadingElement> & { level: 2 | 3 }) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag
      {...props}
      className="mt-14 mb-5 flex scroll-mt-24 items-start gap-3 font-heading text-[1.75rem] font-black leading-tight tracking-tight text-text md:text-3xl"
    >
      <span aria-hidden className="mt-2 size-3 shrink-0 bg-accent md:mt-2.5 md:size-3.5" />
      <span>{children}</span>
    </Tag>
  );
}

const MDXComponents = {
  img: (props: React.HTMLProps<HTMLImageElement>) => (
    <div className="my-8 overflow-hidden border-4 border-border shadow-[6px_6px_0_var(--color-shadow)]">
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <Image
        {...props}
        width={1200}
        height={675}
        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
        alt={props.alt || "Blog image"}
        sizes="(max-width: 768px) 100vw, 720px"
      />
    </div>
  ),
  a: (props: React.HTMLProps<HTMLAnchorElement>) => {
    const href = props.href || "";
    if (href.startsWith("/") || href.startsWith("#")) {
      return (
        <Link
          href={href}
          {...props}
          className="font-bold text-text underline decoration-accent decoration-[3px] underline-offset-4 transition-colors hover:bg-accent hover:text-on-accent"
        />
      );
    }
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        {...props}
        className="font-bold text-text underline decoration-accent decoration-[3px] underline-offset-4 transition-colors hover:bg-accent hover:text-on-accent"
      />
    );
  },
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 {...props} className="text-4xl font-bold mt-12 mb-6 tracking-tight text-text" />
  ),
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => <Section level={2} {...props} />,
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => <Section level={3} {...props} />,
  h4: ({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) => {
    // "1. Try Before You Ask": a real sequence, so the number gets its own tile
    const first = React.Children.toArray(children)[0];
    const step = typeof first === "string" ? first.match(/^(\d+)\.\s+(.+)$/) : null;
    if (!step) {
      return (
        <h4
          {...props}
          className="mt-10 mb-3 font-heading text-xl font-black tracking-tight text-text"
        >
          {children}
        </h4>
      );
    }
    return (
      <h4
        {...props}
        className="mt-10 mb-3 flex items-center gap-4 scroll-mt-24 font-heading text-xl font-black leading-tight tracking-tight text-text"
      >
        <span className="grid size-10 shrink-0 place-items-center bg-accent text-lg text-on-accent">
          {step[1]}
        </span>
        <span>{step[2]}</span>
      </h4>
    );
  },
  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p {...props} className={`mb-6 text-text ${BODY}`} />
  ),
  ul: (props: React.HTMLProps<HTMLUListElement>) => (
    <ul
      {...props}
      className={`mb-6 list-[square] space-y-2 pl-6 text-text marker:text-accent ${BODY}`}
    />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol
      {...props}
      className={`mb-6 list-decimal space-y-2 pl-6 font-mono text-text marker:text-accent ${BODY}`}
    />
  ),
  li: (props: React.HTMLProps<HTMLLIElement>) => <li {...props} className="pl-1" />,
  blockquote: (props: React.HTMLProps<HTMLQuoteElement>) => (
    // The essay's thesis, stuck on like a sticker. Its <p> inherits the big serif size.
    <blockquote
      {...props}
      className="-mx-1 my-14 -rotate-1 border-4 border-on-accent bg-accent px-6 py-8 font-serif text-[clamp(1.875rem,5vw,2.75rem)] italic leading-[1.12] text-on-accent shadow-[8px_8px_0_var(--color-shadow)] md:-mx-4 md:px-10 md:py-10 [&>p]:m-0 [&>p]:text-[1em] [&>p]:leading-[inherit] [&>p]:text-on-accent"
    />
  ),
  hr: () => <hr className="my-12 border-t-4 border-dashed border-border" />,
  pre: (props: React.HTMLProps<HTMLPreElement>) => (
    <div className="my-8 overflow-hidden border-4 border-border shadow-[6px_6px_0_var(--color-shadow)] bg-code-bg">
      <pre {...props} className="p-6 overflow-x-auto text-sm font-mono text-white" />
    </div>
  ),
  YouTube,
  Tweet,
  AdBanner,
  ImageGallery,
};

export default MDXComponents;
