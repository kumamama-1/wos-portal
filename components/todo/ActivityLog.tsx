import { formatDisplayDate, formatTime, formatWeekday, getAppDay } from "@/lib/todo/date";
import type { ActivityLogEntry } from "@/lib/todo/types";

const TYPE_META: Record<ActivityLogEntry["type"], { icon: string; label: string; color: string }> = {
  created: { icon: "📝", label: "追加", color: "text-slate-500" },
  completed: { icon: "✅", label: "完了", color: "text-[#006300]" },
  reopened: { icon: "↩️", label: "再開", color: "text-[#184f95]" },
  deleted: { icon: "🗑️", label: "削除", color: "text-slate-400" },
};

export function ActivityLog({ entries }: { entries: ActivityLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
        まだ活動記録がありません。
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">活動ログ</h3>
      <ul className="mt-3 divide-y divide-slate-100">
        {entries.slice(0, 100).map((entry) => {
          const meta = TYPE_META[entry.type];
          const day = getAppDay(new Date(entry.at));
          return (
            <li key={entry.id} className="flex items-center gap-3 py-2 text-sm">
              <span aria-hidden>{meta.icon}</span>
              <span className={`font-medium ${meta.color}`}>{meta.label}</span>
              <span className="min-w-0 flex-1 truncate text-slate-700">{entry.title}</span>
              <span className="shrink-0 text-xs text-slate-400">
                {formatDisplayDate(day)}({formatWeekday(day)}) {formatTime(entry.at)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
