"use client";

import { toDayKey } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { studyMinutesByDay } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

/** Small line of today's study minutes, across all sessions. Sits under the FE study heading. */
export function StudyMinutesToday() {
  const data = useRoutineData();
  const now = useNow();
  if (!data || !now) return null;
  const minutes = studyMinutesByDay(data).get(toDayKey(now)) ?? 0;
  return <p className="font-ct-sans text-sm text-ct-muted">{minutes} min today</p>;
}
