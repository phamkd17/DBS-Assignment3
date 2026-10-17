"use client";

import { useState, type FormEvent } from "react";
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
type Errors = { kcal?: string; day?: string };

/** Quick Add: eaten or burned, a calorie number, and an optional label. Informational only. */
export function CalorieLogger() {
  const toast = useToast();
  const prefs = useRoutineData()?.prefs;
  const [kindEdit, setKind] = useState<Kind | null>(null);
  const kind = kindEdit ?? prefs?.calorieKind ?? "eaten";
  const [kcal, setKcal] = useState("");
  const [label, setLabel] = useState("");
  const [day, setDay] = useState<DayValue>(INITIAL_DAY);
  const [errors, setErrors] = useState<Errors>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const typed = kcal.trim().replace(/,/g, "");
    const value = Number(typed);
    const chosenDay = resolveDay(day);
    const next: Errors = {};
    if (typed === "" || !Number.isInteger(value) || value <= 0) next.kcal = "Enter calories as a whole number, like 250.";
    else if (value > 5000) next.kcal = "That's over 5,000 kcal. Check the number.";
    if ("error" in chosenDay) next.day = chosenDay.error;
    setErrors(next);

    if (next.kcal || "error" in chosenDay) {
      event.currentTarget.querySelector<HTMLElement>(next.kcal ? 'input[name="kcal"]' : 'button[data-day][tabindex="0"]')?.focus();
      return;
    }

    const date = chosenDay.day;
    const id = addEntry("calories", { date, kind, kcal: value, label: label.trim() });
    savePrefs({ calorieKind: kind });
    const { net } = netCalories(getData(), date);
    const when = date === today() ? "today" : formatDay(date);
    const what = label.trim() ? ` ${label.trim()}` : "";
    toast(`${kind === "eaten" ? "Ate" : "Burned"} ${formatKcal(value)}${what} · Net ${when}: ${formatKcal(net)}`, () => removeEntry("calories", id));

    setKcal("");
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
      <Field label="Calories" error={errors.kcal}>
        {(a11y) => (
          <Input {...a11y} name="kcal" inputMode="numeric" autoComplete="off" placeholder="250" value={kcal} onChange={(e) => setKcal(e.target.value)} className="max-w-40" />
        )}
      </Field>
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
