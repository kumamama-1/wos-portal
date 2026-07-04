"use client";

import { useMemo, useState } from "react";

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

// 精錬（生の火晶→精錬済み火晶）の週の累計回数帯ごとのコストと、精錬済み火晶の獲得確率分布
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

// 週のうち最初の7回（=1日1回まで）は半額になる
const DAILY_DISCOUNT_COUNT = 7;
const MAX_WEEKS = 520; // 10年分を上限に打ち切り
const TRIALS = 200;

function bandForAttempt(attemptIndex: number): RefineBand {
  return REFINE_BANDS.find((b) => attemptIndex <= b.max) ?? REFINE_BANDS[REFINE_BANDS.length - 1];
}

function attemptCost(attemptIndex: number) {
  const band = bandForAttempt(attemptIndex);
  return attemptIndex <= DAILY_DISCOUNT_COUNT ? band.cost / 2 : band.cost;
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

function weeklySummary(n: number) {
  const count = Math.min(Math.max(n, 0), 100);
  let cost = 0;
  let avgYield = 0;
  for (let i = 1; i <= count; i++) {
    cost += attemptCost(i);
    avgYield += expectedYield(bandForAttempt(i).outcomes);
  }
  return { cost, avgYield };
}

// 精錬済み火晶が不要（生の火晶のみが必要）な場合：入手手段がないため、
// 今の手持ちで足りているかどうかだけを判定する
function checkRawOnly(neededRaw: number, stockRaw: number) {
  return stockRaw >= neededRaw;
}

// 精錬が絡む場合の1回分のシミュレーション（生の火晶は増えない前提で、rawBudget=手持ち-必要な生の火晶）
function simulateOnce(neededRefined: number, rawBudget: number, stockRefined: number, weeklyRefiningCount: number) {
  let budget = rawBudget;
  let refined = stockRefined;
  const n = Math.min(Math.max(weeklyRefiningCount, 0), 100);

  if (refined >= neededRefined) return 0;
  if (n <= 0) return null;

  for (let week = 1; week <= MAX_WEEKS; week++) {
    for (let i = 1; i <= n; i++) {
      const cost = attemptCost(i);
      if (budget < cost) break;
      budget -= cost;
      refined += drawYield(bandForAttempt(i).outcomes);
    }
    if (refined >= neededRefined) return week * 7;
  }
  return null;
}

function runMonteCarlo(neededRefined: number, rawBudget: number, stockRefined: number, weeklyRefiningCount: number) {
  const results: number[] = [];
  for (let t = 0; t < TRIALS; t++) {
    const d = simulateOnce(neededRefined, rawBudget, stockRefined, weeklyRefiningCount);
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
  const [stockRaw, setStockRaw] = useState(0);
  const [stockRefined, setStockRefined] = useState(0);
  const [weeklyRefining, setWeeklyRefining] = useState(0);

  const tier = TIERS.find((t) => t.id === tierId) ?? TIERS[0];
  const needsRefined = tier.neededRefined > 0;
  const weekly = weeklySummary(weeklyRefining);

  const rawShortfall = Math.max(tier.neededRaw - stockRaw, 0);
  const rawBudget = Math.max(stockRaw - tier.neededRaw, 0);

  const rawOnlyAchieved = useMemo(
    () => (needsRefined ? null : checkRawOnly(tier.neededRaw, stockRaw)),
    [needsRefined, tier.neededRaw, stockRaw]
  );

  const monteCarloResult = useMemo(
    () =>
      needsRefined && rawShortfall === 0
        ? runMonteCarlo(tier.neededRefined, rawBudget, stockRefined, weeklyRefining)
        : null,
    [needsRefined, rawShortfall, tier.neededRefined, rawBudget, stockRefined, weeklyRefining]
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold">火晶精錬シミュレーター</h1>
      <p className="mt-2 text-sm text-gray-500">
        目標のFCティアを選び、現在の手持ち数と週の精錬回数を入力すると、達成予定日を計算します。
      </p>
      <p className="mt-2 text-xs text-gray-400">
        ※このツールは「生の火晶を精錬済み火晶に変える」精錬のみを扱います。生の火晶自体を増やす手段（入手・交換など）は対象外のため、生の火晶は手持ちの数から減っていく一方として計算します。
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
                {t.label}（{t.note}）
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            必要な生の火晶: {tier.neededRaw.toLocaleString()}個
            {needsRefined && ` / 精錬済み火晶: ${tier.neededRefined.toLocaleString()}個`}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            ② 現在の手持ち：生の火晶 (個)
          </label>
          <input
            type="number"
            value={stockRaw}
            onChange={(e) => setStockRaw(Number(e.target.value) || 0)}
            className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
          />
        </div>

        {needsRefined && (
          <>
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                ③ 現在の手持ち：精錬済み火晶 (個)
              </label>
              <input
                type="number"
                value={stockRefined}
                onChange={(e) => setStockRefined(Number(e.target.value) || 0)}
                className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                ④ 週の精錬回数（1日1回目は半額、週100回まで）
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={weeklyRefining}
                onChange={(e) => setWeeklyRefining(Number(e.target.value) || 0)}
                className="w-full rounded-lg border-2 border-gray-100 p-3 text-base focus:border-red-500 focus:outline-none"
              />
              <p className="mt-1 text-right text-xs text-gray-500">
                週の消費（生の火晶）: {weekly.cost.toLocaleString()}個 / 週の平均獲得（精錬済み火晶）:{" "}
                {weekly.avgYield.toFixed(2)}個
              </p>
            </div>
          </>
        )}

        {!needsRefined ? (
          <div className="rounded-xl border-2 border-amber-100 bg-amber-50 p-5 text-center">
            <p className="text-sm font-bold text-amber-700">目標達成状況</p>
            <p className="my-1 text-2xl font-bold text-amber-900">
              {rawOnlyAchieved ? "達成済み！" : "不足しています"}
            </p>
            <p className="text-sm text-amber-800">
              {rawOnlyAchieved
                ? "おめでとうございます"
                : `あと ${rawShortfall.toLocaleString()} 個の生の火晶が必要です（入手手段はこのツールの対象外です）`}
            </p>
          </div>
        ) : rawShortfall > 0 ? (
          <div className="rounded-xl border-2 border-red-100 bg-red-50 p-5 text-center">
            <p className="text-sm font-bold text-red-700">生の火晶が不足しています</p>
            <p className="my-1 text-lg font-bold text-red-900">
              あと {rawShortfall.toLocaleString()} 個必要
            </p>
            <p className="text-sm text-red-800">
              精錬は生の火晶を消費するため、この不足分はどれだけ精錬しても解消されません
            </p>
          </div>
        ) : monteCarloResult === null ? (
          <div className="rounded-xl border-2 border-amber-100 bg-amber-50 p-5 text-center">
            <p className="text-sm font-bold text-amber-700">目標達成予定日</p>
            <p className="my-1 text-2xl font-bold text-amber-900">---</p>
            <p className="text-sm text-amber-800">このペースでは目標に到達しません（週の精錬回数を見直してください）</p>
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
        {needsRefined && monteCarloResult !== null && monteCarloResult.successRate < 1 && (
          <p className="text-center text-xs text-gray-400">
            ※{TRIALS}回の試行中、{Math.round((1 - monteCarloResult.successRate) * TRIALS)}
            回は10年以内に到達しませんでした
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        ※生の火晶の手持ちのうち、目標に必要な分を確保した「余り」だけを精錬に回す前提で計算しています。
        <br />
        ※週の中で1日1回目にあたる最初の7回分は半額、それ以降は通常価格として計算しています。
        <br />
        ※精錬済み火晶の獲得数は確率分布に基づき{TRIALS}回のシミュレーションを行い、その幅（10〜90パーセンタイル）を表示しています。
      </p>
    </div>
  );
}
