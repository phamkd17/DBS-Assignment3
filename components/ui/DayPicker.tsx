"use client";

import { useEffect, useId, useRef } from "react";
import { ChoiceGroup } from "./ChoiceGroup";
import { FieldError } from "./Field";
import { Input } from "./Input";
import { label as labelStyle } from "./styles";
import { addDays, today, type DayKey } from "@/lib/dates";

export type DayValue = { mode: "today" | "date"; date: DayKey | "" };

export function initialDay(): DayValue {
  return { mode: "today", date: addDays(today(), -1) };
}

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
  const dateRef = useRef<HTMLInputElement>(null);
  const picking = value.mode === "date";

  // Choosing "Pick a date" focuses the date field and opens the calendar where supported.
  const wasPicking = useRef(picking);
  useEffect(() => {
    if (picking && !wasPicking.current) {
      dateRef.current?.focus();
      try {
        dateRef.current?.showPicker();
      } catch {
        // Some browsers only allow showPicker() on a direct click; the field is still focused.
      }
    }
    wasPicking.current = picking;
  }, [picking]);

  return (
    <div className="flex flex-col gap-3">
      <ChoiceGroup
        legend="Day"
        name={name}
        value={value.mode}
        onChange={(mode) => onChange({ ...value, mode })}
        options={[
          { value: "today", label: "Today" },
          { value: "date", label: "Pick a date" },
        ]}
      />
      {picking && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-date`} className={labelStyle}>
            Date
          </label>
          <Input
            ref={dateRef}
            id={`${id}-date`}
            name={`${name}-date`}
            type="date"
            max={today()}
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="max-w-56"
          />
          {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
        </div>
      )}
    </div>
  );
}
