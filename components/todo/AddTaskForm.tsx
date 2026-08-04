"use client";

import { useState, type FormEvent } from "react";
import { useTodo } from "./TodoProvider";
import type { Priority } from "@/lib/todo/types";

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "high", label: "優先度: 高" },
  { value: "normal", label: "優先度: 中" },
  { value: "low", label: "優先度: 低" },
];

export function AddTaskForm() {
  const { addTodo, today } = useTodo();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [hasDueDate, setHasDueDate] = useState(true);
  const [priority, setPriority] = useState<Priority>("normal");
  const [showDetail, setShowDetail] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTodo({ title, dueDate: hasDueDate ? dueDate : null, priority });
    setTitle("");
    setPriority("normal");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="新しいタスクを入力…"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          追加
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowDetail((v) => !v)}
        className="mt-2 text-xs text-slate-500 hover:text-blue-600"
      >
        {showDetail ? "詳細を閉じる" : "期限・優先度を設定する"}
      </button>

      {showDetail && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={hasDueDate}
              onChange={(e) => setHasDueDate(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            期限を設定
          </label>
          <input
            type="date"
            value={dueDate}
            disabled={!hasDueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-blue-500 disabled:opacity-40"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-blue-500"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </form>
  );
}
