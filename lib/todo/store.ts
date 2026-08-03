import { createEmptyState, loadState, saveState } from "./storage";
import type { TodoState } from "./types";

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
