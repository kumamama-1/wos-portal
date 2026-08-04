const HASH_KEY = "wos-todo:passcode-hash";
const UNLOCK_KEY = "wos-todo:unlocked";

export type LockStatus = "setup" | "locked" | "unlocked";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function getSnapshot(): LockStatus {
  const hash = window.localStorage.getItem(HASH_KEY);
  if (!hash) return "setup";
  return window.localStorage.getItem(UNLOCK_KEY) === "1" ? "unlocked" : "locked";
}

export function getServerSnapshot(): LockStatus {
  return "locked";
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function setupPasscode(passcode: string): Promise<void> {
  window.localStorage.setItem(HASH_KEY, await sha256(passcode));
  window.localStorage.setItem(UNLOCK_KEY, "1");
  notify();
}

export async function tryUnlock(passcode: string): Promise<boolean> {
  const hash = window.localStorage.getItem(HASH_KEY);
  const ok = (await sha256(passcode)) === hash;
  if (ok) {
    window.localStorage.setItem(UNLOCK_KEY, "1");
    notify();
  }
  return ok;
}

export function lock(): void {
  window.localStorage.removeItem(UNLOCK_KEY);
  notify();
}
