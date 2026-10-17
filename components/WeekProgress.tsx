"use client";

import { ProgressBar } from "./ui/ProgressBar";
import { formatDay, today, weekStart } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { STRETCH_WEEKLY_SECONDS, STUDY_WEEKLY_MINUTES, formatDuration, weekTotals } from "@/lib/streaks";

/** This Sun–Sat week's progress toward each weekly goal. */
export function WeekProgress() {
  const data = useRoutineData();
  if (!data) return <div className="h-40" aria-hidden="true" />;

  const day = today();
  const week = weekTotals(data, day);
  const goalMinutes = STRETCH_WEEKLY_SECONDS / 60;

  return (
    <div className="flex flex-col gap-4">
      <p className="font-ct-sans text-sm text-ct-muted">Week of {formatDay(weekStart(day), { month: "short", day: "numeric" })} · resets Sunday</p>
      <ProgressBar label="Shoulder stretch" value={week.shoulderSeconds} max={STRETCH_WEEKLY_SECONDS} valueText={`${formatDuration(week.shoulderSeconds)} / ${goalMinutes} min`} />
      <ProgressBar label="Lower-body stretch" value={week.lowerSeconds} max={STRETCH_WEEKLY_SECONDS} valueText={`${formatDuration(week.lowerSeconds)} / ${goalMinutes} min`} />
      <ProgressBar label="FE study" value={week.studyMinutes} max={STUDY_WEEKLY_MINUTES} valueText={`${week.studyMinutes} / ${STUDY_WEEKLY_MINUTES} min`} />
    </div>
  );
}
