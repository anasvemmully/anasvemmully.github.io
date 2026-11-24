import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import MDXComponents from "@/components/mdx/MDXComponents";
import Image from "next/image";
import rehypeSlug from "rehype-slug";
import { Source_Serif_4 } from "next/font/google";
import BlogAnimationWrapper from "@/components/blog/BlogAnimationWrapper";
import PageContainer from "@/components/layout/PageContainer";

/** The reading face for the essay body: a text serif, like Medium's. Loaded only on post pages. */
const readingSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

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

          {/* Byline, Medium-style: avatar and name, then a quiet line of facts */}
          <div className="mt-8 flex items-center gap-3">
            <Image
              src="/images/avatar.png"
              alt=""
              width={44}
              height={44}
              className="size-11 rounded-full"
            />
            <div className="leading-snug">
              {post.metadata.author && (
                <p className="font-medium text-text">{post.metadata.author}</p>
              )}
              <p className="text-sm text-text-secondary">
                {readTime} min read · <time dateTime={post.metadata.date}>{published}</time>
              </p>
            </div>
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

        {/* The essay: a single centred column in a reading serif, like Medium */}
        <div className={`${readingSerif.className} mx-auto max-w-[42.5rem]`}>
          <MDXRemote
            source={post.content}
            components={MDXComponents}
            options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
          />
        </div>
      </PageContainer>
    </BlogAnimationWrapper>
  );
}
