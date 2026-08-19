"use client";

import { useState } from "react";
import { useTodo } from "./TodoProvider";
import { formatDisplayDate, formatWeekday } from "@/lib/todo/date";
import type { Priority, Todo } from "@/lib/todo/types";

const PRIORITY_LABEL: Record<Priority, string> = { high: "高", normal: "中", low: "低" };
const PRIORITY_COLOR: Record<Priority, string> = {
  high: "bg-[#e34948]/10 text-[#e34948]",
  normal: "bg-slate-100 text-slate-500",
  low: "bg-slate-100 text-slate-400",
};

export function TaskItem({ todo, today }: { todo: Todo; today: string }) {
  const { toggleComplete, updateTodo, deleteTodo } = useTodo();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [dueDate, setDueDate] = useState(todo.dueDate ?? today);
  const [hasDueDate, setHasDueDate] = useState(todo.dueDate !== null);
  const [priority, setPriority] = useState<Priority>(todo.priority);

  const overdue = !todo.completed && todo.dueDate !== null && todo.dueDate < today;

  function save() {
    if (!title.trim()) return;
    updateTodo(todo.id, { title: title.trim(), dueDate: hasDueDate ? dueDate : null, priority });
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
          <label className="flex items-center gap-1 text-xs text-slate-600">
            <input type="checkbox" checked={hasDueDate} onChange={(e) => setHasDueDate(e.target.checked)} />
            期限
          </label>
          <input
            type="date"
            value={dueDate}
            disabled={!hasDueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs disabled:opacity-40"
          />
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
      className={`flex items-start gap-3 rounded-xl border p-3 ${
        todo.completed ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => toggleComplete(todo.id)}
        aria-pressed={todo.completed}
        aria-label={todo.completed ? "未完了に戻す" : "完了にする"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] ${
          todo.completed ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent"
        }`}
      >
        ✓
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${todo.completed ? "text-slate-400 line-through" : "text-slate-900"}`}>
          {todo.recurringTaskId && (
            <span aria-label="定期タスク" title="定期タスクから自動作成" className="mr-1">
              🔁
            </span>
          )}
          {todo.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {todo.dueDate && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] ${
                overdue ? "bg-[#e34948]/10 text-[#e34948]" : "bg-slate-100 text-slate-500"
              }`}
            >
              {overdue ? "期限切れ " : ""}
              {formatDisplayDate(todo.dueDate)}({formatWeekday(todo.dueDate)})
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[11px] ${PRIORITY_COLOR[todo.priority]}`}>
            {PRIORITY_LABEL[todo.priority]}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="編集"
          className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          編集
        </button>
        <button
          type="button"
          onClick={() => deleteTodo(todo.id)}
          aria-label="削除"
          className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-500"
        >
          削除
        </button>
      </div>
    </li>
  );
}
