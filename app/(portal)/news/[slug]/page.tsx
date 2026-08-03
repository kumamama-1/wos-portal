import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/lib/news";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getNewsBySlug(slug);

  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs text-gray-400">{article.date}</p>
      <h1 className="mt-1 text-xl font-bold">{article.title}</h1>
      <div className="prose prose-sm mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: article.html }} />
    </div>
  );
}
