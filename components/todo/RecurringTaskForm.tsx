"use client";

import { useState, type FormEvent } from "react";
import { useTodo } from "./TodoProvider";
import { weekdayLabel } from "@/lib/todo/date";
import type { Priority, RecurrenceFrequency } from "@/lib/todo/types";

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export function RecurringTaskForm() {
  const { addRecurringTask } = useTodo();
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("daily");
  const [weekday, setWeekday] = useState(1);
  const [priority, setPriority] = useState<Priority>("normal");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addRecurringTask({ title, frequency, weekday: frequency === "weekly" ? weekday : null, priority });
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="繰り返すタスクを入力…(例: 部屋の片付け)"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-slate-300">
          <button
            type="button"
            onClick={() => setFrequency("daily")}
            className={`px-3 py-1.5 text-xs font-medium ${
              frequency === "daily" ? "bg-blue-600 text-white" : "bg-white text-slate-600"
            }`}
          >
            毎日
          </button>
          <button
            type="button"
            onClick={() => setFrequency("weekly")}
            className={`px-3 py-1.5 text-xs font-medium ${
              frequency === "weekly" ? "bg-blue-600 text-white" : "bg-white text-slate-600"
            }`}
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
        <button
          type="submit"
          className="ml-auto rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
        >
          追加
        </button>
      </div>
    </form>
  );
}
