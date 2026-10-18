"use client";

import { toDayKey } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { formatDuration } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

/** Small inline total of today's stretching, both regions combined. */
export function StretchTimeToday() {
  const data = useRoutineData();
  const now = useNow();
  if (!data || !now) return null;
  const day = toDayKey(now);
  const seconds = data.stretches.filter((s) => s.date === day).reduce((sum, s) => sum + s.seconds, 0);
  return <span className="ml-3 align-middle font-ct-sans text-sm not-italic text-ct-muted">{formatDuration(seconds)} today</span>;
}
