"use client";

import { today } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { dailyStretchStreak, studyStreak, weeklyStretchStreak, type Streak } from "@/lib/streaks";

function Tile({ label, streak, unit }: { label: string; streak: Streak; unit: "day" | "week" }) {
  const { current, best, status } = streak;
  const period = unit === "day" ? "today" : "this week";
  // Short status so every tile is the same four short lines on a phone; the full meaning is in the accessible name.
  const [statusText, tone, spoken] =
    status === "done"
      ? [unit === "day" ? "✓ Today" : "✓ This week", "text-ct-success", `done ${period}`]
      : status === "at-risk"
        ? ["At risk", "text-ct-accent", `at risk, not done ${period} yet`]
        : status === "broken"
          ? ["Reset", "text-ct-muted", "reset, start again"]
          : ["Not started", "text-ct-muted", "not started"];
  return (
    <li aria-label={`${{ Lower: "Lower body", Study: "FE study" }[label] ?? label}: ${current} ${unit}${current === 1 ? "" : "s"}, best ${best}, ${spoken}`} className="flex flex-col rounded-xl border border-ct-hairline px-2.5 py-2 sm:gap-1 sm:p-4">
      <span aria-hidden="true" className="truncate font-ct-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ct-muted">
        {label}
      </span>
      <span aria-hidden="true" className="font-ct-sans text-2xl leading-tight font-semibold text-ct-text sm:text-3xl">
        {current}{" "}
        <span className="text-sm font-medium text-ct-linen sm:text-base">
          {unit}
          {current === 1 ? "" : "s"}
        </span>
      </span>
      <span aria-hidden="true" className={`font-ct-sans text-xs whitespace-nowrap ${tone}`}>
        {statusText}
      </span>
      <span aria-hidden="true" className="font-ct-sans text-xs text-ct-muted/70">
        Best {best}
      </span>
    </li>
  );
}

const groupLabel = "font-ct-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ct-muted";

/** All five streaks in two compact rows: daily (3) and weekly (2). */
export function StreakBoard() {
  const data = useRoutineData();
  if (!data) return <div className="h-48" aria-hidden="true" />;
  const day = today();
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <h3 className={groupLabel}>Daily</h3>
      <ul className="grid grid-cols-3 gap-2 sm:gap-3">
        <Tile label="Shoulder" streak={dailyStretchStreak(data, "shoulder", day)} unit="day" />
        <Tile label="Lower" streak={dailyStretchStreak(data, "lower", day)} unit="day" />
        <Tile label="Study" streak={studyStreak(data, day)} unit="day" />
      </ul>
      <h3 className={groupLabel}>Weekly</h3>
      <ul className="grid grid-cols-3 gap-2 sm:gap-3">
        <Tile label="Shoulder" streak={weeklyStretchStreak(data, "shoulder", day)} unit="week" />
        <Tile label="Lower" streak={weeklyStretchStreak(data, "lower", day)} unit="week" />
      </ul>
    </div>
  );
}
