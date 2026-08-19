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
  /** set when this todo was auto-generated from a RecurringTask template */
  recurringTaskId: string | null;
}

export type ActivityType = "created" | "completed" | "reopened" | "deleted";

export interface ActivityLogEntry {
  id: string;
  todoId: string;
  title: string;
  type: ActivityType;
  at: string;
}

export type RecurrenceFrequency = "daily" | "weekly";

export interface RecurringTask {
  id: string;
  title: string;
  memo: string;
  frequency: RecurrenceFrequency;
  /** 0 (Sun) - 6 (Sat), required when frequency is "weekly", null when "daily" */
  weekday: number | null;
  priority: Priority;
  active: boolean;
  createdAt: string;
}

export interface SkippedInstance {
  recurringTaskId: string;
  day: string;
}

export interface TodoState {
  todos: Todo[];
  log: ActivityLogEntry[];
  lastSuggestionAppDay: string | null;
  recurringTasks: RecurringTask[];
  /** (template, day) pairs whose generated instance was deleted, so it isn't recreated that day */
  skippedInstances: SkippedInstance[];
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
