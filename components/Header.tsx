"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "ホーム" },
  { href: "/news", label: "ニュース" },
  { href: "/tools", label: "ツール" },
  { href: "/advisor", label: "課金診断" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-base font-bold">
          WOS攻略ポータル
        </Link>

        {/* PC用ナビ */}
        <nav className="hidden gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-gray-700 hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* スマホ用ハンバーガーボタン */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md md:hidden"
          aria-label="メニューを開く"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className="text-xl">{isMenuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* スマホ用ドロップダウンメニュー */}
      {isMenuOpen && (
        <nav className="border-t border-gray-200 bg-white md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
