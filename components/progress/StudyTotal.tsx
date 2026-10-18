"use client";

import { useRoutineData } from "@/lib/storage";
import { formatMinutes } from "@/lib/streaks";

/** All-time FE study time: the one hero number on Progress. */
export function StudyTotal() {
  const data = useRoutineData();
  if (!data) return <div className="h-20" aria-hidden="true" />;
  const total = Math.max(0, data.study.reduce((sum, s) => sum + s.minutes, 0));
  const days = new Set(data.study.filter((s) => s.minutes > 0).map((s) => s.date)).size;
  return (
    <div className="flex flex-col gap-1">
      <p className="font-ct-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ct-muted">FE study, all time</p>
      <p className="font-ct-sans text-5xl font-semibold text-ct-text">{formatMinutes(total)}</p>
      <p className="font-ct-sans text-xs text-ct-muted/70">
        Across {days} {days === 1 ? "day" : "days"}
      </p>
    </div>
  );
}
