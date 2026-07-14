import Link from "next/link";
import { getAllNews } from "@/lib/news";

const TOOL_LINKS = [
  { href: "/tools/fire-crystal", title: "火晶精錬シミュレーター", desc: "FC6〜FC10の完了予定日を計算" },
  { href: "/tools/speedup", title: "加速アイテム計算機", desc: "建設・研究の必要数を計算" },
  { href: "/tools/resources", title: "資源計算機", desc: "木材・生肉・石炭・鉄鉱の必要数を計算" },
];

export default function HomePage() {
  const latestNews = getAllNews().slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-12">
        <h1 className="text-2xl font-bold">ホワイトアウト・サバイバル攻略ポータル</h1>
        <p className="mt-2 text-gray-600">
          資源計算・火晶シミュレーターなどの計算ツールと、最新情報をまとめて提供します。
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-bold">計算ツール</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TOOL_LINKS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-sm"
            >
              <p className="font-semibold">{tool.title}</p>
              <p className="mt-1 text-sm text-gray-500">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-bold">課金パーソナル診断</h2>
        <Link
          href="/advisor"
          className="inline-block rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-sm"
        >
          あなたに最適な課金パックを診断する →
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">最新ニュース</h2>
        <div className="space-y-3">
          {latestNews.length === 0 && <p className="text-sm text-gray-500">まだ記事がありません。</p>}
          {latestNews.map((item) => (
            <Link
              key={item.slug}
              href={`/news/${item.slug}`}
              className="block rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-sm"
            >
              <p className="text-xs text-gray-400">{item.date}</p>
              <p className="mt-1 font-semibold">{item.title}</p>
            </Link>
          ))}
        </div>
        <Link href="/news" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          ニュース一覧を見る →
        </Link>
      </section>
    </div>
  );
}
