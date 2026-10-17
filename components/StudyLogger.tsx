"use client";

import { useState, type FormEvent } from "react";
import { AmountPicker, EMPTY_AMOUNT, resolveAmount, type AmountValue } from "./ui/AmountPicker";
import { Button } from "./ui/Button";
import { DayPicker, INITIAL_DAY, resolveDay, type DayValue } from "./ui/DayPicker";
import { Field } from "./ui/Field";
import { Select } from "./ui/Input";
import { useToast } from "./ui/Toast";
import { formatDay, today } from "@/lib/dates";
import { FE_TOPICS, isTopicId, topicName } from "@/lib/fe-topics";
import { addEntry, getData, removeEntry, savePrefs, useRoutineData } from "@/lib/storage";
import { studyMinutesByDay, studyStreak, studyTier } from "@/lib/streaks";

const PRESETS = [
  { value: 15, label: "15" },
  { value: 30, label: "30" },
  { value: 60, label: "60" },
];

type Errors = { topic?: string; minutes?: string; day?: string };

/** Log FE study time: topic, minutes (15 / 30 / 60 / Custom), and day. */
export function StudyLogger() {
  const toast = useToast();
  const prefs = useRoutineData()?.prefs;
  // Edits made since the last log; until then the form shows your last saved choice.
  const [topicEdit, setTopic] = useState<string | null>(null);
  const [minutesEdit, setMinutes] = useState<AmountValue | null>(null);
  const topic = topicEdit ?? prefs?.studyTopic ?? "";
  const minutes = minutesEdit ?? prefs?.studyMinutes ?? EMPTY_AMOUNT;
  const [day, setDay] = useState<DayValue>(INITIAL_DAY);
  const [errors, setErrors] = useState<Errors>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = resolveAmount(minutes);
    const chosenDay = resolveDay(day);
    const next: Errors = {};
    if (!isTopicId(topic)) next.topic = "Pick a topic.";
    if (amount === null) next.minutes = "Pick how long you studied.";
    else if (Number.isNaN(amount) || amount <= 0) next.minutes = "Enter minutes, like 45.";
    else if (amount > 600) next.minutes = "That's over 10 hours. Check the number.";
    if ("error" in chosenDay) next.day = chosenDay.error;
    setErrors(next);

    if (next.topic || next.minutes || next.day || !isTopicId(topic) || amount === null || "error" in chosenDay) {
      // Focus the first invalid field so keyboard and screen reader users land on it.
      const selector = next.topic ? "select" : next.minutes ? (minutes.choice === "custom" ? 'input[inputmode="decimal"]' : 'input[name="minutes"]') : 'button[data-day][tabindex="0"]';
      event.currentTarget.querySelector<HTMLElement>(selector)?.focus();
      return;
    }

    const date = chosenDay.day;
    const id = addEntry("study", { date, topic, minutes: amount });
    const dayTotal = studyMinutesByDay(getData()).get(date) ?? 0;
    const tier = studyTier(dayTotal);
    const streak = studyStreak(getData(), today());
    const when = date === today() ? "" : ` for ${formatDay(date)}`;
    const extras = [tier && date === today() ? `${tier} day` : null, streak.status === "done" ? `${streak.current}-day streak` : null].filter(Boolean);
    toast(`Logged ${amount} min ${topicName(topic)}${when}${extras.length ? ` · ${extras.join(" · ")}` : ""}`, () => removeEntry("study", id));

    savePrefs({ studyTopic: topic, studyMinutes: minutes });
    setTopic(null);
    setMinutes(null);
    setDay(INITIAL_DAY);
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <Field label="Topic" error={errors.topic}>
        {(a11y) => (
          <Select {...a11y} value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="" disabled>
              Pick a topic
            </option>
            {FE_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <AmountPicker
        legend="Minutes"
        name="minutes"
        presets={PRESETS}
        customLabel="Custom minutes"
        customHint="Whole or decimal minutes, like 45 or 7.5."
        value={minutes}
        onChange={setMinutes}
        error={errors.minutes}
      />
      <DayPicker name="study-day" value={day} onChange={setDay} error={errors.day} />
      <div>
        <Button type="submit">Log study</Button>
      </div>
    </form>
  );
}
