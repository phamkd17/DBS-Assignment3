"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { addDays, formatDay, fromDayKey, toDayKey, weekStart, type DayKey } from "@/lib/dates";
import { focusRing } from "./styles";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthStart(key: DayKey): DayKey {
  return `${key.slice(0, 7)}-01`;
}

function addMonths(key: DayKey, months: number): DayKey {
  const date = fromDayKey(monthStart(key));
  date.setMonth(date.getMonth() + months);
  return toDayKey(date);
}

/** Same day-of-month in another month, clamped to that month's length. */
function shiftMonth(key: DayKey, months: number): DayKey {
  const target = addMonths(key, months);
  const lastDay = addDays(addMonths(target, 1), -1);
  const day = `${target.slice(0, 8)}${key.slice(8)}`;
  return day > lastDay ? lastDay : day;
}

type Props = {
  value: DayKey;
  onChange: (day: DayKey) => void;
  /** Latest selectable day (inclusive), e.g. today. */
  max: DayKey;
  today: DayKey;
  labelledBy?: string;
};

/** A month grid in the app's style. Arrow keys move by day/week, Page Up/Down by month. */
export function Calendar({ value, onChange, max, today, labelledBy }: Props) {
  const [view, setView] = useState(monthStart(value));
  const [focused, setFocused] = useState(value);
  const grid = useRef<HTMLTableElement>(null);
  const moveFocus = useRef(false);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${focused}"]`)?.focus();
  }, [focused, view]);

  function go(day: DayKey) {
    const next = day > max ? max : day;
    moveFocus.current = true;
    setFocused(next);
    setView(monthStart(next));
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, day: DayKey) {
    const moves: Record<string, () => DayKey> = {
      ArrowLeft: () => addDays(day, -1),
      ArrowRight: () => addDays(day, 1),
      ArrowUp: () => addDays(day, -7),
      ArrowDown: () => addDays(day, 7),
      Home: () => weekStart(day),
      End: () => addDays(weekStart(day), 6),
      PageUp: () => shiftMonth(day, -1),
      PageDown: () => shiftMonth(day, 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    go(move());
  }

  // Weeks covering the visible month; days outside it are blank cells.
  const first = view;
  const last = addDays(addMonths(view, 1), -1);
  const weeks: (DayKey | null)[][] = [];
  for (let start = weekStart(first); start <= last; start = addDays(start, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => {
      const day = addDays(start, i);
      return day >= first && day <= last ? day : null;
    }));
  }

  const canGoNext = addMonths(view, 1) <= max;
  const monthLabel = fromDayKey(view).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  // Keep exactly one day in the tab order: the focused day if it's in view, else the 1st.
  const tabbable = focused >= first && focused <= last ? focused : first;

  const navButton = `inline-flex size-11 items-center justify-center rounded-full text-lg text-ct-linen transition-colors hover:bg-ct-raised disabled:cursor-not-allowed disabled:text-ct-muted/40 disabled:hover:bg-transparent cursor-pointer ${focusRing}`;

  return (
    <div className="w-full max-w-sm rounded-xl border border-ct-border bg-ct-raised p-3">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className={navButton} aria-label="Previous month" onClick={() => setView(addMonths(view, -1))}>
          ‹
        </button>
        <p aria-live="polite" className="font-ct-serif text-lg italic text-ct-text">
          {monthLabel}
        </p>
        <button type="button" className={navButton} aria-label="Next month" disabled={!canGoNext} onClick={() => setView(addMonths(view, 1))}>
          ›
        </button>
      </div>

      <table ref={grid} className="w-full table-fixed border-collapse" aria-labelledby={labelledBy}>
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" abbr={d} className="pb-1 font-ct-sans text-[11px] font-semibold uppercase tracking-wider text-ct-muted">
                {d.slice(0, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((day, i) => {
                if (!day) return <td key={i} />;
                const selected = day === value;
                const isToday = day === today;
                const disabled = day > max;
                return (
                  <td key={day} className="p-0.5 text-center">
                    <button
                      type="button"
                      data-day={day}
                      tabIndex={day === tabbable ? 0 : -1}
                      disabled={disabled}
                      aria-pressed={selected}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={formatDay(day, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                      onClick={() => {
                        setFocused(day);
                        onChange(day);
                      }}
                      onKeyDown={(e) => onKeyDown(e, day)}
                      className={`inline-flex size-10 items-center justify-center rounded-full font-ct-sans text-sm transition-colors cursor-pointer ${focusRing} ${
                        selected
                          ? "bg-ct-selected font-semibold text-ct-text"
                          : disabled
                            ? "cursor-not-allowed text-ct-muted/40"
                            : `text-ct-linen hover:bg-ct-surface ${isToday ? "border border-ct-accent text-ct-text" : ""}`
                      }`}
                    >
                      {Number(day.slice(8))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
