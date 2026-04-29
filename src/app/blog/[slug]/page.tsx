import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import MDXComponents from "@/components/mdx/MDXComponents";
import Image from "next/image";
import rehypeSlug from "rehype-slug";
import TableOfContents from "@/components/mdx/TableOfContents";
import BlogAnimationWrapper from "@/components/blog/BlogAnimationWrapper";

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

  const headings = Array.from(post.content.matchAll(/^(#{2,3})\s+(.+)$/gm)).map(match => ({
    level: match[1].length,
    text: match[2].trim(),
    slug: match[2].toLowerCase().replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-'),
  }));

  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <BlogAnimationWrapper>
      <article className="max-w-6xl mx-auto px-6 py-20">
        <header className="flex flex-col items-center text-center gap-6 mb-12 max-w-4xl mx-auto">

          <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter leading-[1.1] text-text">
            {post.metadata.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-text-secondary font-medium font-mono uppercase tracking-wider">
            <span>
              {new Date(post.metadata.date).toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
              }).replace(/\//g, '.')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{readTime} MIN READ</span>
          </div>
        </header>

        {post.metadata.coverImage && (
          <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden mb-20">
            <div className="absolute inset-0 bg-accent translate-x-4 translate-y-4" />
            <div className="relative w-full h-full border-2 border-text bg-surface">
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

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-8">
            <div className="prose prose-lg prose-slate max-w-none prose-headings:text-text prose-p:text-text-secondary prose-a:text-accent prose-strong:text-text">
              <MDXRemote 
                source={post.content} 
                components={MDXComponents} 
                options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }} 
              />
            </div>
          </div>
          
          <TableOfContents headings={headings} />
        </div>
      </article>
    </BlogAnimationWrapper>
  );
}
