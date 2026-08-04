"use client";

import { useTodo } from "@/components/todo/TodoProvider";
import { WeeklyBarChart } from "@/components/todo/WeeklyBarChart";
import { ActivityLog } from "@/components/todo/ActivityLog";

export default function TodoReportPage() {
  const { dailyStats, log, todayProgress } = useTodo();

  const total14 = dailyStats.reduce((sum, d) => sum + d.completed, 0);

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">今日の達成率</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{todayProgress.rate}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">過去14日間の完了数</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{total14}件</p>
        </div>
      </section>

      <WeeklyBarChart data={dailyStats} />

      <ActivityLog entries={log} />
    </div>
  );
}
