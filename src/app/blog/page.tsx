import { getAllPosts } from "@/lib/posts";
import BlogContent from "@/components/blog/BlogContent";

export const metadata = {
  title: "Blog | Anas",
  description: "Thoughts on engineering, design, and building products.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <BlogContent allPosts={posts} />
    </div>
  );
}
