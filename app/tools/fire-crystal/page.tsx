"use client";

import { useEffect, useMemo, useState } from "react";

type Tier = {
  id: string;
  label: string;
  neededRaw: number;
  neededRefined: number;
  note: string;
};

type Outcome = { value: number; prob: number };

type RefineBand = { max: number; cost: number; outcomes: Outcome[] };

const TIERS: Tier[] = [
  { id: "fc6", label: "FC6", neededRaw: 3105, neededRefined: 199, note: "FC5からの必要数" },
  { id: "fc7", label: "FC7", neededRaw: 3726, neededRefined: 295, note: "FC6からの必要数" },
  { id: "fc8", label: "FC8", neededRaw: 3726, neededRefined: 414, note: "FC7からの必要数" },
  { id: "fc9", label: "FC9", neededRaw: 4347, neededRefined: 611, note: "FC8からの必要数" },
  { id: "fc10", label: "FC10", neededRaw: 5420, neededRefined: 1439, note: "FC9からの必要数" },
];

// 精錬（火晶→精錬火晶）の週の累計回数帯ごとの、精錬火晶の獲得確率分布
const REFINE_BANDS: RefineBand[] = [
  {
    max: 20,
    cost: 20,
    outcomes: [
      { value: 1, prob: 0.65 },
      { value: 2, prob: 0.25 },
      { value: 3, prob: 0.1 },
    ],
  },
  {
    max: 40,
    cost: 50,
    outcomes: [
      { value: 2, prob: 0.85 },
      { value: 3, prob: 0.15 },
    ],
  },
  {
    max: 60,
    cost: 100,
    outcomes: [
      { value: 3, prob: 0.85 },
      { value: 4, prob: 0.125 },
      { value: 5, prob: 0.025 },
    ],
  },
  {
    max: 80,
    cost: 130,
    outcomes: [
      { value: 3, prob: 0.75 },
      { value: 4, prob: 0.15 },
      { value: 5, prob: 0.05 },
      { value: 6, prob: 0.03 },
      { value: 7, prob: 0.01 },
      { value: 8, prob: 0.005 },
      { value: 9, prob: 0.005 },
    ],
  },
  {
    max: 100,
    cost: 160,
    outcomes: [
      { value: 3, prob: 0.7 },
      { value: 4, prob: 0.12 },
      { value: 5, prob: 0.09 },
      { value: 6, prob: 0.04 },
      { value: 7, prob: 0.015 },
      { value: 8, prob: 0.01 },
      { value: 9, prob: 0.01 },
      { value: 10, prob: 0.005 },
      { value: 11, prob: 0.005 },
      { value: 12, prob: 0.005 },
    ],
  },
];

const MAX_WEEKS = 520; // 10年分を上限に打ち切り
const TRIALS = 200;

function bandForAttempt(attemptIndex: number): RefineBand {
  return REFINE_BANDS.find((b) => attemptIndex <= b.max) ?? REFINE_BANDS[REFINE_BANDS.length - 1];
}

// 週の中で「1日1回目」にあたる回（=半額になる回）かどうかを判定する。
// 1つの「まとめ日」にできるだけ多くの回数を集中させ、残りの6日は1回ずつという前提で、
// まとめ日の最初の1回と、残り6日それぞれの1回（＝週の最後の6回）が半額になる。
function isDiscounted(position: number, weeklyTotal: number) {
  const batchSize = Math.max(weeklyTotal - 6, 0);
  if (batchSize === 0) return true;
  return position === 1 || position > batchSize;
}

function attemptCost(attemptIndex: number, weeklyTotal: number) {
  const band = bandForAttempt(attemptIndex);
  return isDiscounted(attemptIndex, weeklyTotal) ? band.cost / 2 : band.cost;
}

function expectedYield(outcomes: Outcome[]) {
  return outcomes.reduce((sum, o) => sum + o.value * o.prob, 0);
}

function drawYield(outcomes: Outcome[]) {
  const r = Math.random();
  let cumulative = 0;
  for (const o of outcomes) {
    cumulative += o.prob;
    if (r <= cumulative) return o.value;
  }
  return outcomes[outcomes.length - 1].value;
}

