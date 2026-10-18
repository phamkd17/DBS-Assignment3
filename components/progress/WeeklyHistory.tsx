"use client";

import { addDays, formatDay, today, weekStart } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { STRETCH_WEEKLY_SECONDS, STUDY_WEEKLY_MINUTES, formatCompactMinutes, formatCompactSeconds, weekTotals } from "@/lib/streaks";

const WEEKS = 8;

/** A value with a small meter toward its weekly goal; green with ✓ when met. */
function Cell({ value, goal, text }: { value: number; goal: number; text: string }) {
  const met = value >= goal;
  return (
    <td className="py-1.5 pl-3 align-top sm:py-2">
      <span className={`block text-right text-sm whitespace-nowrap tabular-nums ${met ? "font-semibold text-ct-success" : "text-ct-muted"}`}>
        {text}
        {met && " ✓"}
      </span>
      <span aria-hidden="true" className="mt-0.5 block h-1.5 sm:mt-1 overflow-hidden rounded-full bg-ct-raised">
        <span className={`block h-full rounded-full ${met ? "bg-ct-success" : "bg-ct-chart"}`} style={{ width: `${Math.min(100, (Math.max(0, value) / goal) * 100)}%` }} />
      </span>
    </td>
  );
}

/** The last 8 Sun–Sat weeks against each weekly goal: 10 min per stretch region, 420 min of FE study. */
export function WeeklyHistory() {
  const data = useRoutineData();
  if (!data) return <div className="h-80" aria-hidden="true" />;
  const thisWeek = weekStart(today());
  const weeks = Array.from({ length: WEEKS }, (_, i) => addDays(thisWeek, -7 * i));

  return (
    <table className="w-full table-fixed font-ct-sans">
      <caption className="sr-only">Weekly totals for the last 8 weeks against each goal</caption>
      <thead>
        <tr className="border-b border-ct-hairline text-[11px] uppercase tracking-[0.18em] text-ct-muted">
          <th scope="col" className="w-24 py-1.5 text-left font-semibold">Week</th>
          <th scope="col" className="py-1.5 pl-3 text-right font-semibold">Shoulder</th>
          <th scope="col" className="py-1.5 pl-3 text-right font-semibold">Lower</th>
          <th scope="col" className="py-1.5 pl-3 text-right font-semibold">Study</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-ct-hairline">
        {weeks.map((w) => {
          const t = weekTotals(data, w);
          return (
            <tr key={w}>
              <th scope="row" className="py-1.5 text-left sm:py-2 align-top text-sm font-normal text-ct-linen">
                {w === thisWeek ? "This week" : formatDay(w, { month: "short", day: "numeric" })}
              </th>
              <Cell value={t.shoulderSeconds} goal={STRETCH_WEEKLY_SECONDS} text={formatCompactSeconds(Math.max(0, t.shoulderSeconds))} />
              <Cell value={t.lowerSeconds} goal={STRETCH_WEEKLY_SECONDS} text={formatCompactSeconds(Math.max(0, t.lowerSeconds))} />
              <Cell value={t.studyMinutes} goal={STUDY_WEEKLY_MINUTES} text={formatCompactMinutes(Math.max(0, t.studyMinutes))} />
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
