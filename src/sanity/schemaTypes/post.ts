import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      description: "Short summary used on the blog list and in link previews.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Product", value: "product" },
          { title: "Design", value: "design" },
          { title: "Company", value: "company" },
          { title: "Security", value: "security" },
          { title: "News", value: "news" },
          { title: "Tips", value: "tips" },
        ],
      },
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      description:
        "Use 1200 x 630, or larger at the same shape (2400 x 1260 looks sharpest). It's shown uncropped on the blog, the post page, and in link previews when the post is shared. Other shapes get trimmed to fit - use the crop tool to choose what stays in frame.",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", media: "coverImage", subtitle: "excerpt" },
  },
});
