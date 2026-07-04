export default function Footer() {
    return (
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} WOS攻略ポータル</p>
          <p className="mt-1">
            本サイトは非公式のファンサイトです。ゲーム内容・データの正確性については保証いたしかねます。
          </p>
        </div>
      </footer>
    );
  }
  