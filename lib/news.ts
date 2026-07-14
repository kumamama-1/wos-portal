import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const NEWS_DIR = path.join(process.cwd(), "content", "news");

export type NewsMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  pinned: boolean;
};

export type NewsArticle = NewsMeta & { html: string };

export function getAllNews(): NewsMeta[] {
  const files = fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith(".md"));
  const items = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(NEWS_DIR, filename), "utf-8");
    const { data } = matter(raw);
    return {
      slug,
      title: (data.title as string) ?? slug,
      date: (data.date as string) ?? "",
      summary: (data.summary as string) ?? "",
      pinned: Boolean(data.pinned),
    };
  });
  return items.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.date < b.date ? 1 : -1;
  });
}

export function getNewsBySlug(slug: string): NewsArticle | null {
  const filePath = path.join(NEWS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const html = marked.parse(content, { async: false }) as string;
  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? "",
    summary: (data.summary as string) ?? "",
    pinned: Boolean(data.pinned),
    html,
  };
}
