"use client";

import { ProgressBar } from "./ui/ProgressBar";
import { formatDay, today, weekStart } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { STRETCH_WEEKLY_SECONDS, STUDY_WEEKLY_MINUTES, formatDuration, formatKcal, weekCalories, weekTotals } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

/** This Sun–Sat week's progress toward each weekly goal. */
export function WeekProgress() {
  const data = useRoutineData();
  const now = useNow();
  if (!data || !now) return <div className="h-48" aria-hidden="true" />;

  const day = today();
  const calories = weekCalories(data, now);
  const week = weekTotals(data, day);
  const goalMinutes = STRETCH_WEEKLY_SECONDS / 60;

  return (
    <div className="flex flex-col gap-4">
      <p className="font-ct-sans text-sm text-ct-muted">Week of {formatDay(weekStart(day), { month: "short", day: "numeric" })} · resets Sunday</p>
      <ProgressBar label="Shoulder stretch" value={week.shoulderSeconds} max={STRETCH_WEEKLY_SECONDS} valueText={`${formatDuration(week.shoulderSeconds)} / ${goalMinutes} min`} />
      <ProgressBar label="Lower-body stretch" value={week.lowerSeconds} max={STRETCH_WEEKLY_SECONDS} valueText={`${formatDuration(week.lowerSeconds)} / ${goalMinutes} min`} />
      <ProgressBar label="FE study" value={week.studyMinutes} max={STUDY_WEEKLY_MINUTES} valueText={`${week.studyMinutes} / ${STUDY_WEEKLY_MINUTES} min`} />
      <div className="flex items-baseline justify-between gap-4 border-t border-ct-hairline pt-4 font-ct-sans text-sm">
        <span className="text-ct-linen">Calories (net)</span>
        <span className="text-ct-muted">
          {formatKcal(calories.net)} · avg {calories.averagePerDay.toLocaleString()}/day
        </span>
      </div>
    </div>
  );
}
