import { getAllPosts } from "@/lib/posts";
import BlogContent from "@/components/blog/BlogContent";
import PageContainer from "@/components/layout/PageContainer";

export const metadata = {
  title: "Blog",
  description: "Thoughts on engineering, design, and building products.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <PageContainer>
      <BlogContent allPosts={posts} />
    </PageContainer>
  );
}
