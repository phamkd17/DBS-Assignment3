"use client";

import { useState, type FormEvent } from "react";
import { AmountPicker, EMPTY_AMOUNT, resolveAmount, type AmountValue } from "./ui/AmountPicker";
import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { ChoiceGroup } from "./ui/ChoiceGroup";
import { useToast } from "./ui/Toast";
import { addDays, today } from "@/lib/dates";
import { addEntry, getData, removeEntry, type Region } from "@/lib/storage";
import { dailyStretchStreak, formatDuration } from "@/lib/streaks";

const REGION_NAME: Record<Region, string> = { shoulder: "shoulder", lower: "lower body" };

/** Default one-tap amounts: shoulder 30 s, lower body 60 s. */
const QUICK: { region: Region; seconds: number; label: string }[] = [
  { region: "shoulder", seconds: 30, label: "+30 s Shoulder" },
  { region: "lower", seconds: 60, label: "+60 s Lower body" },
];

const DURATIONS = [
  { value: 30, label: "30 s" },
  { value: 60, label: "1 min" },
  { value: 120, label: "2 min" },
  { value: 240, label: "4 min" },
];

type Errors = { region?: string; duration?: string };

/** One-tap stretch logging, plus a Custom panel for a different region, duration, or day. */
export function StretchLogger() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [duration, setDuration] = useState<AmountValue>(EMPTY_AMOUNT);
  const [day, setDay] = useState<"today" | "yesterday">("today");
  const [errors, setErrors] = useState<Errors>({});

  function log(r: Region, seconds: number, date: string) {
    const id = addEntry("stretches", { date, region: r, seconds });
    const streak = dailyStretchStreak(getData(), r, today());
    const name = REGION_NAME[r];
    const text =
      streak.status === "done" && streak.current === 1 && streak.best === 1
        ? `1-day ${name} streak!`
        : `Logged ${formatDuration(seconds)} ${name}${streak.status === "done" ? ` · ${streak.current}-day streak` : ""}`;
    toast(text, () => removeEntry("stretches", id));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const seconds = resolveAmount(duration, 60);
    const next: Errors = {};
    if (!region) next.region = "Pick shoulder or lower body.";
    if (seconds === null) next.duration = "Pick how long you stretched.";
    else if (Number.isNaN(seconds) || seconds <= 0) next.duration = "Enter minutes, like 1.5.";
    else if (seconds > 120 * 60) next.duration = "That's over 2 hours. Check the number.";
    setErrors(next);

    if (next.region || next.duration) {
      // Focus the first invalid field so keyboard and screen reader users land on it.
      const form = event.currentTarget as HTMLFormElement;
      const selector = next.region ? 'input[name="region"]' : duration.choice === "custom" ? 'input[inputmode="decimal"]' : 'input[name="duration"]';
      const target = form.querySelector<HTMLInputElement>(selector);
      target?.focus();
      return;
    }

    log(region!, Math.round(seconds!), day === "today" ? today() : addDays(today(), -1));
    setOpen(false);
    setRegion(null);
    setDuration(EMPTY_AMOUNT);
    setDay("today");
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
          <AmountPicker
            legend="Duration"
            name="duration"
            presets={DURATIONS}
            customLabel="Custom minutes"
            customHint="Like 1.5 for a minute and a half."
            value={duration}
            onChange={setDuration}
            error={errors.duration}
          />
          <ChoiceGroup
            legend="Day"
            name="day"
            value={day}
            onChange={setDay}
            options={[
              { value: "today", label: "Today" },
              { value: "yesterday", label: "Yesterday" },
            ]}
          />
          <div>
            <Button type="submit">Log stretch</Button>
          </div>
        </form>
      )}
    </div>
  );
}
