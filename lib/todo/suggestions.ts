import type { DailyStat, Suggestion, Todo } from "./types";

export function buildMorningSuggestions(todos: Todo[], stats: DailyStat[], today: string): Suggestion[] {
  const suggestions: Suggestion[] = [];

  const overdue = todos.filter((t) => !t.completed && t.dueDate !== null && t.dueDate < today);
  const dueToday = todos.filter((t) => !t.completed && t.dueDate === today);
  const noDate = todos.filter((t) => !t.completed && t.dueDate === null);

  if (overdue.length > 0) {
    suggestions.push({
      id: "overdue",
      level: "warning",
      text: `期限切れのタスクが${overdue.length}件あります。まずは「${overdue[0].title}」から片付けましょう。`,
    });
  }

  if (dueToday.length > 0) {
    suggestions.push({
      id: "due-today",
      level: "info",
      text: `今日期限のタスクが${dueToday.length}件あります。優先度が高いものから進めましょう。`,
    });
  } else if (overdue.length === 0) {
    suggestions.push({
      id: "no-due",
      level: "good",
      text: "今日期限のタスクはありません。積み残しがあれば1つ進めておくと後が楽になります。",
    });
  }

  const last7 = stats.slice(-7);
  const totalCompleted7 = last7.reduce((sum, d) => sum + d.completed, 0);
  if (totalCompleted7 === 0) {
    suggestions.push({
      id: "cold-start",
      level: "info",
      text: "ここ1週間、完了の記録がありません。小さいタスクからでも1つ終わらせてみましょう。",
    });
  } else if (totalCompleted7 >= 10) {
    suggestions.push({
      id: "great-pace",
      level: "good",
      text: `この1週間で${totalCompleted7}件完了しています。良いペースです、この調子で!`,
    });
  }

  if (noDate.length >= 3) {
    suggestions.push({
      id: "no-date",
      level: "info",
      text: `期限未設定のタスクが${noDate.length}件あります。期限をつけると優先順位が見えやすくなります。`,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({ id: "steady", level: "good", text: "順調です。今日も1つずつ進めましょう。" });
  }

  return suggestions.slice(0, 3);
}
