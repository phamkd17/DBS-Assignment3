"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { toDayKey } from "@/lib/dates";
import { savePrefs, useRoutineData } from "@/lib/storage";
import { DEFAULT_DAILY_BURN, formatKcal, netCalories } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

/** Today's net so far: eaten − body burn (accrues through the day) − logged exercise. No goal. */
export function NetCalories() {
  const data = useRoutineData();
  const now = useNow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();

  if (!data || !now) return <div className="h-32" aria-hidden="true" />;

  const dailyBurn = data.prefs.dailyBurn ?? DEFAULT_DAILY_BURN;
  const { eaten, exercise, bodyBurn, net } = netCalories(data, toDayKey(now), now);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(draft.trim().replace(/,/g, ""));
    if (!Number.isInteger(value) || value < 500 || value > 10000) {
      setError("Enter your daily burn as a whole number, like 2,052.");
      event.currentTarget.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    savePrefs({ dailyBurn: value });
    setError(undefined);
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-ct-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ct-muted">Net so far today</p>
        <p className="font-ct-serif text-5xl italic text-ct-text">{formatKcal(net)}</p>
        <p className="font-ct-sans text-sm text-ct-linen">
          {formatKcal(eaten)} eaten − {formatKcal(bodyBurn)} body burn − {formatKcal(exercise)} exercise
        </p>
      </div>

      {editing ? (
        <form noValidate onSubmit={save} className="flex flex-col gap-3">
          <Field label="Daily body burn (kcal)" hint="What your body burns in a full day. It's counted evenly through the day." error={error}>
            {(a11y) => <Input {...a11y} inputMode="numeric" autoComplete="off" value={draft} onChange={(e) => setDraft(e.target.value)} className="max-w-40" />}
          </Field>
          <div className="flex gap-3">
            <Button type="submit">Save</Button>
            <Button variant="secondary" onClick={() => { setEditing(false); setError(undefined); }}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <p className="flex flex-wrap items-center gap-x-2 font-ct-sans text-sm text-ct-muted">
          Body burn: {formatKcal(dailyBurn)} a day, added as the day goes.
          <Button variant="ghost" aria-label="Edit daily body burn" onClick={() => { setDraft(String(dailyBurn)); setEditing(true); }}>
            Edit
          </Button>
        </p>
      )}
    </div>
  );
}