// 週◯回精錬した場合の平均獲得数（火晶の残量には関係なく、回数だけで決まる）と、参考消費量
function weeklySummary(n: number) {
  const count = Math.min(Math.max(n, 0), 100);
  let avgYield = 0;
  let cost = 0;
  for (let i = 1; i <= count; i++) {
    avgYield += expectedYield(bandForAttempt(i).outcomes);
    cost += attemptCost(i, count);
  }
  return { avgYield, cost };
}

// 精錬火晶が目標に届くまでの1回分のシミュレーション（火晶の残量には左右されない）
function simulateOnce(remainingNeeded: number, weeklyRefiningCount: number) {
  let refined = 0;
  const n = Math.min(Math.max(weeklyRefiningCount, 0), 100);

  if (remainingNeeded <= 0) return 0;
  if (n <= 0) return null;

  for (let week = 1; week <= MAX_WEEKS; week++) {
    for (let i = 1; i <= n; i++) {
      refined += drawYield(bandForAttempt(i).outcomes);
    }
    if (refined >= remainingNeeded) return week * 7;
  }
  return null;
}

function runMonteCarlo(remainingNeeded: number, weeklyRefiningCount: number) {
  const results: number[] = [];
  for (let t = 0; t < TRIALS; t++) {
    const d = simulateOnce(remainingNeeded, weeklyRefiningCount);
    if (d !== null) results.push(d);
  }
  if (results.length === 0) return null;
  results.sort((a, b) => a - b);
  const pick = (p: number) => results[Math.min(results.length - 1, Math.floor(p * results.length))];
  return {
    optimistic: pick(0.1),
    median: pick(0.5),
    pessimistic: pick(0.9),
    successRate: results.length / TRIALS,
  };
}

function formatResult(days: number | null) {
  if (days === null) return { date: "---", note: "このペースでは目標に到達しません" };
  if (days === 0) return { date: "達成済み！", note: "おめでとうございます" };
  const target = new Date();
  target.setDate(target.getDate() + days);
  const weekDayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const date = `${target.getFullYear()}/${target.getMonth() + 1}/${target.getDate()} (${weekDayNames[target.getDay()]})`;
  return { date, note: `あと ${days} 日` };
}

