"use client";

import { useState, type FormEvent } from "react";
import { AmountPicker, EMPTY_AMOUNT, resolveAmount, type AmountValue } from "./ui/AmountPicker";
import { Button } from "./ui/Button";
import { ChoiceGroup } from "./ui/ChoiceGroup";
import { DayPicker, INITIAL_DAY, resolveDay, type DayValue } from "./ui/DayPicker";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { useToast } from "./ui/Toast";
import { formatDay, today } from "@/lib/dates";
import { addEntry, getData, removeEntry, savePrefs, useRoutineData, type CalorieEntry } from "@/lib/storage";
import { formatKcal, netCalories } from "@/lib/streaks";

type Kind = CalorieEntry["kind"];

const PRESETS = [
  { value: 100, label: "100" },
  { value: 250, label: "250" },
  { value: 500, label: "500" },
];
type Errors = { kcal?: string; day?: string };

/** Quick Add: eaten or burned, a calorie number, and an optional label. Informational only. */
export function CalorieLogger() {
  const toast = useToast();
  const prefs = useRoutineData()?.prefs;
  const [kindEdit, setKind] = useState<Kind | null>(null);
  const kind = kindEdit ?? prefs?.calorieKind ?? "eaten";
  const [kcal, setKcal] = useState<AmountValue>(EMPTY_AMOUNT);
  const [label, setLabel] = useState("");
  const [day, setDay] = useState<DayValue>(INITIAL_DAY);
  const [errors, setErrors] = useState<Errors>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Allow "1,200" in the custom field.
    const value = resolveAmount({ ...kcal, custom: kcal.custom.replace(/,/g, "") });
    const chosenDay = resolveDay(day);
    const next: Errors = {};
    if (value === null) next.kcal = "Pick an amount, or tap Custom to type one.";
    else if (!Number.isInteger(value) || value <= 0) next.kcal = "Enter calories as a whole number, like 250.";
    else if (value > 5000) next.kcal = "That's over 5,000 kcal. Check the number.";
    if ("error" in chosenDay) next.day = chosenDay.error;
    setErrors(next);

    if (next.kcal || value === null || "error" in chosenDay) {
      const selector = next.kcal ? (kcal.choice === "custom" ? 'input[inputmode="decimal"]' : 'input[name="kcal"]') : 'button[data-day][tabindex="0"]';
      event.currentTarget.querySelector<HTMLElement>(selector)?.focus();
      return;
    }

    const date = chosenDay.day;
    const id = addEntry("calories", { date, kind, kcal: value, label: label.trim() });
    savePrefs({ calorieKind: kind });
    const { net } = netCalories(getData(), date);
    const when = date === today() ? "today" : formatDay(date);
    const what = label.trim() ? ` ${label.trim()}` : "";
    toast(`${kind === "eaten" ? "Ate" : "Burned"} ${formatKcal(value)}${what} · Net ${when}: ${formatKcal(net)}`, () => removeEntry("calories", id));

    setKcal(EMPTY_AMOUNT);
    setLabel("");
    setKind(null);
    setDay(INITIAL_DAY);
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <ChoiceGroup
        legend="Type"
        name="kind"
        value={kind}
        onChange={setKind}
        options={[
          { value: "eaten", label: "Eaten" },
          { value: "burned", label: "Burned" },
        ]}
      />
      <AmountPicker
        legend="Calories"
        name="kcal"
        presets={PRESETS}
        customLabel="Custom calories"
        customHint="A whole number, like 1,200."
        value={kcal}
        onChange={setKcal}
        error={errors.kcal}
      />
      <Field label="Label (optional)" hint={kind === "eaten" ? "Like Oatmeal or Lunch." : "Like Run or Bike ride."}>
        {(a11y) => <Input {...a11y} name="label" maxLength={60} autoComplete="off" value={label} onChange={(e) => setLabel(e.target.value)} />}
      </Field>
      <DayPicker name="calorie-day" value={day} onChange={setDay} error={errors.day} />
      <div>
        <Button type="submit">{kind === "eaten" ? "Add eaten" : "Add burned"}</Button>
      </div>
    </form>
  );
}
