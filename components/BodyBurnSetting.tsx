"use client";

import { useState, type KeyboardEvent } from "react";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { savePrefs, useRoutineData } from "@/lib/storage";
import { DEFAULT_DAILY_BURN, formatKcal } from "@/lib/streaks";

/**
 * Shows and edits the daily body burn. Not a <form>, because it sits inside the calorie form;
 * Enter in the field saves.
 */
export function BodyBurnSetting() {
  const data = useRoutineData();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();
  const dailyBurn = data?.prefs.dailyBurn ?? DEFAULT_DAILY_BURN;

  function save() {
    const value = Number(draft.trim().replace(/,/g, ""));
    if (!Number.isInteger(value) || value < 500 || value > 10000) {
      setError("Enter your daily burn as a whole number, like 2,052.");
      return;
    }
    savePrefs({ dailyBurn: value });
    setError(undefined);
    setEditing(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3">
        <Field label="Daily body burn (kcal)" hint="What your body burns in a full day. It's counted evenly through the day." error={error}>
          {(a11y) => (
            <Input {...a11y} autoFocus inputMode="numeric" autoComplete="off" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} className="max-w-40" />
          )}
        </Field>
        <div className="flex gap-3">
          <Button onClick={save}>Save</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setEditing(false);
              setError(undefined);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <p className="flex flex-wrap items-center gap-x-2 font-ct-sans text-sm text-ct-muted">
      Body burn: {formatKcal(dailyBurn)} a day, added as the day goes.
      <Button
        variant="ghost"
        aria-label="Edit daily body burn"
        onClick={() => {
          setDraft(String(dailyBurn));
          setEditing(true);
        }}
      >
        Edit
      </Button>
    </p>
  );
}
