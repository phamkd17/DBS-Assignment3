"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { ChoiceGroup } from "./ui/ChoiceGroup";
import { DayPicker, INITIAL_DAY, resolveDay, type DayValue } from "./ui/DayPicker";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { useToast } from "./ui/Toast";
import { formatDay, today } from "@/lib/dates";
import { addEntry, getData, removeEntry, type Region } from "@/lib/storage";
import { dailyStretchStreak, formatDuration } from "@/lib/streaks";

const REGION_NAME: Record<Region, string> = { shoulder: "shoulder", lower: "lower body" };

/** Default one-tap amounts: shoulder 30 s, lower body 60 s. */
const QUICK: { region: Region; seconds: number; label: string }[] = [
  { region: "shoulder", seconds: 30, label: "+30 s Shoulder" },
  { region: "lower", seconds: 60, label: "+60 s Lower body" },
];

type Errors = { region?: string; duration?: string; day?: string };

/** One-tap stretch logging, plus a Custom panel for a different region, duration, or day. */
export function StretchLogger() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<"seconds" | "minutes">("minutes");
  const [day, setDay] = useState<DayValue>(INITIAL_DAY);
  const [errors, setErrors] = useState<Errors>({});

  function log(r: Region, seconds: number, date: string) {
    const id = addEntry("stretches", { date, region: r, seconds });
    const streak = dailyStretchStreak(getData(), r, today());
    const name = REGION_NAME[r];
    const when = date === today() ? "" : ` for ${formatDay(date)}`;
    const text =
      streak.status === "done" && streak.current === 1 && streak.best === 1 && !when
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
    setErrors(next);

    if (next.region || next.duration || next.day) {
      // Focus the first invalid field so keyboard and screen reader users land on it.
      const form = event.currentTarget as HTMLFormElement;
      const selector = next.region ? 'input[name="region"]' : next.duration ? 'input[name="amount"]' : 'input[name="day-date"]';
      const target = form.querySelector<HTMLInputElement>(selector);
      target?.focus();
      return;
    }

    log(region!, Math.round(seconds), (chosenDay as { day: string }).day);
    setOpen(false);
    setRegion(null);
    setAmount("");
    setDay(INITIAL_DAY);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <Chip key={q.region} onClick={() => log(q.region, q.seconds, today())}>
            {q.label}
          </Chip>
        ))}
        <Chip aria-expanded={open} aria-controls="stretch-custom" onClick={() => setOpen(!open)}>
          Custom <span aria-hidden="true">{open ? "▴" : "▾"}</span>
        </Chip>
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
            <Field label="Duration" error={errors.duration}>
              {(a11y) => (
                <Input
                  {...a11y}
                  name="amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={unit === "minutes" ? "1.5" : "90"}
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
            <Button type="submit">Log stretch</Button>
          </div>
        </form>
      )}
    </div>
  );
}
