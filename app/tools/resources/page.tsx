"use client";

import { useState } from "react";

type ResourceKey = "wood" | "meat" | "coal" | "iron";

const RESOURCES: { key: ResourceKey; label: string }[] = [
  { key: "wood", label: "木材" },
  { key: "meat", label: "生肉" },
  { key: "coal", label: "石炭" },
  { key: "iron", label: "鉄鉱" },
];

type ResourceInput = { needed: number; stock: number; hourlyRate: number };

const EMPTY_INPUT: ResourceInput = { needed: 0, stock: 0, hourlyRate: 0 };

function formatHours(totalHours: number) {
  const h = Math.round(totalHours);
  const days = Math.floor(h / 24);
  const hours = h % 24;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}日`);
  if (hours > 0 || parts.length === 0) parts.push(`${hours}時間`);
  return parts.join(" ");
}

export default function ResourcesPage() {
  const [inputs, setInputs] = useState<Record<ResourceKey, ResourceInput>>({
    wood: { ...EMPTY_INPUT },
    meat: { ...EMPTY_INPUT },
    coal: { ...EMPTY_INPUT },
    iron: { ...EMPTY_INPUT },
  });

  const updateInput = (key: ResourceKey, field: keyof ResourceInput, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold">資源計算機</h1>
      <p className="mt-2 text-sm text-gray-500">
        建設・研究などに必要な資源（木材・生肉・石炭・鉄鉱）の不足数と、生産速度を入力した場合の到達予定を計算します。
      </p>

      <div className="mt-8 space-y-6">
        {RESOURCES.map(({ key, label }) => {
          const input = inputs[key];
          const shortfall = Math.max(input.needed - input.stock, 0);
          const hoursNeeded = shortfall > 0 && input.hourlyRate > 0 ? shortfall / input.hourlyRate : null;

          return (
            <div key={key} className="rounded-xl border border-gray-200 p-5">
              <p className="mb-3 text-base font-bold text-gray-800">{label}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">必要数</label>
                  <input
                    type="number"
                    min={0}
                    value={input.needed}
                    onChange={(e) => updateInput(key, "needed", Number(e.target.value) || 0)}
                    className="w-full rounded-lg border-2 border-gray-100 p-2 text-base focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">現在の手持ち</label>
                  <input
                    type="number"
                    min={0}
                    value={input.stock}
                    onChange={(e) => updateInput(key, "stock", Number(e.target.value) || 0)}
                    className="w-full rounded-lg border-2 border-gray-100 p-2 text-base focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">1時間あたりの生産量（任意）</label>
                  <input
                    type="number"
                    min={0}
                    value={input.hourlyRate}
                    onChange={(e) => updateInput(key, "hourlyRate", Number(e.target.value) || 0)}
                    className="w-full rounded-lg border-2 border-gray-100 p-2 text-base focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {shortfall > 0
                  ? `不足数: ${shortfall.toLocaleString()}個${
                      hoursNeeded !== null ? `（現在の生産量では、あと約${formatHours(hoursNeeded)}で到達）` : ""
                    }`
                  : "必要数を満たしています"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
