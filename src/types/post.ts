export interface PostMetadata {
  title: string;
  date: string;
  description: string;
  tags: string[];
  coverImage?: string;
  author?: string;
  time?: number;
  slug: string;
}

export interface Post {
  metadata: PostMetadata;
  content: string;
}
