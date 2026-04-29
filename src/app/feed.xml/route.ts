import { getAllPosts } from "@/lib/posts";

export async function GET() {
  const posts = getAllPosts();
  const site_url = "https://anas.vemmully.in";

  const feedItems = posts.map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${site_url}/blog/${post.slug}</link>
      <guid isPermaLink="true">${site_url}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.description}]]></description>
      ${post.tags.map((tag) => `<category><![CDATA[${tag}]]></category>`).join("")}
    </item>
  `).join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Anas | Blog</title>
    <link>${site_url}</link>
    <description>Thoughts, tutorials, and insights from my journey as a developer.</description>
    <atom:link href="${site_url}/feed.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${feedItems}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
