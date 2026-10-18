"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { DayPicker, INITIAL_DAY, resolveDay, type DayValue } from "./ui/DayPicker";
import { Field, FieldError } from "./ui/Field";
import { Input, Select } from "./ui/Input";
import { useToast } from "./ui/Toast";
import { formatDay, today, type DayKey } from "@/lib/dates";
import { FE_TOPICS, isTopicId, topicName, type TopicId } from "@/lib/fe-topics";
import { getData, savePrefs, useRoutineData } from "@/lib/storage";
import { logStudy } from "@/lib/log-actions";

/** One-tap amounts; each logs the selected topic for today. */
const QUICK_MINUTES = [1, 5, 10, 15, 30, 60];

type Errors = {
  topic?: string;
  minutes?: string;
  day?: string;
  quick?: string;
};

type Props = {
  /** Start with the Custom panel open and keep it open after logging (used on detail pages). */
  customOpen?: boolean;
};

/** FE study logging: pick a topic, then one tap logs it. The ▾ button opens custom minutes + day. */
export function StudyLogger({ customOpen = false }: Props) {
  const toast = useToast();
  const prefs = useRoutineData()?.prefs;
  // The topic is saved the moment you pick it, so it's remembered even if you don't log.
  const topic = prefs?.studyTopic ?? "";
  const setTopic = (next: string) => {
    if (isTopicId(next)) savePrefs({ studyTopic: next });
  };
  const [open, setOpen] = useState(customOpen);
  // When on, amounts take time off the selected topic for that day (stored as a negative entry).
  // Saved, so it stays as you left it until you switch it off.
  const subtract = prefs?.studySubtract ?? false;
  const [custom, setCustom] = useState("");
  const [day, setDay] = useState<DayValue>(INITIAL_DAY);
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);

  /** Save a session and confirm it with today's total, tier, and streak. */
  function log(topicId: TopicId, amount: number, date: DayKey) {
    const { message, undo } = logStudy(topicId, amount, date, subtract);
    toast(message, undo);
  }


  /** When subtracting, you can't take off more than that topic has on that day. */
  function overSubtract(topicId: TopicId, amount: number, date: DayKey): string | undefined {
    if (!subtract) return undefined;
    const logged = getData()
      .study.filter((e) => e.date === date && e.topic === topicId)
      .reduce((sum, e) => sum + e.minutes, 0);
    if (amount <= logged) return undefined;
    const when = date === today() ? "today" : `on ${formatDay(date)}`;
    return logged > 0 ? `You've only logged ${logged} min of ${topicName(topicId)} ${when}.` : `There's no ${topicName(topicId)} time to subtract ${when}.`;
  }

  function quickAdd(minutes: number) {
    if (!isTopicId(topic)) {
      setErrors({ topic: "Pick a topic first." });
      formRef.current?.querySelector<HTMLSelectElement>("select")?.focus();
      return;
    }
    const tooMuch = overSubtract(topic, minutes, today());
    setErrors(tooMuch ? { quick: tooMuch } : {});
    if (tooMuch) return;
    log(topic, minutes, today());
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const typed = custom.trim();
    const amount = Number(typed);
    const chosenDay = resolveDay(day);
    const next: Errors = {};
    if (!isTopicId(topic)) next.topic = "Pick a topic first.";
    if (typed === "" || Number.isNaN(amount) || amount <= 0) next.minutes = "Enter minutes, like 45.";
    else if (amount > 600) next.minutes = "That's over 10 hours. Check the number.";
    if ("error" in chosenDay) next.day = chosenDay.error;
    if (!next.topic && !next.minutes && isTopicId(topic) && "day" in chosenDay) next.minutes = overSubtract(topic, amount, chosenDay.day);
    setErrors(next);

    if (next.topic || next.minutes || !isTopicId(topic) || "error" in chosenDay) {
      // Focus the first invalid field so keyboard and screen reader users land on it.
      const selector = next.topic ? "select" : next.minutes ? 'input[name="custom-minutes"]' : 'button[data-day][tabindex="0"]';
      event.currentTarget.querySelector<HTMLElement>(selector)?.focus();
      return;
    }

    log(topic, amount, chosenDay.day);
    setOpen(customOpen);
    setCustom("");
    setDay(INITIAL_DAY);
  }

  return (
    <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-5">
      <Field label="Topic" error={errors.topic}>
        {(a11y) => (
          <Select
            {...a11y}
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setErrors((prev) => ({ ...prev, topic: undefined }));
            }}
          >
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

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {QUICK_MINUTES.map((m) => (
            <Chip key={m} onClick={() => quickAdd(m)}>
              {subtract ? "−" : "+"}
              {m} min
            </Chip>
          ))}
          <Chip aria-label="More study options" aria-expanded={open} aria-controls="study-custom" onClick={() => setOpen(!open)} className="min-w-11 justify-center px-3 text-base">
            <span aria-hidden="true">{open ? "▴" : "▾"}</span>
          </Chip>
        </div>
        {errors.quick && <FieldError>{errors.quick}</FieldError>}
      </div>

      {open && (
        <div id="study-custom" className="flex flex-col gap-5 rounded-xl border border-ct-hairline p-4">
          <Field label={subtract ? "Minutes to subtract" : "Custom minutes"} hint="Whole or decimal minutes, like 45 or 7.5." error={errors.minutes}>
            {(a11y) => (
              <Input
                {...a11y}
                autoFocus={!customOpen}
                name="custom-minutes"
                inputMode="decimal"
                autoComplete="off"
                placeholder="e.g. 45"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="max-w-40"
              />
            )}
          </Field>
          <DayPicker name="study-day" value={day} onChange={setDay} error={errors.day} />
          <div>
            <Button type="submit">{subtract ? "Subtract study" : "Log study"}</Button>
          </div>
        </div>
      )}
    </form>
  );
}
