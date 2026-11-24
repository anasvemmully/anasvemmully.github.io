import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { PostMetadata } from "@/types/post";

const postsDirectory = path.join(process.cwd(), "content/posts");

function isoDate(value: unknown) {
  const date = value ? new Date(value as string | number | Date) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "";
}

/** The start of a post as plain text, cut at a word boundary, for posts with no description. */
function excerpt(content: string, maxLength = 160) {
  const text = content
    .replace(/^(```|~~~)[\s\S]*?^\1.*$/gm, " ")
    .replace(/^\s*(import|export)\s.*$/gm, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    .replace(/[#*`>~]/g, "")
    .replace(/(?<!\w)_|_(?!\w)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  let cut = text.slice(0, maxLength);
  // Only drop the last word when it was actually cut in half.
  if (/\S/.test(text[maxLength])) cut = cut.replace(/\s+\S*$/, "") || cut;
  return cut.replace(/[\s.,;:!?—-]+$/, "") + "…";
}

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".mdx"));
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);

  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  const metadata: PostMetadata = {
    ...data,
    slug: realSlug,
    date: isoDate(data.date),
    tags: data.tags || (data.tag ? [data.tag] : []),
    time: data.time || Math.ceil(stats.minutes),
    description: data.description || excerpt(content),
  } as PostMetadata;

  return { metadata, content };
}

export function getAllPosts(): PostMetadata[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug)?.metadata)
    .filter((post): post is PostMetadata => !!post)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
