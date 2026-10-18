"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { ChoiceGroup } from "./ui/ChoiceGroup";
import { DayPicker, INITIAL_DAY, resolveDay, type DayValue } from "./ui/DayPicker";
import { Field, FieldError } from "./ui/Field";
import { Input } from "./ui/Input";
import { useToast } from "./ui/Toast";
import { formatDay, today, type DayKey } from "@/lib/dates";
import { addEntry, getData, removeEntry, savePrefs, useRoutineData, type Region } from "@/lib/storage";
import { dailyStretchStreak, formatDuration } from "@/lib/streaks";

const REGION_NAME: Record<Region, string> = { shoulder: "shoulder", lower: "lower body" };

/** Default one-tap amounts: shoulder 30 s, lower body 60 s. */
const QUICK: { region: Region; seconds: number; label: string }[] = [
  { region: "shoulder", seconds: 30, label: "30 s Shoulder" },
  { region: "lower", seconds: 60, label: "60 s Lower body" },
];

type Errors = { region?: string; duration?: string; day?: string; quick?: string };

/** One-tap stretch logging, plus a Custom panel for a different region, duration, or day. */
export function StretchLogger() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const prefs = useRoutineData()?.prefs;
  // Edits made since the last custom log; until then the panel shows your last saved choice.
  const [regionEdit, setRegion] = useState<Region | null>(null);
  const [amountEdit, setAmount] = useState<string | null>(null);
  const [unitEdit, setUnit] = useState<"seconds" | "minutes" | null>(null);
  const region = regionEdit ?? prefs?.stretchRegion ?? null;
  const amount = amountEdit ?? prefs?.stretchAmount ?? "";
  const unit = unitEdit ?? prefs?.stretchUnit ?? "minutes";
  const [day, setDay] = useState<DayValue>(INITIAL_DAY);
  const [errors, setErrors] = useState<Errors>({});
  // When on, amounts take time off that region for the day (stored as a negative entry).
  // Saved, so it stays as you left it until you switch it off. The switch itself is SubtractSwitch.
  const subtract = prefs?.stretchSubtract ?? false;

  /** When subtracting, you can't take off more than that region has on that day. */
  function overSubtract(r: Region, seconds: number, date: DayKey): string | undefined {
    if (!subtract) return undefined;
    const logged = getData()
      .stretches.filter((e) => e.date === date && e.region === r)
      .reduce((sum, e) => sum + e.seconds, 0);
    if (seconds <= logged) return undefined;
    const when = date === today() ? "today" : `on ${formatDay(date)}`;
    return logged > 0 ? `You've only logged ${formatDuration(logged)} of ${REGION_NAME[r]} ${when}.` : `There's no ${REGION_NAME[r]} time to subtract ${when}.`;
  }

  function quickLog(r: Region, seconds: number) {
    const tooMuch = overSubtract(r, seconds, today());
    setErrors(tooMuch ? { quick: tooMuch } : {});
    if (!tooMuch) log(r, seconds, today());
  }

  function log(r: Region, seconds: number, date: string) {
    const id = addEntry("stretches", { date, region: r, seconds: subtract ? -seconds : seconds });
    const streak = dailyStretchStreak(getData(), r, today());
    const name = REGION_NAME[r];
    const when = date === today() ? "" : ` for ${formatDay(date)}`;
    const text = subtract
      ? `Removed ${formatDuration(seconds)} ${name}${when}`
      : streak.status === "done" && streak.current === 1 && streak.best === 1 && !when
        ? `1-day ${name} streak!`
        : `Logged ${formatDuration(seconds)} ${name}${when}${streak.status === "done" ? ` · ${streak.current}-day streak` : ""}`;
    toast(text, () => removeEntry("stretches", id));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const typed = amount.trim();
    const seconds = Number(typed) * (unit === "minutes" ? 60 : 1);
    const next: Errors = {};
    if (!region) next.region = "Pick shoulder or lower body.";
    if (typed === "") next.duration = unit === "minutes" ? "Enter how long you stretched, like 1.5." : "Enter how long you stretched, like 90.";
    else if (Number.isNaN(seconds) || seconds <= 0) next.duration = unit === "minutes" ? "Enter a number of minutes, like 1.5." : "Enter a number of seconds, like 90.";
    else if (seconds > 120 * 60) next.duration = "That's over 2 hours. Check the number.";
    const chosenDay = resolveDay(day);
    if ("error" in chosenDay) next.day = chosenDay.error;
    else if (region && !next.duration) next.duration = overSubtract(region, Math.round(seconds), chosenDay.day);
    setErrors(next);

    if (next.region || next.duration || next.day) {
      // Focus the first invalid field so keyboard and screen reader users land on it.
      const form = event.currentTarget as HTMLFormElement;
      const selector = next.region ? 'input[name="region"]' : next.duration ? 'input[name="amount"]' : 'button[data-day][tabindex="0"]';
      const target = form.querySelector<HTMLElement>(selector);
      target?.focus();
      return;
    }

    log(region!, Math.round(seconds), (chosenDay as { day: string }).day);
    savePrefs({ stretchRegion: region!, stretchAmount: amount, stretchUnit: unit });
    setOpen(false);
    setRegion(null);
    setAmount(null);
    setUnit(null);
    setDay(INITIAL_DAY);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <Chip key={q.region} onClick={() => quickLog(q.region, q.seconds)}>
              {subtract ? "−" : "+"}
              {q.label}
            </Chip>
          ))}
          <Chip aria-expanded={open} aria-controls="stretch-custom" onClick={() => setOpen(!open)}>
            Custom <span aria-hidden="true">{open ? "▴" : "▾"}</span>
          </Chip>
        </div>
        {errors.quick && <FieldError>{errors.quick}</FieldError>}
      </div>

      {open && (
        <form id="stretch-custom" noValidate onSubmit={submit} className="flex flex-col gap-5 rounded-xl border border-ct-hairline p-4">
          <ChoiceGroup
            legend="Region"
            name="region"
            value={region}
            onChange={setRegion}
            error={errors.region}
            options={[
              { value: "shoulder", label: "Shoulder" },
              { value: "lower", label: "Lower body" },
            ]}
          />
          <div className="flex flex-col gap-3">
            <Field label={subtract ? "Duration to subtract" : "Duration"} error={errors.duration}>
              {(a11y) => (
                <Input
                  {...a11y}
                  name="amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={unit === "minutes" ? "e.g. 1.5" : "e.g. 90"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="max-w-40"
                />
              )}
            </Field>
            <ChoiceGroup
              legend="Unit"
              name="unit"
              value={unit}
              onChange={setUnit}
              options={[
                { value: "seconds", label: "Seconds" },
                { value: "minutes", label: "Minutes" },
              ]}
            />
          </div>
          <DayPicker name="day" value={day} onChange={setDay} error={errors.day} />
          <div>
            <Button type="submit">{subtract ? "Subtract stretch" : "Log stretch"}</Button>
          </div>
        </form>
      )}
    </div>
  );
}
