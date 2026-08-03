"use client";

import { useMemo, useState } from "react";

type SpeedupItem = {
  id: string;
  label: string;
  minutes: number;
};

const DEFAULT_ITEMS: SpeedupItem[] = [
  { id: "m1", label: "1分", minutes: 1 },
  { id: "m5", label: "5分", minutes: 5 },
  { id: "m10", label: "10分", minutes: 10 },
  { id: "m30", label: "30分", minutes: 30 },
  { id: "h1", label: "1時間", minutes: 60 },
  { id: "h3", label: "3時間", minutes: 180 },
  { id: "h8", label: "8時間", minutes: 480 },
];

function formatMinutes(totalMinutes: number) {
  const m = Math.round(totalMinutes);
  const days = Math.floor(m / 1440);
  const hours = Math.floor((m % 1440) / 60);
  const minutes = m % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}日`);
  if (hours > 0) parts.push(`${hours}時間`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}分`);
  return parts.join(" ");
}

export default function SpeedupPage() {
  const [targetDays, setTargetDays] = useState(0);
  const [targetHours, setTargetHours] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(DEFAULT_ITEMS.map((item) => [item.id, 0]))
  );

  const targetTotalMinutes = targetDays * 1440 + targetHours * 60 + targetMinutes;

  const coveredMinutes = useMemo(
    () => DEFAULT_ITEMS.reduce((sum, item) => sum + item.minutes * (counts[item.id] || 0), 0),
    [counts]
  );

  const shortfall = Math.max(targetTotalMinutes - coveredMinutes, 0);
  const surplus = Math.max(coveredMinutes - targetTotalMinutes, 0);

  const largestItem = DEFAULT_ITEMS[DEFAULT_ITEMS.length - 1];
  const largestItemsNeeded = shortfall > 0 ? Math.ceil(shortfall / largestItem.minutes) : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold">加速アイテム計算機</h1>
      <p className="mt-2 text-sm text-gray-500">
        建設・研究などに必要な残り時間と、手持ちの加速アイテムを入力すると、時間が足りるかどうかを計算します。
      </p>
      <p className="mt-2 text-xs text-gray-400">
        ※アイテムの種類・時間はよく使われる一般的な区分（1分〜8時間）で用意しています。実際のゲーム内容と異なる場合はご了承ください。
      </p>

      <div className="mt-8 space-y-6 rounded-xl border border-gray-200 p-6">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">① 必要な残り時間</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                min={0}
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value) || 0)}
                className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
              />
              <p className="mt-1 text-center text-xs text-gray-500">日</p>
            </div>
            <div>
              <input
                type="number"
                min={0}
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value) || 0)}
                className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
              />
              <p className="mt-1 text-center text-xs text-gray-500">時間</p>
            </div>
            <div>
              <input
                type="number"
                min={0}
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value) || 0)}
                className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
              />
              <p className="mt-1 text-center text-xs text-gray-500">分</p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">② 手持ちの加速アイテム（個数）</label>
          <div className="space-y-2">
            {DEFAULT_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-sm text-gray-600">{item.label}</span>
                <input
                  type="number"
                  min={0}
                  value={counts[item.id]}
                  onChange={(e) =>
                    setCounts((prev) => ({ ...prev, [item.id]: Number(e.target.value) || 0 }))
                  }
                  className="w-full rounded-lg border-2 border-gray-100 p-2 text-base focus:border-red-500 focus:outline-none"
                />
                <span className="shrink-0 text-xs text-gray-400">個</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border-2 border-amber-100 bg-amber-50 p-5 text-center">
          <p className="text-sm font-bold text-amber-700">手持ちの加速アイテム合計</p>
          <p className="my-1 text-xl font-bold text-amber-900">{formatMinutes(coveredMinutes)}</p>
          {shortfall > 0 ? (
            <p className="text-sm text-amber-800">
              あと {formatMinutes(shortfall)} 分足りません（{largestItem.label}換算で約{largestItemsNeeded}個分）
            </p>
          ) : targetTotalMinutes > 0 ? (
            <p className="text-sm text-amber-800">
              足りています（{formatMinutes(surplus)} 分の余裕があります）
            </p>
          ) : (
            <p className="text-sm text-amber-800">①に必要な時間を入力してください</p>
          )}
        </div>
      </div>
    </div>
  );
}
