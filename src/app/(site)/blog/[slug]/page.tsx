import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { postBySlugQuery, postSlugsQuery, type Post } from "@/sanity/lib/queries";
import { PostBody } from "@/components/PostBody";
import { ShareButtons } from "@/components/ShareButtons";
import { TagPill } from "@/components/TagPill";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(postSlugsQuery);
  return slugs.map(({ slug }) => ({ slug }));
}

async function getPost(slug: string) {
  return client.fetch<Post | null>(postBySlugQuery, { slug });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Page not found" };

  const imageUrl = urlFor(post.coverImage).width(1200).height(630).url();

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [imageUrl],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    url: postUrl,
    image: urlFor(post.coverImage).width(1200).height(630).url(),
  };

  return (
    <article className="bg-bone px-[5vw] py-[64px] text-ink md:py-[120px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[720px]">
        <Link
          href="/blog"
          className="mb-[20px] inline-flex items-center gap-[6px] font-mono text-[11px] tracking-[0.1em] text-ink/50 no-underline uppercase transition-colors hover:text-flame"
        >
          ← Blog
        </Link>
        {post.tags && post.tags.length > 0 && (
          <div className="mb-[14px] flex flex-wrap gap-[8px]">
            {post.tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        )}
        <span className="font-mono text-[11px] tracking-[0.14em] text-ink/45 uppercase">
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <h1 className="mt-[10px] text-[clamp(32px,5vw,52px)] leading-[1.02] tracking-[-0.03em] font-bold">
          {post.title}
        </h1>

        <div className="relative mt-[32px] aspect-[1200/630] overflow-hidden rounded-[16px] bg-slate">
          <Image
            src={urlFor(post.coverImage).width(1440).height(756).url()}
            alt=""
            fill
            priority
            sizes="(min-width: 800px) 720px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-[32px]">
          <PostBody value={post.body} />
        </div>

        <div className="mt-[40px] border-t border-ink/10 pt-[24px]">
          <ShareButtons url={postUrl} title={post.title} />
        </div>

        <Link
          href="/blog"
          className="mt-[28px] inline-flex items-center gap-[6px] font-mono text-[11px] tracking-[0.1em] text-ink/50 no-underline uppercase transition-colors hover:text-flame"
        >
          ← Back to Blog
        </Link>
      </div>
    </article>
  );
}
