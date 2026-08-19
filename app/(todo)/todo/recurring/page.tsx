"use client";

import { RecurringTaskForm } from "@/components/todo/RecurringTaskForm";
import { RecurringTaskList } from "@/components/todo/RecurringTaskList";

export default function TodoRecurringPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">定期タスクとは</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          ここに登録すると、毎日または指定した曜日になったときに自動で「今日のタスク」として追加されます。毎回手入力する必要はありません。
        </p>
      </section>

      <RecurringTaskForm />
      <RecurringTaskList />
    </div>
  );
}
