import { config, collection, fields } from "@keystatic/core";
import { block } from "@keystatic/core/content-components";

/**
 * The blog's editor, served at /keystatic. Posts stay plain MDX files in
 * `content/posts`, so nothing else about the site changes and there is no
 * database or hosted service to keep alive.
 *
 * - `npm run dev`: edits files on your machine directly (no login).
 * - Production: edits go to GitHub as commits, which Vercel then deploys. Only
 *   people with write access to the repo can save. See docs/blog-cms.md.
 *
 * Set NEXT_PUBLIC_KEYSTATIC_STORAGE=github to use GitHub mode in development
 * too, which is how the GitHub App is created the first time. (It has to be a
 * NEXT_PUBLIC_ variable because this file also runs in the browser.)
 */
const useGithub =
  process.env.NODE_ENV !== "development" || process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github";

export default config({
  storage: useGithub
    ? { kind: "github", repo: { owner: "anasvemmully", name: "anasvemmully.github.io" } }
    : { kind: "local" },

  ui: { brand: { name: "Anas · Blog" } },

  collections: {
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "content/posts/*",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "date"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({
          label: "Date",
          defaultValue: { kind: "today" },
          validation: { isRequired: true },
        }),
        description: fields.text({
          label: "Description",
          multiline: true,
          description:
            "One or two plain sentences, shown on the blog page and in search results. If you leave it empty, the start of the post is used.",
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        coverImage: fields.image({
          label: "Cover image",
          directory: "public/images/posts/cover",
          publicPath: "/images/posts/cover/",
        }),
        time: fields.integer({
          label: "Reading time (minutes)",
          description: "Optional. Leave empty to calculate it from the post.",
        }),
        author: fields.text({ label: "Author", defaultValue: "Anas" }),
        content: fields.mdx({
          label: "Post",
          components: {
            // Embeds a YouTube video: <YouTube id="..." />
            YouTube: block({
              label: "YouTube video",
              schema: {
                id: fields.text({
                  label: "Video ID",
                  description: "The part after v= in the YouTube link.",
                  validation: { isRequired: true },
                }),
              },
            }),
          },
        }),
      },
    }),
  },
});
