import type { Metadata, Viewport } from "next";
import "../globals.css";
import { PasscodeGate } from "@/components/todo/PasscodeGate";
import { TodoProvider } from "@/components/todo/TodoProvider";
import { TodoNav } from "@/components/todo/TodoNav";

export const metadata: Metadata = {
  title: "ToDo",
  description: "自分専用のToDoリスト。進捗をグラフで確認し、毎朝おすすめのタスクを提案します。",
  manifest: "/todo/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ToDo",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a78d6",
};

export default function TodoRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <PasscodeGate>
          <TodoProvider>
            <TodoNav />
            <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
          </TodoProvider>
        </PasscodeGate>
      </body>
    </html>
  );
}
