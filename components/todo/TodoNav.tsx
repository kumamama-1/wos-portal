"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { lock } from "@/lib/todo/passcodeStore";

const NAV_ITEMS = [
  { href: "/todo", label: "ホーム" },
  { href: "/todo/report", label: "レポート" },
];

export function TodoNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/todo" className="flex items-center gap-1.5 text-base font-bold text-slate-900">
          <span aria-hidden>✅</span> ToDo
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                pathname === item.href ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={lock}
            aria-label="ロックする"
            className="ml-1 rounded-lg px-2 py-1.5 text-sm text-slate-400 hover:bg-slate-100"
          >
            🔒
          </button>
        </nav>
      </div>
    </header>
  );
}
