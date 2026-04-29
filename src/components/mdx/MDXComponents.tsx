import React from "react";
import Image from "next/image";
import Link from "next/link";
import YouTube from "./YouTube";
import Tweet from "./Tweet";
import AdBanner from "./AdBanner";
import ImageGallery from "./ImageGallery";

const MDXComponents = {
  img: (props: React.HTMLProps<HTMLImageElement>) => (
    <div className="my-8 overflow-hidden border-4 border-text shadow-[6px_6px_0_var(--color-primary-black)]">
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
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      return <Link href={href} {...props} className="text-accent font-bold underline underline-offset-4 decoration-text hover:bg-accent hover:text-text transition-all" />;
    }
    return <a target="_blank" rel="noopener noreferrer" {...props} className="text-accent font-bold underline underline-offset-4 decoration-text hover:bg-accent hover:text-text transition-all" />;
  },
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => <h1 {...props} className="text-4xl font-bold mt-12 mb-6 tracking-tight text-text" />,
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => <h2 {...props} className="text-3xl font-bold mt-10 mb-4 tracking-tight text-text border-b-4 border-accent pb-2 inline-block" />,
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => <h3 {...props} className="text-2xl font-bold mt-8 mb-4 tracking-tight text-text" />,
  p: (props: React.HTMLProps<HTMLParagraphElement>) => <p {...props} className="leading-relaxed mb-6 text-text" />,
  ul: (props: React.HTMLProps<HTMLUListElement>) => <ul {...props} className="list-square pl-6 mb-6 space-y-2 text-text" />,
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => <ol {...props} className="list-decimal pl-6 mb-6 space-y-2 font-mono text-text" />,
  li: (props: React.HTMLProps<HTMLLIElement>) => <li {...props} className="leading-relaxed" />,
  blockquote: (props: React.HTMLProps<HTMLQuoteElement>) => (
    <blockquote {...props} className="border-l-8 border-accent bg-surface px-6 py-4 my-8 italic text-lg text-text font-serif shadow-[4px_4px_0_var(--color-primary-black)]" />
  ),
  hr: () => <hr className="my-12 border-t-4 border-dashed border-text" />,
  pre: (props: React.HTMLProps<HTMLPreElement>) => (
    <div className="my-8 overflow-hidden border-4 border-text shadow-[6px_6px_0_var(--color-primary-black)] bg-code-bg">
      <pre {...props} className="p-6 overflow-x-auto text-sm font-mono text-surface" />
    </div>
  ),
  YouTube,
  Tweet,
  AdBanner,
  ImageGallery,
};

export default MDXComponents;
