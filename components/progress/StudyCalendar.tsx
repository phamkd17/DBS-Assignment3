"use client";

import { addDays, formatDay, fromDayKey, toDayKey, weekStart, type DayKey } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { formatMinutes, studyMinutesByDay, studyTier } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";
import { useRoving } from "@/lib/use-roving";

const WEEKS = 12;
const DAYS = WEEKS * 7;

// Ordinal ramp: one hue, darker → brighter on the dark card (validated with the dataviz checker).
const TIER_FILL: Record<string, string> = {
  none: "bg-ct-raised",
  Bronze: "bg-ct-heat-1",
  Silver: "bg-ct-heat-2",
  Gold: "bg-ct-accent",
};
const LEGEND = [
  { key: "none", label: "Under 15" },
  { key: "Bronze", label: "Bronze 15+" },
  { key: "Silver", label: "Silver 30+" },
  { key: "Gold", label: "Gold 60+" },
];
const ROW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/** Last 12 Sun–Sat weeks of FE study, one cell per day, colored by that day's tier. */
export function StudyCalendar() {
  const data = useRoutineData();
  const now = useNow();
  // Cells are in column order (week by week, Sun→Sat); left/right jump a week, up/down a day.
  // Only days up to today are marks, so the tab stop starts on (and arrows stop at) today.
  const todayIndex = now ? (WEEKS - 1) * 7 + fromDayKey(toDayKey(now)).getDay() : DAYS - 1;
  const { shown, markProps } = useRoving(todayIndex + 1, (key) => ({ ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 })[key] ?? null);
  if (!data || !now) return <div className="h-52" aria-hidden="true" />;

  const today = toDayKey(now);
  const first = addDays(weekStart(today), -7 * (WEEKS - 1));
  const cells: DayKey[] = Array.from({ length: DAYS }, (_, i) => addDays(first, i));
  const byDay = studyMinutesByDay(data);
  const minutesOn = (d: DayKey) => Math.max(0, byDay.get(d) ?? 0);
  const tierOn = (d: DayKey) => studyTier(minutesOn(d)) ?? "none";
  const describe = (d: DayKey) => {
    const m = minutesOn(d);
    const tier = studyTier(m);
    return `${formatDay(d)}: ${m > 0 ? formatMinutes(m) : "no study"}${tier ? `, ${tier}` : ""}`;
  };

  // Month labels where a new month starts in a column.
  const monthLabels = Array.from({ length: WEEKS }, (_, w) => {
    const start = cells[w * 7];
    const prev = w > 0 ? cells[(w - 1) * 7] : null;
    return !prev || start.slice(5, 7) !== prev.slice(5, 7) ? fromDayKey(start).toLocaleDateString(undefined, { month: "short" }) : "";
  });
  const studied = cells.filter((d) => d <= today && minutesOn(d) > 0);

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-ct-sans text-sm text-ct-muted">Each square is a day: brighter means more FE study.</figcaption>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <div className="flex flex-col gap-1 pt-5 font-ct-sans text-[11px] text-ct-muted" aria-hidden="true">
          {ROW_LABELS.map((l, i) => (
            <span key={i} className="flex h-5 items-center">
              {i % 2 === 1 ? l : ""}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex gap-1 font-ct-sans text-[11px] text-ct-muted" aria-hidden="true">
            {monthLabels.map((m, w) => (
              <span key={w} className="h-4 w-5 overflow-visible whitespace-nowrap">
                {m}
              </span>
            ))}
          </div>
          <div role="group" aria-label="FE study by day, last 12 weeks. Use arrow keys to move between days." className="grid grid-flow-col grid-rows-7 gap-1">
            {cells.map((d, i) => {
              if (d > today) return <div key={d} aria-hidden="true" className="size-5" />;
              const week = Math.floor(i / 7);
              return (
                <div
                  key={d}
                  {...markProps(i)}
                  role="img"
                  aria-label={describe(d)}
                  className={`relative size-5 rounded outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ct-text hover:ring-2 hover:ring-ct-linen/60 ${TIER_FILL[tierOn(d)]} ${d === today ? "ring-1 ring-ct-linen" : ""}`}
                >
                  {shown === i && (
                    <div
                      role="tooltip"
                      className={`pointer-events-none absolute bottom-full z-10 mb-1.5 whitespace-nowrap rounded-md bg-ct-text px-2.5 py-1.5 font-ct-sans text-ct-bg shadow-ct-glow-strong ${week < 3 ? "left-0" : week > WEEKS - 4 ? "right-0" : "left-1/2 -translate-x-1/2"}`}
                    >
                      <span className="block text-sm font-semibold">{minutesOn(d) > 0 ? formatMinutes(minutesOn(d)) : "No study"}</span>
                      <span className="block text-xs">
                        {formatDay(d)}
                        {studyTier(minutesOn(d)) ? ` · ${studyTier(minutesOn(d))}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 font-ct-sans text-xs text-ct-muted" aria-label="Legend">
        {LEGEND.map((l) => (
          <li key={l.key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-3 rounded-sm ${TIER_FILL[l.key]}`} />
            {l.label}
          </li>
        ))}
      </ul>

      <details className="font-ct-sans text-sm">
        <summary className="w-fit cursor-pointer rounded-sm text-ct-caramel underline decoration-ct-caramel/50 underline-offset-4 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ct-accent">
          Show as table
        </summary>
        {studied.length === 0 ? (
          <p className="mt-3 text-ct-muted">No FE study in the last 12 weeks yet.</p>
        ) : (
          <table className="mt-3 w-full text-left">
            <thead>
              <tr className="border-b border-ct-hairline text-[11px] uppercase tracking-[0.18em] text-ct-muted">
                <th scope="col" className="py-1.5 font-semibold">Day</th>
                <th scope="col" className="py-1.5 text-right font-semibold">Minutes</th>
                <th scope="col" className="py-1.5 text-right font-semibold">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ct-hairline">
              {[...studied].reverse().map((d) => (
                <tr key={d}>
                  <td className="py-1.5 text-ct-linen">{formatDay(d)}</td>
                  <td className="py-1.5 text-right text-ct-muted tabular-nums">{formatMinutes(minutesOn(d))}</td>
                  <td className="py-1.5 text-right text-ct-muted">{studyTier(minutesOn(d)) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </details>
    </figure>
  );
}
