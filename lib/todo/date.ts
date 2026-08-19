const DAY_START_HOUR = 6;

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * The app's "day" starts at 06:00, not midnight, so late-night work still
 * counts toward the previous day and the morning suggestion refreshes at 6am.
 */
export function getAppDay(date: Date = new Date()): string {
  const shifted = new Date(date.getTime() - DAY_START_HOUR * 60 * 60 * 1000);
  return formatDateKey(shifted);
}

export function appDayToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, delta: number): string {
  const dt = appDayToDate(key);
  dt.setDate(dt.getDate() + delta);
  return formatDateKey(dt);
}

export function formatDisplayDate(key: string): string {
  const dt = appDayToDate(key);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatWeekday(key: string): string {
  return WEEKDAY_LABELS[appDayToDate(key).getDay()];
}

export function getWeekdayIndex(key: string): number {
  return appDayToDate(key).getDay();
}

export function weekdayLabel(index: number): string {
  return WEEKDAY_LABELS[index];
}

export function formatTime(iso: string): string {
  const dt = new Date(iso);
  return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
}
