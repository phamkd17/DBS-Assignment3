"use client";

import { toDayKey } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { studyMinutesByDay } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

/** Small inline total of today's study minutes, across all sessions. */
export function StudyMinutesToday() {
  const data = useRoutineData();
  const now = useNow();
  if (!data || !now) return null;
  const minutes = studyMinutesByDay(data).get(toDayKey(now)) ?? 0;
  return <span className="ml-3 align-middle font-ct-sans text-sm not-italic text-ct-muted">{minutes} min today</span>;
}
