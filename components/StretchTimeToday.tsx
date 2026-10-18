"use client";

import { toDayKey } from "@/lib/dates";
import { useRoutineData, type Region } from "@/lib/storage";
import { formatDuration } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

/** Small inline totals of today's stretching, one per region. */
export function StretchTimeToday() {
  const data = useRoutineData();
  const now = useNow();
  if (!data || !now) return null;
  const day = toDayKey(now);
  const total = (region: Region) => data.stretches.filter((s) => s.date === day && s.region === region).reduce((sum, s) => sum + s.seconds, 0);
  return (
    <span className="ml-3 align-middle font-ct-sans text-sm not-italic text-ct-muted">
      Shoulder {formatDuration(total("shoulder"))} · Lower body {formatDuration(total("lower"))} today
    </span>
  );
}
