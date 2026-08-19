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
import { makeId } from "@/lib/todo/id";
import { buildDailyStats, getTodayProgress, type TodayProgress } from "@/lib/todo/stats";
import { buildMorningSuggestions } from "@/lib/todo/suggestions";
import { generateRecurringInstances, getServerSnapshot, getSnapshot, subscribe, updateStore } from "@/lib/todo/store";
import type {
  ActivityLogEntry,
  DailyStat,
  Priority,
  RecurrenceFrequency,
  RecurringTask,
  Suggestion,
  Todo,
  TodoState,
} from "@/lib/todo/types";

interface NewTodoInput {
  title: string;
  memo?: string;
  dueDate: string | null;
  priority: Priority;
}

interface NewRecurringTaskInput {
  title: string;
  memo?: string;
  frequency: RecurrenceFrequency;
  weekday: number | null;
  priority: Priority;
}

interface TodoContextValue {
  today: string;
  todos: Todo[];
  log: ActivityLogEntry[];
  dailyStats: DailyStat[];
  todayProgress: TodayProgress;
  suggestions: Suggestion[];
  recurringTasks: RecurringTask[];
  addTodo: (input: NewTodoInput) => void;
  toggleComplete: (id: string) => void;
  updateTodo: (id: string, patch: Partial<Pick<Todo, "title" | "memo" | "dueDate" | "priority">>) => void;
  deleteTodo: (id: string) => void;
  addRecurringTask: (input: NewRecurringTaskInput) => void;
  updateRecurringTask: (
    id: string,
    patch: Partial<Pick<RecurringTask, "title" | "memo" | "frequency" | "weekday" | "priority">>,
  ) => void;
  toggleRecurringActive: (id: string) => void;
  deleteRecurringTask: (id: string) => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [today, setToday] = useState(() => getAppDay());

  useEffect(() => {
    const timer = setInterval(() => setToday(getAppDay()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    generateRecurringInstances(today);
  }, [today]);

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
        recurringTaskId: null,
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
      const skippedInstances =
        target?.recurringTaskId && target.dueDate
          ? [...prev.skippedInstances, { recurringTaskId: target.recurringTaskId, day: target.dueDate }]
          : prev.skippedInstances;
      return {
        ...prev,
        todos: prev.todos.filter((t) => t.id !== id),
        log: entry ? [entry, ...prev.log] : prev.log,
        skippedInstances,
      };
    });
  }, []);

  const addRecurringTask = useCallback(
    (input: NewRecurringTaskInput) => {
      const title = input.title.trim();
      if (!title) return;
      updateStore((prev: TodoState) => {
        const template: RecurringTask = {
          id: makeId(),
          title,
          memo: input.memo?.trim() ?? "",
          frequency: input.frequency,
          weekday: input.frequency === "weekly" ? input.weekday : null,
          priority: input.priority,
          active: true,
          createdAt: new Date().toISOString(),
        };
        return { ...prev, recurringTasks: [template, ...prev.recurringTasks] };
      });
      generateRecurringInstances(today);
    },
    [today],
  );

  const updateRecurringTask = useCallback(
    (
      id: string,
      patch: Partial<Pick<RecurringTask, "title" | "memo" | "frequency" | "weekday" | "priority">>,
    ) => {
      updateStore((prev: TodoState) => ({
        ...prev,
        recurringTasks: prev.recurringTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }));
      generateRecurringInstances(today);
    },
    [today],
  );

  const toggleRecurringActive = useCallback(
    (id: string) => {
      updateStore((prev: TodoState) => ({
        ...prev,
        recurringTasks: prev.recurringTasks.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
      }));
      generateRecurringInstances(today);
    },
    [today],
  );

  const deleteRecurringTask = useCallback((id: string) => {
    updateStore((prev: TodoState) => ({
      ...prev,
      recurringTasks: prev.recurringTasks.filter((t) => t.id !== id),
    }));
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
    recurringTasks: state.recurringTasks,
    addTodo,
    toggleComplete,
    updateTodo,
    deleteTodo,
    addRecurringTask,
    updateRecurringTask,
    toggleRecurringActive,
    deleteRecurringTask,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodo must be used within TodoProvider");
  return ctx;
}
