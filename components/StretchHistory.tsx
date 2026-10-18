"use client";

import { History } from "./History";
import { REGION_NAME } from "@/lib/log-actions";
import { useRoutineData } from "@/lib/storage";
import { formatDuration } from "@/lib/streaks";

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

export function StretchHistory() {
  const data = useRoutineData();
  if (!data) return null;
  return (
    <History
      collection="stretches"
      entries={data.stretches}
      label={(e) => capitalize(REGION_NAME[e.region]) + (e.seconds < 0 ? " (subtracted)" : "")}
      amount={(e) => (e.seconds < 0 ? `−${formatDuration(-e.seconds)}` : formatDuration(e.seconds))}
      daySummary={(_, entries) => {
        const sum = (r: "shoulder" | "lower") => entries.filter((e) => e.region === r).reduce((t, e) => t + e.seconds, 0);
        return `Shoulder ${formatDuration(sum("shoulder"))} · Lower body ${formatDuration(sum("lower"))}`;
      }}
      describe={(e) => `${formatDuration(Math.abs(e.seconds))} ${REGION_NAME[e.region]}`}
    />
  );
}
