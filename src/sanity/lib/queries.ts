import type { PortableTextBlock } from "next-sanity";
import type { SanityImageSource } from "@sanity/image-url";

export type Tag = "product" | "design" | "company" | "security" | "news" | "tips";

export const TAG_LABELS: Record<Tag, string> = {
  product: "Product",
  design: "Design",
  company: "Company",
  security: "Security",
  news: "News",
  tips: "Tips",
};

export type PostSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: SanityImageSource;
  publishedAt: string;
  tags: Tag[] | null;
};

export type Post = PostSummary & {
  body: PortableTextBlock[];
};

// Posts with a future "Published at" date stay hidden until that moment.
export const postsListQuery = `*[_type == "post" && publishedAt <= now()] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  tags
}`;

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug && publishedAt <= now()][0]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  tags,
  body
}`;

export const postSlugsQuery = `*[_type == "post" && publishedAt <= now()]{ "slug": slug.current }`;
