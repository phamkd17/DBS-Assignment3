"use client";

import { today } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { dailyStretchStreak, studyStreak, weeklyStretchStreak, type Streak } from "@/lib/streaks";

function Tile({ label, streak, unit }: { label: string; streak: Streak; unit: "day" | "week" }) {
  const { current, best, status } = streak;
  const period = unit === "day" ? "today" : "this week";
  const [statusText, tone] =
    status === "done"
      ? [`✓ Done ${period}`, "text-ct-success"]
      : status === "at-risk"
        ? [`At risk: not done ${period} yet`, "text-ct-accent"]
        : status === "broken"
          ? ["Reset. Start again", "text-ct-muted"]
          : ["Not started", "text-ct-muted"];
  return (
    <li className="flex flex-col gap-1 rounded-xl border border-ct-hairline p-4">
      <span className="font-ct-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ct-muted">{label}</span>
      <span className="font-ct-sans text-3xl font-semibold text-ct-text">
        {current} <span className="text-base font-medium text-ct-linen">{unit}{current === 1 ? "" : "s"}</span>
      </span>
      <span className="font-ct-sans text-xs text-ct-muted/70">Best {best}</span>
      <span className={`font-ct-sans text-sm ${tone}`}>{statusText}</span>
    </li>
  );
}

/** All five streaks: current, best, and today's / this week's status. */
export function StreakBoard() {
  const data = useRoutineData();
  if (!data) return <div className="h-64" aria-hidden="true" />;
  const day = today();
  return (
    <ul className="grid grid-cols-2 gap-3">
      <Tile label="Shoulder · daily" streak={dailyStretchStreak(data, "shoulder", day)} unit="day" />
      <Tile label="Lower body · daily" streak={dailyStretchStreak(data, "lower", day)} unit="day" />
      <Tile label="Shoulder · weekly" streak={weeklyStretchStreak(data, "shoulder", day)} unit="week" />
      <Tile label="Lower body · weekly" streak={weeklyStretchStreak(data, "lower", day)} unit="week" />
      <Tile label="FE study · daily" streak={studyStreak(data, day)} unit="day" />
    </ul>
  );
}
