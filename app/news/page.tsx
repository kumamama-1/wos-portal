import Link from "next/link";
import { getAllNews } from "@/lib/news";

export default function NewsPage() {
  const news = getAllNews();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold">ニュース一覧</h1>

      <div className="mt-6 space-y-4">
        {news.length === 0 && <p className="text-sm text-gray-500">まだ記事がありません。</p>}
        {news.map((item) => (
          <Link
            key={item.slug}
            href={`/news/${item.slug}`}
            className="block rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-sm"
          >
            <p className="text-xs text-gray-400">{item.date}</p>
            <p className="mt-1 font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-gray-500">{item.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