export default function FireCrystalPage() {
  const [tierId, setTierId] = useState(TIERS[0].id);
  const [neededRefinedInput, setNeededRefinedInput] = useState(TIERS[0].neededRefined);
  const [stockRaw, setStockRaw] = useState(0);
  const [stockRefined, setStockRefined] = useState(0);
  const [weeklyRefining, setWeeklyRefining] = useState(0);

  const tier = TIERS.find((t) => t.id === tierId) ?? TIERS[0];

  // 目標ティアを選び直したら、必要精錬火晶数の欄を自動で更新する（その後は自由に上書き可能）
  useEffect(() => {
    setNeededRefinedInput(tier.neededRefined);
  }, [tier.neededRefined]);

  const weekly = weeklySummary(weeklyRefining);
  const rawShortfall = Math.max(tier.neededRaw - stockRaw, 0);
  const remainingNeeded = Math.max(neededRefinedInput - stockRefined, 0);

  const monteCarloResult = useMemo(
    () => runMonteCarlo(remainingNeeded, weeklyRefining),
    [remainingNeeded, weeklyRefining]
  );

  let unreachableReason = "";
  if (monteCarloResult === null) {
    unreachableReason =
      weeklyRefining <= 0
        ? "週の精錬回数が0のままです。④に数値を入れてください"
        : "10年以内には目標に到達しません（週の精錬回数を増やしてください）";
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold">火晶精錬シミュレーター</h1>
      <p className="mt-2 text-sm text-gray-500">
        目標のFCティア（または必要精錬火晶数を直接指定）と手持ち数、週の精錬回数を入力すると、残りの精錬火晶を確保するまでの日数を計算します。
      </p>

      <div className="mt-8 space-y-6 rounded-xl border border-gray-200 p-6">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">① 目標ティア</label>
          <select
            value={tierId}
            onChange={(e) => setTierId(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
          >
            {TIERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}（{t.note}） - 精錬火晶 {t.neededRefined.toLocaleString()}個
              </option>
            ))}
          </select>
          <label className="mb-2 mt-3 block text-sm font-bold text-gray-700">必要精錬火晶数（直接編集可）</label>
          <input
            type="number"
            value={neededRefinedInput}
            onChange={(e) => setNeededRefinedInput(Number(e.target.value) || 0)}
            className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">② 現在の手持ち：火晶 (個)</label>
          <input
            type="number"
            value={stockRaw}
            onChange={(e) => setStockRaw(Number(e.target.value) || 0)}
            className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">参考：目標ティアに必要な火晶 {tier.neededRaw.toLocaleString()}個</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">③ 現在の手持ち：精錬火晶 (個)</label>
          <input
            type="number"
            value={stockRefined}
            onChange={(e) => setStockRefined(Number(e.target.value) || 0)}
            className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">残り必要数: {remainingNeeded.toLocaleString()}個</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">④ 週の精錬回数（週100回まで）</label>
          <input
            type="number"
            min={0}
            max={100}
            value={weeklyRefining}
            onChange={(e) => setWeeklyRefining(Number(e.target.value) || 0)}
            className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
          />
          <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <p className="font-bold">📅 週の動き（計{weeklyRefining}回）</p>
            <p className="mt-1">
              週合計: 火晶消費 {Math.round(weekly.cost).toLocaleString()}個 / 精錬火晶獲得（期待値）{" "}
              {weekly.avgYield.toFixed(2)}個
            </p>
          </div>
        </div>

        {monteCarloResult === null ? (
          <div className="rounded-xl border-2 border-amber-100 bg-amber-50 p-5 text-center">
            <p className="text-sm font-bold text-amber-700">精錬火晶の確保予定日</p>
            <p className="my-1 text-2xl font-bold text-amber-900">---</p>
            <p className="text-sm text-amber-800">{unreachableReason}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border-2 border-green-100 bg-green-50 p-4 text-center">
              <p className="text-xs font-bold text-green-700">楽観的（運が良い場合）</p>
              <p className="my-1 text-lg font-bold text-green-900">
                {formatResult(monteCarloResult.optimistic).date}
              </p>
              <p className="text-xs text-green-800">{formatResult(monteCarloResult.optimistic).note}</p>
            </div>
            <div className="rounded-xl border-2 border-amber-100 bg-amber-50 p-4 text-center">
              <p className="text-xs font-bold text-amber-700">標準（中央値）</p>
              <p className="my-1 text-lg font-bold text-amber-900">{formatResult(monteCarloResult.median).date}</p>
              <p className="text-xs text-amber-800">{formatResult(monteCarloResult.median).note}</p>
            </div>
            <div className="rounded-xl border-2 border-red-100 bg-red-50 p-4 text-center">
              <p className="text-xs font-bold text-red-700">悲観的（運が悪い場合）</p>
              <p className="my-1 text-lg font-bold text-red-900">
                {formatResult(monteCarloResult.pessimistic).date}
              </p>
              <p className="text-xs text-red-800">{formatResult(monteCarloResult.pessimistic).note}</p>
            </div>
          </div>
        )}
        {monteCarloResult !== null && monteCarloResult.successRate < 1 && (
          <p className="text-center text-xs text-gray-400">
            ※{TRIALS}回の試行中、{Math.round((1 - monteCarloResult.successRate) * TRIALS)}
            回は10年以内に到達しませんでした
          </p>
        )}

        <p className="text-center text-sm text-gray-600">
          {rawShortfall > 0 ? `火晶は ${rawShortfall.toLocaleString()} 個足りません` : "火晶は必要数を満たしています"}
        </p>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        ※④の週の精錬回数による獲得数は、火晶の残量に関わらず回数だけで計算しています（火晶の充足状況は②の参考表示で別途確認してください）。
        <br />
        ※精錬火晶の獲得数は確率分布に基づき{TRIALS}回のシミュレーションを行い、その幅（10〜90パーセンタイル）を表示しています。
      </p>
    </div>
  );
}
