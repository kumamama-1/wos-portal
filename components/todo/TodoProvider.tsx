"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getAppDay } from "@/lib/todo/date";
import { buildDailyStats, getTodayProgress, type TodayProgress } from "@/lib/todo/stats";
import { buildMorningSuggestions } from "@/lib/todo/suggestions";
import { getServerSnapshot, getSnapshot, subscribe, updateStore } from "@/lib/todo/store";
import type { ActivityLogEntry, DailyStat, Priority, Suggestion, Todo, TodoState } from "@/lib/todo/types";

interface NewTodoInput {
  title: string;
  memo?: string;
  dueDate: string | null;
  priority: Priority;
}

interface TodoContextValue {
  today: string;
  todos: Todo[];
  log: ActivityLogEntry[];
  dailyStats: DailyStat[];
  todayProgress: TodayProgress;
  suggestions: Suggestion[];
  addTodo: (input: NewTodoInput) => void;
  toggleComplete: (id: string) => void;
  updateTodo: (id: string, patch: Partial<Pick<Todo, "title" | "memo" | "dueDate" | "priority">>) => void;
  deleteTodo: (id: string) => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [today, setToday] = useState(() => getAppDay());

  useEffect(() => {
    const timer = setInterval(() => setToday(getAppDay()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const addTodo = useCallback((input: NewTodoInput) => {
    const title = input.title.trim();
    if (!title) return;
    updateStore((prev: TodoState) => {
      const now = new Date().toISOString();
      const todo: Todo = {
        id: makeId(),
        title,
        memo: input.memo?.trim() ?? "",
        dueDate: input.dueDate,
        priority: input.priority,
        completed: false,
        createdAt: now,
        completedAt: null,
      };
      const entry: ActivityLogEntry = { id: makeId(), todoId: todo.id, title: todo.title, type: "created", at: now };
      return { ...prev, todos: [todo, ...prev.todos], log: [entry, ...prev.log] };
    });
  }, []);

  const toggleComplete = useCallback((id: string) => {
    updateStore((prev: TodoState) => {
      const now = new Date().toISOString();
      let entry: ActivityLogEntry | null = null;
      const todos = prev.todos.map((t) => {
        if (t.id !== id) return t;
        const completed = !t.completed;
        entry = {
          id: makeId(),
          todoId: t.id,
          title: t.title,
          type: completed ? "completed" : "reopened",
          at: now,
        };
        return { ...t, completed, completedAt: completed ? now : null };
      });
      return { ...prev, todos, log: entry ? [entry, ...prev.log] : prev.log };
    });
  }, []);

  const updateTodo = useCallback(
    (id: string, patch: Partial<Pick<Todo, "title" | "memo" | "dueDate" | "priority">>) => {
      updateStore((prev: TodoState) => ({
        ...prev,
        todos: prev.todos.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }));
    },
    [],
  );

  const deleteTodo = useCallback((id: string) => {
    updateStore((prev: TodoState) => {
      const target = prev.todos.find((t) => t.id === id);
      const now = new Date().toISOString();
      const entry: ActivityLogEntry | null = target
        ? { id: makeId(), todoId: id, title: target.title, type: "deleted", at: now }
        : null;
      return {
        ...prev,
        todos: prev.todos.filter((t) => t.id !== id),
        log: entry ? [entry, ...prev.log] : prev.log,
      };
    });
  }, []);

  const dailyStats = useMemo(() => buildDailyStats(state, 14, today), [state, today]);
  const todayProgress = useMemo(() => getTodayProgress(state.todos, today), [state.todos, today]);
  const suggestions = useMemo(
    () => buildMorningSuggestions(state.todos, dailyStats, today),
    [state.todos, dailyStats, today],
  );

  const value: TodoContextValue = {
    today,
    todos: state.todos,
    log: state.log,
    dailyStats,
    todayProgress,
    suggestions,
    addTodo,
    toggleComplete,
    updateTodo,
    deleteTodo,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodo must be used within TodoProvider");
  return ctx;
}
