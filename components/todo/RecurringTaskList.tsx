"use client";

import { useState } from "react";
import { useTodo } from "./TodoProvider";
import { weekdayLabel } from "@/lib/todo/date";
import type { Priority, RecurrenceFrequency, RecurringTask } from "@/lib/todo/types";

const PRIORITY_LABEL: Record<Priority, string> = { high: "高", normal: "中", low: "低" };
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

function RecurringItem({ task }: { task: RecurringTask }) {
  const { updateRecurringTask, toggleRecurringActive, deleteRecurringTask } = useTodo();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(task.frequency);
  const [weekday, setWeekday] = useState(task.weekday ?? 1);
  const [priority, setPriority] = useState<Priority>(task.priority);

  function save() {
    if (!title.trim()) return;
    updateRecurringTask(task.id, {
      title: title.trim(),
      frequency,
      weekday: frequency === "weekly" ? weekday : null,
      priority,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-blue-300 bg-blue-50/40 p-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
          autoFocus
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={() => setFrequency("daily")}
              className={`px-2 py-1 text-xs ${frequency === "daily" ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}
            >
              毎日
            </button>
            <button
              type="button"
              onClick={() => setFrequency("weekly")}
              className={`px-2 py-1 text-xs ${frequency === "weekly" ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}
            >
              毎週
            </button>
          </div>
          {frequency === "weekly" && (
            <select
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
            >
              {WEEKDAYS.map((d) => (
                <option key={d} value={d}>
                  {weekdayLabel(d)}曜日
                </option>
              ))}
            </select>
          )}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
          >
            <option value="high">優先度: 高</option>
            <option value="normal">優先度: 中</option>
            <option value="low">優先度: 低</option>
          </select>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
            >
              保存
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        task.active ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${task.active ? "text-slate-900" : "text-slate-400"}`}>{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
            {task.frequency === "daily" ? "🔁 毎日" : `🔁 毎週${weekdayLabel(task.weekday ?? 0)}曜日`}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
            {PRIORITY_LABEL[task.priority]}
          </span>
          {!task.active && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-500">停止中</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => toggleRecurringActive(task.id)}
          className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          {task.active ? "一時停止" : "再開"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          編集
        </button>
        <button
          type="button"
          onClick={() => deleteRecurringTask(task.id)}
          className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-500"
        >
          削除
        </button>
      </div>
    </li>
  );
}

export function RecurringTaskList() {
  const { recurringTasks } = useTodo();

  if (recurringTasks.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
        まだ繰り返しタスクはありません。上のフォームから追加しましょう。
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {recurringTasks.map((t) => (
        <RecurringItem key={t.id} task={t} />
      ))}
    </ul>
  );
}
