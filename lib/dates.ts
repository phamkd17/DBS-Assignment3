// Local-time day keys ("YYYY-MM-DD"). Weeks run Sunday–Saturday.

export type DayKey = string;

export function toDayKey(date: Date): DayKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function today(): DayKey {
  return toDayKey(new Date());
}

export function addDays(key: DayKey, days: number): DayKey {
  const date = fromDayKey(key);
  date.setDate(date.getDate() + days);
  return toDayKey(date);
}

/** The Sunday that starts the week containing `key`. */
export function weekStart(key: DayKey): DayKey {
  const date = fromDayKey(key);
  return addDays(key, -date.getDay());
}

export function formatDay(key: DayKey, options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }): string {
  return fromDayKey(key).toLocaleDateString(undefined, options);
}
