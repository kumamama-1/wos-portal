import type { Suggestion } from "@/lib/todo/types";

const LEVEL_STYLES: Record<Suggestion["level"], { icon: string; border: string; bg: string; text: string }> = {
  warning: { icon: "⚠️", border: "border-[#fab219]/50", bg: "bg-[#fab219]/10", text: "text-[#8a5a00]" },
  info: { icon: "💡", border: "border-[#2a78d6]/30", bg: "bg-[#2a78d6]/5", text: "text-[#184f95]" },
  good: { icon: "✅", border: "border-[#0ca30c]/30", bg: "bg-[#0ca30c]/5", text: "text-[#006300]" },
};

export function MorningSuggestionCard({ suggestions }: { suggestions: Suggestion[] }) {
  if (suggestions.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          🌅
        </span>
        <h2 className="text-sm font-bold text-slate-900">今日のおすすめ</h2>
      </div>
      <ul className="mt-3 space-y-2">
        {suggestions.map((s) => {
          const style = LEVEL_STYLES[s.level];
          return (
            <li
              key={s.id}
              className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm leading-relaxed ${style.border} ${style.bg} ${style.text}`}
            >
              <span aria-hidden>{style.icon}</span>
              <span>{s.text}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
