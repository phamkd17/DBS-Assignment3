"use client";

import { useEffect, useId, useRef } from "react";
import { ChoiceGroup } from "./ChoiceGroup";
import { FieldError } from "./Field";
import { Calendar } from "./Calendar";
import { label as labelStyle } from "./styles";
import { addDays, formatDay, today, type DayKey } from "@/lib/dates";

export type DayValue = { mode: "today" | "date"; date: DayKey | "" };

/** Starts on Today. The date field is filled in (with yesterday) only when someone picks a date. */
export const INITIAL_DAY: DayValue = { mode: "today", date: "" };

/** The chosen day, or an error message that says what to do next. */
export function resolveDay(value: DayValue): { day: DayKey } | { error: string } {
  if (value.mode === "today") return { day: today() };
  if (!value.date) return { error: "Pick a date." };
  if (value.date > today()) return { error: "Pick today or an earlier date." };
  return { day: value.date };
}

type Props = {
  name: string;
  value: DayValue;
  onChange: (value: DayValue) => void;
  error?: string;
};

/** "Today" by default; "Pick a date" opens a calendar for logging a past day. */
export function DayPicker({ name, value, onChange, error }: Props) {
  const id = useId();
  const calendarRef = useRef<HTMLDivElement>(null);
  const picking = value.mode === "date";

  // Choosing "Pick a date" moves focus onto the selected day in the calendar.
  const wasPicking = useRef(picking);
  useEffect(() => {
    if (picking && !wasPicking.current) {
      calendarRef.current?.querySelector<HTMLButtonElement>('button[data-day][tabindex="0"]')?.focus();
    }
    wasPicking.current = picking;
  }, [picking]);

  return (
    <div className="flex flex-col gap-3">
      <ChoiceGroup
        legend="Day"
        name={name}
        value={value.mode}
        onChange={(mode) => onChange({ mode, date: mode === "date" && !value.date ? addDays(today(), -1) : value.date })}
        options={[
          { value: "today", label: "Today" },
          { value: "date", label: "Pick a date" },
        ]}
      />
      {picking && (
        <div ref={calendarRef} className="flex flex-col gap-2">
          <p id={`${id}-label`} className={labelStyle}>
            Date{value.date && <span className="normal-case tracking-normal text-ct-text"> · {formatDay(value.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>}
          </p>
          <Calendar
            value={value.date || today()}
            onChange={(date) => onChange({ ...value, date })}
            max={today()}
            today={today()}
            labelledBy={`${id}-label`}
          />
          {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
        </div>
      )}
    </div>
  );
}
