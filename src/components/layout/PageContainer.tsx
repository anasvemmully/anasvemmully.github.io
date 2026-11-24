import type { ElementType, ReactNode } from "react";

/**
 * The standard page column: the same max width and side gutters as the header
 * and footer, so every page lines up with the logo.
 *
 * `w-full` matters: <main> is a flex column, where `mx-auto` alone would
 * shrink the container to its content and push it off the header's edge.
 */
export default function PageContainer({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={`mx-auto w-full max-w-6xl px-6 py-14 md:py-20 ${className}`}>{children}</Tag>
  );
}
