"use client";

import { useState } from "react";
import { useTodo } from "./TodoProvider";
import { groupTodos, type TodoGroups } from "@/lib/todo/group";
import { TaskItem } from "./TaskItem";

const SECTIONS: { key: keyof Omit<TodoGroups, "completed">; label: string }[] = [
  { key: "overdue", label: "期限切れ" },
  { key: "today", label: "今日" },
  { key: "upcoming", label: "今後の予定" },
  { key: "noDate", label: "期限なし" },
];

export function TaskList() {
  const { todos, today } = useTodo();
  const [showCompleted, setShowCompleted] = useState(false);
  const groups = groupTodos(todos, today);

  if (todos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
        タスクはまだありません。上のフォームから追加しましょう。
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {SECTIONS.map(({ key, label }) => {
        const items = groups[key];
        if (items.length === 0) return null;
        return (
          <section key={key}>
            <h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
              {label}
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">{items.length}</span>
            </h3>
            <ul className="space-y-2">
              {items.map((t) => (
                <TaskItem key={t.id} todo={t} today={today} />
              ))}
            </ul>
          </section>
        );
      })}

      {groups.completed.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500"
          >
            完了済み
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">
              {groups.completed.length}
            </span>
            <span className="text-slate-300">{showCompleted ? "▲" : "▼"}</span>
          </button>
          {showCompleted && (
            <ul className="space-y-2">
              {groups.completed.slice(0, 50).map((t) => (
                <TaskItem key={t.id} todo={t} today={today} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
