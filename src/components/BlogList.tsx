"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grain } from "@/components/Grain";
import { TagPill } from "@/components/TagPill";
import { urlFor } from "@/sanity/lib/image";
import { TAG_LABELS, type PostSummary, type Tag } from "@/sanity/lib/queries";

const ALL_TAGS = Object.keys(TAG_LABELS) as Tag[];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogList({ posts }: { posts: PostSummary[] }) {
  const [activeTag, setActiveTag] = useState<Tag | "all">("all");

  const filtered = useMemo(
    () =>
      activeTag === "all"
        ? posts
        : posts.filter((post) => post.tags?.includes(activeTag)),
    [posts, activeTag]
  );

  const [featured, ...rest] = filtered;

  return (
    <>
      <div className="relative overflow-hidden bg-ink px-[5vw] pt-[64px] pb-[40px] text-bone md:pt-[100px] md:pb-[48px]">
        <Grain frequency={0.85} opacity={0.06} />
        <div
          className="pointer-events-none absolute -top-[140px] -right-[100px] h-[420px] w-[420px] rounded-full opacity-70"
          style={{ background: "radial-gradient(circle, rgba(232,80,58,0.28), transparent 70%)" }}
        />
        <div className="relative">
          <h1 className="m-0 text-[clamp(28px,3.6vw,44px)] leading-[0.96] tracking-[-0.03em] font-bold">
            Blog
          </h1>
          <p className="mt-[12px] max-w-[52ch] text-[15px] leading-relaxed text-bone/70 md:text-[15.5px]">
            Product updates, design notes, and practical tips on gift cards and loyalty programs - from the team building Sense.
          </p>

          <div className="mt-[26px] flex flex-wrap gap-[8px]">
            <button
              type="button"
              onClick={() => setActiveTag("all")}
              className={`rounded-full border px-[15px] py-[8px] font-mono text-[11px] font-semibold tracking-[0.09em] uppercase transition-colors ${
                activeTag === "all"
                  ? "border-bone bg-bone text-ink"
                  : "border-bone/12 bg-bone/8 text-bone/65 hover:text-bone"
              }`}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`rounded-full border px-[15px] py-[8px] font-mono text-[11px] font-semibold tracking-[0.09em] uppercase transition-colors ${
                  activeTag === tag
                    ? "border-bone bg-bone text-ink"
                    : "border-bone/12 bg-bone/8 text-bone/65 hover:text-bone"
                }`}
              >
                {TAG_LABELS[tag]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-bone px-[5vw] py-[48px] text-ink md:py-[64px]">
        {!featured ? (
          <p className="text-[15px] text-ink/60">
            {activeTag === "all"
              ? "No posts yet - check back soon."
              : `No posts tagged "${TAG_LABELS[activeTag]}" yet.`}
          </p>
        ) : (
          <>
            <Link
              href={`/blog/${featured.slug}`}
              className="grid grid-cols-1 items-center gap-[28px] rounded-[20px] bg-ink/[.035] p-[20px] no-underline md:grid-cols-[1.15fr_1fr] md:gap-[36px] md:p-[28px]"
            >
              <div className="relative aspect-[1200/630] overflow-hidden rounded-[14px] bg-slate">
                <Image
                  src={urlFor(featured.coverImage).width(1200).height(630).url()}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div>
                {featured.tags && featured.tags.length > 0 && (
                  <div className="mb-[14px] flex flex-wrap gap-[8px]">
                    {featured.tags.map((tag) => (
                      <TagPill key={tag} tag={tag} />
                    ))}
                  </div>
                )}
                <h2 className="m-0 text-[clamp(22px,2.4vw,30px)] leading-[1.1] tracking-[-0.02em] font-bold text-ink">
                  {featured.title}
                </h2>
                <p className="mt-[12px] max-w-[44ch] text-[15px] leading-relaxed text-ink/70">
                  {featured.excerpt}
                </p>
                <span className="mt-[14px] block font-mono text-[11px] tracking-[0.14em] text-ink/45 uppercase">
                  {formatDate(featured.publishedAt)}
                </span>
              </div>
            </Link>

            {rest.length > 0 && (
              <div className="mt-[36px] grid grid-cols-1 gap-[26px] md:mt-[44px] md:grid-cols-3">
                {rest.map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug}`}
                    className="group block no-underline"
                  >
                    <div className="relative aspect-[1200/630] overflow-hidden rounded-[14px] bg-slate">
                      <Image
                        src={urlFor(post.coverImage).width(800).height(420).url()}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      {post.tags && post.tags.length > 0 && (
                        <div className="absolute top-[12px] left-[12px] flex flex-wrap gap-[6px]">
                          {post.tags.map((tag) => (
                            <TagPill key={tag} tag={tag} />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="mt-[14px] block font-mono text-[11px] tracking-[0.14em] text-ink/45 uppercase">
                      {formatDate(post.publishedAt)}
                    </span>
                    <h3 className="mt-[6px] text-[16px] leading-tight font-bold tracking-[-0.01em] text-ink">
                      {post.title}
                    </h3>
                    <p className="mt-[8px] text-[13.5px] leading-relaxed text-ink/65">
                      {post.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
