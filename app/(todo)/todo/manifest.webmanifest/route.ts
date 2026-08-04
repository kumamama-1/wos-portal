import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "ToDo",
      short_name: "ToDo",
      description: "自分専用のToDoリスト。進捗をグラフで確認し、毎朝おすすめのタスクを提案します。",
      start_url: "/todo",
      scope: "/todo",
      display: "standalone",
      background_color: "#f8fafc",
      theme_color: "#2a78d6",
      icons: [{ src: "/todo-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
