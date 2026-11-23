/** A GitHub issue or pull request, as typed or pasted by a person. */
export function parseRef(input: string): { repo: string; num: number } | null {
  const s = input.trim();
  const m =
    s.match(/^([\w.-]+\/[\w.-]+)#(\d+)$/) ??
    s.match(/^https?:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/(?:pull|issues)\/(\d+)(?:[/?#].*)?$/);
  if (!m) return null;
  const num = Number(m[2]);
  return num > 0 ? { repo: m[1], num } : null;
}

/** GitHub redirects /issues/N to the pull request when N is a PR, so one URL serves both. */
export const refUrl = (repo: string, num: number) => `https://github.com/${repo}/issues/${num}`;

export const isHandle = (s: string) => /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(s);

export const avatarUrl = (gh: string, size = 64) => `https://github.com/${gh}.png?size=${size}`;
