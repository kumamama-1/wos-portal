"use client";

import { useTodo } from "@/components/todo/TodoProvider";
import { AddTaskForm } from "@/components/todo/AddTaskForm";
import { TaskList } from "@/components/todo/TaskList";
import { ProgressRing } from "@/components/todo/ProgressRing";
import { MorningSuggestionCard } from "@/components/todo/MorningSuggestionCard";

export default function TodoHomePage() {
  const { todayProgress, suggestions } = useTodo();

  return (
    <div className="space-y-5">
      <section className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <ProgressRing rate={todayProgress.rate} done={todayProgress.done} total={todayProgress.total} />
        <div>
          <p className="text-sm font-bold text-slate-900">今日の達成率</p>
          <p className="mt-1 text-xs text-slate-500">
            {todayProgress.total === 0
              ? "今日が期限のタスクはありません"
              : `${todayProgress.done} / ${todayProgress.total} 件完了`}
          </p>
          {todayProgress.overdueCount > 0 && (
            <p className="mt-1 text-xs font-medium text-[#e34948]">期限切れが{todayProgress.overdueCount}件あります</p>
          )}
        </div>
      </section>

      <MorningSuggestionCard suggestions={suggestions} />

      <AddTaskForm />

      <TaskList />
    </div>
  );
}
