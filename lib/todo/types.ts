export type Priority = "low" | "normal" | "high";

export interface Todo {
  id: string;
  title: string;
  memo: string;
  /** app-day key (YYYY-MM-DD, day boundary at 06:00) or null when no due date */
  dueDate: string | null;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export type ActivityType = "created" | "completed" | "reopened" | "deleted";

export interface ActivityLogEntry {
  id: string;
  todoId: string;
  title: string;
  type: ActivityType;
  at: string;
}

export interface TodoState {
  todos: Todo[];
  log: ActivityLogEntry[];
  lastSuggestionAppDay: string | null;
}

export interface DailyStat {
  day: string;
  completed: number;
  created: number;
}

export interface Suggestion {
  id: string;
  level: "info" | "warning" | "good";
  text: string;
}
