import { getWeekdayIndex } from "./date";
import { makeId } from "./id";
import { createEmptyState, loadState, saveState } from "./storage";
import type { ActivityLogEntry, Todo, TodoState } from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();
let snapshot: TodoState | null = null;

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): TodoState {
  if (snapshot === null) snapshot = loadState();
  return snapshot;
}

export function getServerSnapshot(): TodoState {
  return createEmptyState();
}

export function updateStore(updater: (prev: TodoState) => TodoState): void {
  const next = updater(getSnapshot());
  snapshot = next;
  saveState(next);
  for (const listener of listeners) listener();
}

/**
 * Spawns today's todo instances from active recurring templates (daily, or
 * weekly on their matching weekday). Idempotent: skips a template that
 * already has an instance for `today`, or whose instance for `today` was
 * explicitly deleted (tracked in `skippedInstances`), so it's safe to call
 * both on day rollover and right after a template is added/edited.
 */
export function generateRecurringInstances(today: string): void {
  const state = getSnapshot();
  const weekdayIndex = getWeekdayIndex(today);
  const now = new Date().toISOString();
  const newTodos: Todo[] = [];
  const newLog: ActivityLogEntry[] = [];

  for (const template of state.recurringTasks) {
    if (!template.active) continue;
    const matches = template.frequency === "daily" || template.weekday === weekdayIndex;
    if (!matches) continue;

    const alreadyExists = state.todos.some((t) => t.recurringTaskId === template.id && t.dueDate === today);
    if (alreadyExists) continue;
    const wasSkipped = state.skippedInstances.some((s) => s.recurringTaskId === template.id && s.day === today);
    if (wasSkipped) continue;

    const todo: Todo = {
      id: makeId(),
      title: template.title,
      memo: template.memo,
      dueDate: today,
      priority: template.priority,
      completed: false,
      createdAt: now,
      completedAt: null,
      recurringTaskId: template.id,
    };
    newTodos.push(todo);
    newLog.push({ id: makeId(), todoId: todo.id, title: todo.title, type: "created", at: now });
  }

  if (newTodos.length === 0) return;

  updateStore((prev) => ({
    ...prev,
    todos: [...newTodos, ...prev.todos],
    log: [...newLog, ...prev.log],
  }));
}
