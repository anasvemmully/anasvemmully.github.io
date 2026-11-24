import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import MDXComponents from "@/components/mdx/MDXComponents";
import Image from "next/image";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
import TableOfContents, { END_OF_POST_ID } from "@/components/mdx/TableOfContents";
import BlogAnimationWrapper from "@/components/blog/BlogAnimationWrapper";
import PageContainer from "@/components/layout/PageContainer";

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.mdx$/, ""),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      type: "article",
      publishedTime: post.metadata.date,
      authors: ["Anas"],
      images: post.metadata.coverImage ? [post.metadata.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const headings = Array.from(post.content.matchAll(/^(#{2,3})\s+(.+)$/gm)).map((match) => ({
    level: match[1].length,
    text: match[2].trim(),
    slug: match[2]
      .toLowerCase()
      .replace(/[^\w\- ]+/g, "")
      .replace(/\s+/g, "-"),
  }));

  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  const published = new Date(post.metadata.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <BlogAnimationWrapper>
      <PageContainer as="article">
        <header className="mb-14 max-w-4xl md:mb-16">
          <h1 className="font-heading text-[clamp(2.5rem,7vw,5rem)] font-black leading-[0.98] tracking-tighter text-balance text-text">
            {post.metadata.title}
          </h1>

          {/* The yellow tile, the site's own mark, divides the facts */}
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-base text-text-secondary">
            {post.metadata.author && (
              <>
                <span className="font-bold text-text">{post.metadata.author}</span>
                <span aria-hidden className="size-2 bg-accent" />
              </>
            )}
            <time dateTime={post.metadata.date}>{published}</time>
            <span aria-hidden className="size-2 bg-accent" />
            <span>{readTime} min read</span>
            {post.metadata.tags.map((tag) => (
              <span key={tag} className="bg-tag-bg px-2 py-1 text-xs font-bold text-tag-text">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {post.metadata.coverImage && (
          <div className="relative mb-16 h-[240px] w-full sm:h-[400px] md:mb-20 md:h-[500px]">
            <div className="absolute inset-0 translate-x-3 translate-y-3 bg-accent md:translate-x-4 md:translate-y-4" />
            <div className="relative h-full w-full border-2 border-border bg-surface">
              <Image
                src={post.metadata.coverImage}
                alt={post.metadata.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="relative grid grid-cols-1 gap-x-16 lg:grid-cols-[minmax(0,38rem)_1fr]">
          <div>
            <MDXRemote
              source={post.content}
              components={MDXComponents}
              options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
            />

            {/* End of the essay: the last tile, which also fills the reading tiles */}
            <div
              id={END_OF_POST_ID}
              className="mt-16 flex items-center gap-4 border-t border-border pt-8"
            >
              <span aria-hidden className="size-4 bg-accent" />
              <Link
                href="/blog"
                className="font-bold text-text underline decoration-accent decoration-[3px] underline-offset-4 transition-colors hover:bg-accent hover:text-on-accent"
              >
                All posts
              </Link>
            </div>
          </div>

          <TableOfContents headings={headings} />
        </div>
      </PageContainer>
    </BlogAnimationWrapper>
  );
}
