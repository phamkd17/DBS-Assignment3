"use client";

import { toDayKey } from "@/lib/dates";
import { useRoutineData, type Region } from "@/lib/storage";
import { formatDuration } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

/** Small line of today's stretching totals, one per region. Sits under the Stretch heading. */
export function StretchTimeToday() {
  const data = useRoutineData();
  const now = useNow();
  if (!data || !now) return null;
  const day = toDayKey(now);
  const total = (region: Region) => data.stretches.filter((s) => s.date === day && s.region === region).reduce((sum, s) => sum + s.seconds, 0);
  return (
    <p className="font-ct-sans text-xs text-ct-muted/70">
      Shoulder {formatDuration(total("shoulder"))} · Lower body {formatDuration(total("lower"))} today
    </p>
  );
}
