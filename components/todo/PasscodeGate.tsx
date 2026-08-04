"use client";

import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { getServerSnapshot, getSnapshot, setupPasscode, subscribe, tryUnlock } from "@/lib/todo/passcodeStore";

export function PasscodeGate({ children }: { children: ReactNode }) {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [input, setInput] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (status === "unlocked") {
    return <>{children}</>;
  }

  const isSetup = status === "setup";

  async function handleSetup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (input.length < 4) {
      setError("4文字以上で設定してください。");
      return;
    }
    if (input !== confirmInput) {
      setError("確認用のパスコードが一致しません。");
      return;
    }
    await setupPasscode(input);
  }

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const ok = await tryUnlock(input);
    if (!ok) {
      setError("パスコードが違います。");
      setInput("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={isSetup ? handleSetup : handleUnlock}
        className="w-full max-w-xs rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
      >
        <p className="text-center text-3xl">🔒</p>
        <h1 className="mt-2 text-center text-lg font-semibold text-white">
          {isSetup ? "パスコードを設定" : "ToDoはロック中です"}
        </h1>
        <p className="mt-1 text-center text-xs text-slate-400">
          {isSetup ? "このブラウザ専用のパスコードを決めてください" : "パスコードを入力してください"}
        </p>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mt-5 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-center text-lg tracking-[0.3em] text-white outline-none focus:border-blue-500"
          placeholder="••••"
        />
        {isSetup && (
          <input
            type="password"
            inputMode="numeric"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-center text-lg tracking-[0.3em] text-white outline-none focus:border-blue-500"
            placeholder="確認用"
          />
        )}

        {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          {isSetup ? "設定して開始" : "ロック解除"}
        </button>

        {!isSetup && (
          <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
            パスコードを忘れた場合は、このブラウザのサイトデータを削除すると初期化されます(記録も消えます)。
          </p>
        )}
      </form>
    </div>
  );
}
