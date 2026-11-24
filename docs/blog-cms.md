# Writing blog posts

Posts are plain MDX files in `content/posts/`. The editor at `/keystatic`
([Keystatic](https://keystatic.com)) is just a friendlier way to edit those
same files. There is no database and no hosted service: if you stopped using the
editor tomorrow, every post would still be a normal file in the repo.

## On your computer (works today)

```bash
npm run dev
```

Open <http://localhost:3000/keystatic>. Writing, editing and uploading cover
images change the files on disk directly. No login. Commit and push as usual.

## From any browser, including your phone (one-time setup)

In production the editor saves by committing to GitHub, and Vercel deploys that
commit. Until this setup is done, `/keystatic` returns a 404 on the live site,
so nothing is exposed and the site always builds.

1. **Create the GitHub App.** Run `NEXT_PUBLIC_KEYSTATIC_STORAGE=github npm run dev`
   and open <http://localhost:3000/keystatic>. It sends you to
   `http://127.0.0.1:3000/keystatic` (GitHub sign-in needs that address; this is
   expected). Click **Log in with GitHub**, which leads to the Keystatic Setup
   screen:
   - **Deployed App URL:** `https://anas.vemmully.in`
   - **GitHub organization:** leave blank (the app goes in your personal account)
   - Click **Create GitHub App**, confirm on GitHub, and you are sent back. Keystatic
     writes these secrets to a `.env` file in the project (it is git-ignored, never
     commit it):
     - `KEYSTATIC_GITHUB_CLIENT_ID`
     - `KEYSTATIC_GITHUB_CLIENT_SECRET`
     - `KEYSTATIC_SECRET`
     - `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
2. **Install the app on this repo** when GitHub offers (`anasvemmully/anasvemmully.github.io`).
3. **Check the callback URL** in the app's settings (GitHub → Settings → Developer
   settings → GitHub Apps → your app). It should include
   `https://anas.vemmully.in/api/keystatic/github/oauth/callback`. Add it if it is missing.
4. **Add the four variables to Vercel** (Project → Settings → Environment
   Variables, for Production and Preview), then redeploy.
5. Visit <https://anas.vemmully.in/keystatic> and sign in with GitHub. Only
   people with write access to the repo can save.

Each save is a commit to the repo, so Vercel redeploys the site after it, like
any other push. Keystatic can also save to a branch and open a pull request if
you would rather review posts before they go live.

## What the post fields do

| Field | Used for |
| --- | --- |
| Title | The post heading and its URL (the slug) |
| Date | Ordering, and the date shown on the blog page |
| Description | The summary on the blog page, in search, and in link previews. If empty, the start of the post is used |
| Tags | The filter chips on the blog page (shown once there are two or more tags) |
| Cover image | The picture on the blog page and at the top of the post. Saved to `public/images/posts/cover/` |
| Author | Shown on the post |
| Post | The article. A **YouTube video** block is available from the `+` menu |

The editor supports the usual formatting (headings, lists, links, quotes, code,
tables, images). Other custom blocks used by the site (`Tweet`, `ImageGallery`,
`AdBanner`) still render, but aren't in the editor's menu yet. Add them in
`keystatic.config.ts` if you start using them.
