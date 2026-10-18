"use client";

import { DailyChart, type Series } from "./DailyChart";
import { addDays, toDayKey, type DayKey } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { formatKcal, netCalories } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

/** About six months of days. */
const DAYS = 183;

const SERIES: Series[] = [
  { key: "consumed", label: "Consumed", fill: "bg-ct-consumed", side: "up" },
  { key: "resting", label: "Resting burn", fill: "bg-ct-resting", checker: true, side: "down" },
  { key: "active", label: "Active burn", fill: "bg-ct-active", ink: "light", side: "down" },
];

const compact = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K` : `${v}`);

/**
 * Calories per day for six months, one week visible: consumed above zero, resting and active
 * burn below, net as a dot. Days before the first calorie log are blank (no made-up burn).
 */
export function CalorieTrend() {
  const data = useRoutineData();
  const now = useNow();
  if (!data || !now) return <div className="h-80" aria-hidden="true" />;

  const end = toDayKey(now);
  const firstLog = data.calories.reduce<DayKey>((min, c) => (c.date < min ? c.date : min), end);
  const rows = Array.from({ length: DAYS }, (_, i) => {
    const day = addDays(end, i - DAYS + 1);
    const n = netCalories(data, day, now);
    return { day, tracked: day >= firstLog, values: { consumed: n.eaten, resting: n.bodyBurn, active: n.exercise }, dot: n.net };
  });

  return (
    <DailyChart
      caption="Calories per day, one week at a time: consumed above the line, burned below. The number at each dot is that day's net. Scroll left to go back up to 6 months. Today is so far."
      series={SERIES}
      rows={rows}
      dotLabel="Net"
      format={formatKcal}
      formatTick={compact}
      dotText={(net) => `${net > 0 ? "+" : net < 0 ? "−" : ""}${Math.abs(Math.round(net)).toLocaleString()}`}
      groupLabel="Calories by day. Use arrow keys to move between days, Page Up and Page Down to jump a week."
    />
  );
}
