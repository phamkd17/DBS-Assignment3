"use client";

import { DailyChart, type Series } from "./DailyChart";
import { addDays, toDayKey, type DayKey } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { formatDuration, stretchSecondsByDay } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

/** About six months of days. */
const DAYS = 183;

const SERIES: Series[] = [
  { key: "shoulder", label: "Shoulder", fill: "bg-ct-shoulder", side: "up" },
  { key: "lower", label: "Lower body", fill: "bg-ct-lower", ink: "light", side: "up" },
];

/** Stretch time per day for six months, one week visible: shoulder and lower body stacked. */
export function StretchTrend() {
  const data = useRoutineData();
  const now = useNow();
  if (!data || !now) return <div className="h-80" aria-hidden="true" />;

  const end = toDayKey(now);
  const firstLog = data.stretches.reduce<DayKey>((min, s) => (s.date < min ? s.date : min), end);
  const shoulder = stretchSecondsByDay(data, "shoulder");
  const lower = stretchSecondsByDay(data, "lower");
  const rows = Array.from({ length: DAYS }, (_, i) => {
    const day = addDays(end, i - DAYS + 1);
    // Values in minutes so the axis reads in clean minute steps.
    return { day, tracked: day >= firstLog, values: { shoulder: Math.max(0, shoulder.get(day) ?? 0) / 60, lower: Math.max(0, lower.get(day) ?? 0) / 60 } };
  });

  return (
    <DailyChart
      caption="Stretch time per day, one week at a time: shoulder and lower body stacked. Numbers inside the bars are seconds. Scroll left to go back up to 6 months."
      series={SERIES}
      rows={rows}
      format={(minutes) => formatDuration(Math.round(minutes * 60))}
      formatTick={(minutes) => `${minutes}m`}
      segmentLabel={(minutes) => `${Math.round(minutes * 60)}`}
      groupLabel="Stretch time by day. Use arrow keys to move between days, Page Up and Page Down to jump a week."
    />
  );
}
