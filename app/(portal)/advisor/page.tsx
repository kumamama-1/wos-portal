"use client";

import { useState } from "react";

type Budget = "free" | "small" | "medium" | "large";
type Playstyle = "combat" | "economy" | "balanced";
type Priority = "efficiency" | "collection" | "power";

const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
  { value: "free", label: "無課金でいきたい" },
  { value: "small", label: "少額（〜1,000円程度）" },
  { value: "medium", label: "中程度（1,000〜5,000円程度）" },
  { value: "large", label: "しっかり課金（5,000円以上）" },
];

const PLAYSTYLE_OPTIONS: { value: Playstyle; label: string }[] = [
  { value: "combat", label: "戦闘・遠征重視" },
  { value: "economy", label: "内政・育成重視" },
  { value: "balanced", label: "バランス型" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "efficiency", label: "時短・効率化" },
  { value: "collection", label: "見た目・コレクション" },
  { value: "power", label: "戦力の即戦力化" },
];

function buildAdvice(budget: Budget, playstyle: Playstyle, priority: Priority) {
  const lines: string[] = [];

  if (budget === "free") {
    lines.push(
      "無課金プレイなら、まずは無料で得られる「初回ログイン特典」「同盟ヘルプ」「イベント報酬」を最大限活用するのが優先です。"
    );
    lines.push(
      "どうしても1回だけ課金するなら、多くのゲームで初回限定の「お試しパック」的な一度きりの割引パックが最もコストパフォーマンスが良い傾向にあります。"
    );
  } else if (budget === "small") {
    lines.push("少額課金なら、まずは一度きりの割引パック（初回限定パック）でコスパの良いスタートを切りましょう。");
    if (playstyle === "economy") {
      lines.push("内政・育成重視なら、資源や加速アイテムがまとまって割安に手に入るバリューパックが特に相性が良いです。");
    } else if (playstyle === "combat") {
      lines.push("戦闘重視なら、英雄経験値や装備強化素材が含まれる少額パックを優先すると効果を感じやすいです。");
    } else {
      lines.push("バランス型なら、資源・加速アイテム・強化素材がまとまった汎用パックが無難です。");
    }
  } else if (budget === "medium") {
    lines.push(
      "中程度の予算なら、月額の「成長基金」や「月間パス」系（継続的にログインするだけでリターンが積み上がるタイプ）が土台としてコスパが良い傾向にあります。"
    );
    if (priority === "efficiency") {
      lines.push("時短・効率化を優先するなら、加速アイテムや資源が多く含まれるパックを追加するのがおすすめです。");
    } else if (priority === "power") {
      lines.push("即戦力化を優先するなら、英雄や装備の強化素材が含まれるパックを追加すると良いでしょう。");
    } else {
      lines.push("見た目・コレクション重視なら、月額パスで土台を固めつつ、気に入ったスキンパックを個別に検討するのがおすすめです。");
    }
  } else {
    lines.push(
      "しっかり課金する予算があるなら、月額パス（成長基金系）に加えて、VIPレベルへの投資を検討すると恩恵が長期的に積み上がります。"
    );
    if (playstyle === "combat") {
      lines.push("戦闘・遠征重視なら、期間限定の英雄召喚パックや装備強化イベントパックの優先度が高くなります。");
    } else if (playstyle === "economy") {
      lines.push("内政・育成重視なら、資源生産効率を上げる恒常パックや建設加速の大型パックが投資対効果が高いです。");
    } else {
      lines.push("バランス型なら、月額パスとVIPを土台にしつつ、期間限定パックはイベントの重要度に応じて都度検討しましょう。");
    }
  }

  return lines;
}

export default function AdvisorPage() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [playstyle, setPlaystyle] = useState<Playstyle | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);

  const advice = budget && playstyle && priority ? buildAdvice(budget, playstyle, priority) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold">課金パーソナル診断</h1>
      <p className="mt-2 text-sm text-gray-500">
        予算・プレイスタイル・優先したいことを選ぶと、あなたに合った課金の考え方を診断します。
      </p>
      <p className="mt-2 text-xs text-gray-400">
        ※特定のパック名や価格を保証するものではなく、一般的な傾向に基づくアドバイスです。実際の内容は必ずゲーム内でご確認ください。
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <p className="mb-3 text-sm font-bold text-gray-700">① 月々の課金予算は？</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBudget(opt.value)}
                className={`rounded-xl border-2 p-3 text-sm transition ${
                  budget === opt.value
                    ? "border-red-500 bg-red-50 font-bold text-red-700"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-gray-700">② プレイスタイルは？</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {PLAYSTYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPlaystyle(opt.value)}
                className={`rounded-xl border-2 p-3 text-sm transition ${
                  playstyle === opt.value
                    ? "border-red-500 bg-red-50 font-bold text-red-700"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-gray-700">③ 何を優先したい？</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`rounded-xl border-2 p-3 text-sm transition ${
                  priority === opt.value
                    ? "border-red-500 bg-red-50 font-bold text-red-700"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {advice && (
          <div className="rounded-xl border-2 border-amber-100 bg-amber-50 p-5">
            <p className="mb-2 text-sm font-bold text-amber-700">診断結果</p>
            <div className="space-y-2 text-sm text-amber-900">
              {advice.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
