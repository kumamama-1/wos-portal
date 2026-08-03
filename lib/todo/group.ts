import type { Todo } from "./types";

export interface TodoGroups {
  overdue: Todo[];
  today: Todo[];
  upcoming: Todo[];
  noDate: Todo[];
  completed: Todo[];
}

const PRIORITY_RANK = { high: 0, normal: 1, low: 2 } as const;

function byDue(a: Todo, b: Todo): number {
  return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
}

function byPriority(a: Todo, b: Todo): number {
  return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
}

export function groupTodos(todos: Todo[], today: string): TodoGroups {
  const active = todos.filter((t) => !t.completed);
  const completed = [...todos]
    .filter((t) => t.completed)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));

  return {
    overdue: active.filter((t) => t.dueDate !== null && t.dueDate < today).sort(byDue),
    today: active.filter((t) => t.dueDate === today).sort(byPriority),
    upcoming: active.filter((t) => t.dueDate !== null && t.dueDate > today).sort(byDue),
    noDate: active.filter((t) => t.dueDate === null).sort(byPriority),
    completed,
  };
}
