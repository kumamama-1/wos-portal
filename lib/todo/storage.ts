import type { TodoState } from "./types";

const STORAGE_KEY = "wos-todo:data:v1";

export function createEmptyState(): TodoState {
  return { todos: [], log: [], lastSuggestionAppDay: null, recurringTasks: [], skippedInstances: [] };
}

export function loadState(): TodoState {
  if (typeof window === "undefined") return createEmptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw) as Partial<TodoState>;
    return {
      todos: parsed.todos ?? [],
      log: parsed.log ?? [],
      lastSuggestionAppDay: parsed.lastSuggestionAppDay ?? null,
      recurringTasks: parsed.recurringTasks ?? [],
      skippedInstances: parsed.skippedInstances ?? [],
    };
  } catch {
    return createEmptyState();
  }
}

export function saveState(state: TodoState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
