"use client";

import { StretchTrend } from "./StretchTrend";
import { fromDayKey, today, weekStart } from "@/lib/dates";
import { useRoutineData, type Region } from "@/lib/storage";
import { STRETCH_WEEKLY_SECONDS, formatDuration, formatMinutes } from "@/lib/streaks";

/** "45 s", "12 min 30 s", or past an hour "1 h 10 min". */
const formatTotal = (seconds: number) => (seconds >= 3600 ? formatMinutes(Math.round(seconds / 60)) : formatDuration(seconds));

const REGIONS: { region: Region; label: string }[] = [
  { region: "shoulder", label: "Shoulder" },
  { region: "lower", label: "Lower body" },
];

/** Cumulative stretching per region: total time, days, and average per week vs the 10-min goal, then the daily chart. */
export function StretchTotal() {
  const data = useRoutineData();
  if (!data) return <div className="h-40" aria-hidden="true" />;

  const positive = data.stretches.filter((s) => s.seconds > 0);

  // Weeks since the first stretch, counting this week.
  const first = positive.reduce<string | null>((min, s) => (min === null || s.date < min ? s.date : min), null);
  const weeks = first ? Math.round((fromDayKey(weekStart(today())).getTime() - fromDayKey(weekStart(first)).getTime()) / (7 * 86_400_000)) + 1 : 1;

  return (
    <div className="flex flex-col gap-2.5 sm:gap-4">
      <ul className="flex flex-col divide-y divide-ct-hairline font-ct-sans">
        {REGIONS.map(({ region, label }) => {
          const entries = data.stretches.filter((s) => s.region === region);
          const seconds = Math.max(0, entries.reduce((sum, s) => sum + s.seconds, 0));
          const regionDays = new Set(entries.filter((s) => s.seconds > 0).map((s) => s.date)).size;
          const perWeek = Math.round(seconds / weeks);
          const onPace = perWeek >= STRETCH_WEEKLY_SECONDS;
          return (
            <li key={region} className="flex flex-col gap-0.5 py-1.5 sm:py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] text-ct-linen">{label}</span>
                <span className="text-[15px] font-semibold text-ct-text">{formatTotal(seconds)}</span>
              </div>
              <span className="text-xs text-ct-muted/70">
                {regionDays} {regionDays === 1 ? "day" : "days"} · avg{" "}
                <span className={onPace ? "font-semibold text-ct-success" : ""}>
                  {formatDuration(perWeek)}/week{onPace ? " ✓" : ""}
                </span>{" "}
                (goal 10 min)
              </span>
            </li>
          );
        })}
      </ul>
      <StretchTrend />
    </div>
  );
}
