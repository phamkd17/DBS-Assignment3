// Pure streak math. A streak counts consecutive days (or Sun–Sat weeks) that met their
// goal, ending today/this week if already met, otherwise ending yesterday/last week.
// That way an unmet today is "at risk," not broken, until the day ends.

import { addDays, weekStart, type DayKey } from "./dates";
import type { Region, RoutineData } from "./storage";

export const STRETCH_DAILY_SECONDS = 30;
export const STRETCH_WEEKLY_SECONDS = 10 * 60;
export const STUDY_DAILY_MINUTES = 15;
/** Weekly study goal: the 60-min "Gold" pace × 7 days. Progress only, no streak. */
export const STUDY_WEEKLY_MINUTES = 420;
export const STUDY_TIERS = [
  { minutes: 60, label: "Gold" },
  { minutes: 30, label: "OK" },
  { minutes: 15, label: "Minimum" },
] as const;

export type StreakStatus = "done" | "at-risk" | "broken" | "new";

export type Streak = {
  current: number;
  best: number;
  status: StreakStatus;
};

/** Sum a numeric field per key. */
function totalsBy<T>(entries: T[], key: (e: T) => string, amount: (e: T) => number): Map<string, number> {
  const totals = new Map<string, number>();
  for (const e of entries) totals.set(key(e), (totals.get(key(e)) ?? 0) + amount(e));
  return totals;
}

/**
 * Generic streak over periods (days or weeks). `step` moves one period back;
 * `met` says whether a period reached its goal.
 */
function streakOver(current: DayKey, step: (k: DayKey) => DayKey, met: (k: DayKey) => boolean, periods: DayKey[]): Streak {
  const doneNow = met(current);
  const previous = step(current);
  let count = 0;
  let cursor = doneNow ? current : previous;
  while (met(cursor)) {
    count += 1;
    cursor = step(cursor);
  }

  // Best run across all history, in chronological order.
  const sorted = [...new Set(periods)].filter(met).sort();
  let best = 0;
  let run = 0;
  let prev: DayKey | null = null;
  for (const p of sorted) {
    run = prev !== null && step(p) === prev ? run + 1 : 1;
    best = Math.max(best, run);
    prev = p;
  }

  let status: StreakStatus;
  if (doneNow) status = "done";
  else if (met(previous)) status = "at-risk";
  else status = sorted.length > 0 ? "broken" : "new";

  return { current: count, best: Math.max(best, count), status };
}

const back1Day = (k: DayKey) => addDays(k, -1);
const back1Week = (k: DayKey) => addDays(k, -7);

export function stretchSecondsByDay(data: RoutineData, region: Region): Map<DayKey, number> {
  return totalsBy(data.stretches.filter((s) => s.region === region), (s) => s.date, (s) => s.seconds);
}

export function stretchSecondsByWeek(data: RoutineData, region: Region): Map<DayKey, number> {
  return totalsBy(data.stretches.filter((s) => s.region === region), (s) => weekStart(s.date), (s) => s.seconds);
}

export function studyMinutesByDay(data: RoutineData): Map<DayKey, number> {
  return totalsBy(data.study, (s) => s.date, (s) => s.minutes);
}

export function dailyStretchStreak(data: RoutineData, region: Region, day: DayKey): Streak {
  const byDay = stretchSecondsByDay(data, region);
  return streakOver(day, back1Day, (k) => (byDay.get(k) ?? 0) >= STRETCH_DAILY_SECONDS, [...byDay.keys()]);
}

export function weeklyStretchStreak(data: RoutineData, region: Region, day: DayKey): Streak {
  const byWeek = stretchSecondsByWeek(data, region);
  return streakOver(weekStart(day), back1Week, (k) => (byWeek.get(k) ?? 0) >= STRETCH_WEEKLY_SECONDS, [...byWeek.keys()]);
}

export function studyStreak(data: RoutineData, day: DayKey): Streak {
  const byDay = studyMinutesByDay(data);
  return streakOver(day, back1Day, (k) => (byDay.get(k) ?? 0) >= STUDY_DAILY_MINUTES, [...byDay.keys()]);
}

export function studyTier(minutes: number): (typeof STUDY_TIERS)[number]["label"] | null {
  return STUDY_TIERS.find((t) => minutes >= t.minutes)?.label ?? null;
}

/** Totals for the Sun–Sat week containing `day`. */
export function weekTotals(data: RoutineData, day: DayKey): { shoulderSeconds: number; lowerSeconds: number; studyMinutes: number } {
  const start = weekStart(day);
  const end = addDays(start, 6);
  const inWeek = (d: DayKey) => d >= start && d <= end;
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
  return {
    shoulderSeconds: sum(data.stretches.filter((s) => s.region === "shoulder" && inWeek(s.date)).map((s) => s.seconds)),
    lowerSeconds: sum(data.stretches.filter((s) => s.region === "lower" && inWeek(s.date)).map((s) => s.seconds)),
    studyMinutes: sum(data.study.filter((s) => inWeek(s.date)).map((s) => s.minutes)),
  };
}

export function netCalories(data: RoutineData, day: DayKey): { eaten: number; burned: number; net: number } {
  let eaten = 0;
  let burned = 0;
  for (const c of data.calories) {
    if (c.date !== day) continue;
    if (c.kind === "eaten") eaten += c.kcal;
    else burned += c.kcal;
  }
  return { eaten, burned, net: eaten - burned };
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m} min` : `${m} min ${s} s`;
}
