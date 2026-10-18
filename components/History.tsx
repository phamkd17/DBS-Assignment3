"use client";

import { useState, type ReactNode } from "react";
import { Button } from "./ui/Button";
import { useToast } from "./ui/Toast";
import { addDays, formatDay, today, type DayKey } from "@/lib/dates";
import { removeEntry, restoreEntry, type RoutineData } from "@/lib/storage";

const DAYS_PER_PAGE = 7;

type Collection = "stretches" | "study" | "calories";

type Props<C extends Collection> = {
  collection: C;
  entries: RoutineData[C][number][];
  /** What the row is, e.g. "Shoulder" or "Statics". */
  label: (entry: RoutineData[C][number]) => ReactNode;
  /** How much, e.g. "30 s" or "250 kcal". */
  amount: (entry: RoutineData[C][number]) => string;
  /** Summary shown next to each day heading, e.g. "1 min 30 s" or "Net −52 kcal". */
  daySummary: (day: DayKey, entries: RoutineData[C][number][]) => string;
  /** Used in the Delete button's accessible name and the Undo toast. */
  describe: (entry: RoutineData[C][number]) => string;
};

function dayHeading(day: DayKey): string {
  const now = today();
  if (day === now) return "Today";
  if (day === addDays(now, -1)) return "Yesterday";
  return formatDay(day);
}

/** Every entry, newest first, grouped by day; 7 days with entries at a time. Delete has Undo. */
export function History<C extends Collection>({ collection, entries, label, amount, daySummary, describe }: Props<C>) {
  const toast = useToast();
  const [pages, setPages] = useState(1);

  const byDay = new Map<DayKey, RoutineData[C][number][]>();
  for (const e of [...entries].sort((a, b) => b.createdAt - a.createdAt)) {
    byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);
  }
  const days = [...byDay.keys()].sort().reverse();
  const visible = days.slice(0, pages * DAYS_PER_PAGE);

  if (days.length === 0) {
    return <p className="font-ct-sans text-[15px] text-ct-muted">Nothing logged yet. Your entries will show up here.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {visible.map((day) => {
        const dayEntries = byDay.get(day)!;
        return (
          <section key={day} aria-labelledby={`h-${collection}-${day}`} className="flex flex-col">
            <h3 id={`h-${collection}-${day}`} className="flex items-baseline justify-between gap-3 border-b border-ct-hairline pb-1.5">
              <span className="font-ct-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ct-muted">{dayHeading(day)}</span>
              <span className="font-ct-sans text-xs text-ct-muted/70">{daySummary(day, dayEntries)}</span>
            </h3>
            <ul className="flex flex-col divide-y divide-ct-hairline">
              {dayEntries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-0.5 font-ct-sans text-[15px]">
                  <span className="min-w-0 truncate text-ct-linen">{label(e)}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <span className="text-ct-muted">{amount(e)}</span>
                    <Button
                      variant="ghost"
                      aria-label={`Delete ${describe(e)} from ${dayHeading(day)}`}
                      onClick={() => {
                        removeEntry(collection, e.id);
                        toast(`Deleted ${describe(e)}`, () => restoreEntry(collection, e));
                      }}
                    >
                      Delete
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {visible.length < days.length && (
        <div>
          <Button variant="secondary" onClick={() => setPages(pages + 1)}>
            Show {Math.min(DAYS_PER_PAGE, days.length - visible.length)} more days
          </Button>
        </div>
      )}
    </div>
  );
}
