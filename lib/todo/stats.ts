import { addDays, getAppDay } from "./date";
import type { DailyStat, Todo, TodoState } from "./types";

export function buildDailyStats(state: TodoState, days: number, today: string): DailyStat[] {
  const map = new Map<string, DailyStat>();
  for (let i = days - 1; i >= 0; i--) {
    const key = addDays(today, -i);
    map.set(key, { day: key, completed: 0, created: 0 });
  }
  for (const entry of state.log) {
    const day = getAppDay(new Date(entry.at));
    const bucket = map.get(day);
    if (!bucket) continue;
    if (entry.type === "completed") bucket.completed += 1;
    if (entry.type === "created") bucket.created += 1;
  }
  return Array.from(map.values());
}

export interface TodayProgress {
  total: number;
  done: number;
  rate: number;
  overdueCount: number;
}

export function getTodayProgress(todos: Todo[], today: string): TodayProgress {
  const relevant = todos.filter((t) => {
    if (t.completed) {
      return t.completedAt !== null && getAppDay(new Date(t.completedAt)) === today;
    }
    return t.dueDate !== null && t.dueDate <= today;
  });
  const done = relevant.filter((t) => t.completed).length;
  const overdueCount = todos.filter((t) => !t.completed && t.dueDate !== null && t.dueDate < today).length;
  return {
    total: relevant.length,
    done,
    rate: relevant.length === 0 ? 0 : Math.round((done / relevant.length) * 100),
    overdueCount,
  };
}
