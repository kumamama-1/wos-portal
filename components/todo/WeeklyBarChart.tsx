"use client";

import { useState } from "react";
import { formatDisplayDate, formatWeekday } from "@/lib/todo/date";
import type { DailyStat } from "@/lib/todo/types";

const BAR_COLOR = "#2a78d6";
const EMPTY_COLOR = "#e1e0d9";

export function WeeklyBarChart({ data }: { data: DailyStat[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((d) => d.completed));
  const hoveredStat = data.find((d) => d.day === hovered) ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <h3 className="text-sm font-bold text-slate-900">過去14日間の完了数</h3>
        <span className="text-xs text-slate-500">
          {hoveredStat
            ? `${formatDisplayDate(hoveredStat.day)}(${formatWeekday(hoveredStat.day)}): ${hoveredStat.completed}件`
            : "バーにカーソルを合わせると詳細が見られます"}
        </span>
      </div>

      <div className="mt-4 flex h-36 items-end gap-1">
        {data.map((d) => {
          const heightPct = (d.completed / max) * 100;
          return (
            <button
              type="button"
              key={d.day}
              onMouseEnter={() => setHovered(d.day)}
              onMouseLeave={() => setHovered((h) => (h === d.day ? null : h))}
              onFocus={() => setHovered(d.day)}
              onBlur={() => setHovered((h) => (h === d.day ? null : h))}
              aria-label={`${formatDisplayDate(d.day)} ${formatWeekday(d.day)}曜日: ${d.completed}件完了`}
              className="flex h-full flex-1 flex-col items-center justify-end outline-none"
            >
              <span
                className="w-full rounded-t-[4px] transition-opacity"
                style={{
                  height: `${Math.max(heightPct, d.completed > 0 ? 4 : 2)}%`,
                  backgroundColor: d.completed > 0 ? BAR_COLOR : EMPTY_COLOR,
                  opacity: hovered && hovered !== d.day ? 0.45 : 1,
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-1 flex gap-1">
        {data.map((d, i) => (
          <span key={d.day} className="flex-1 text-center text-[9px] text-[#898781]">
            {i % 2 === 0 ? formatDisplayDate(d.day) : ""}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>過去14日間の完了数</caption>
        <thead>
          <tr>
            <th>日付</th>
            <th>完了数</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>
                {formatDisplayDate(d.day)}({formatWeekday(d.day)})
              </td>
              <td>{d.completed}件</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
