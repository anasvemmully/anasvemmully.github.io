/**
 * Whether the blog editor at /keystatic should be available.
 *
 * - In development it always is (it edits the files on your machine).
 * - In production it only is once the GitHub App credentials are set. Without
 *   them the editor can't sign anyone in, and Keystatic would fail the build,
 *   so it stays switched off and /keystatic simply 404s.
 *
 * Server-only: it reads secrets that the browser never sees.
 */
export const cmsEnabled =
  process.env.NODE_ENV === "development" ||
  Boolean(
    process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
      process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
      process.env.KEYSTATIC_SECRET,
  );
