"use client";

// Temporary: a preview of the shared components for the Step 4–5 review.
// Replaced by the real Today page in Step 6.

import { useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { StretchLogger } from "./StretchLogger";
import { AmountPicker, EMPTY_AMOUNT, resolveAmount, type AmountValue } from "./ui/AmountPicker";
import { Field } from "./ui/Field";
import { Select } from "./ui/Input";
import { ProgressBar } from "./ui/ProgressBar";
import { useToast } from "./ui/Toast";
import { FE_TOPICS } from "@/lib/fe-topics";
import { useRoutineData } from "@/lib/storage";

export function ComponentPreview() {
  const toast = useToast();
  const data = useRoutineData();
  const [minutes, setMinutes] = useState<AmountValue>(EMPTY_AMOUNT);
  const [error, setError] = useState<string>();

  return (
    <>
      <p className="font-ct-sans text-sm text-ct-muted">
        Component preview · storage {data === null ? "loading…" : `ready (${data.stretches.length + data.study.length + data.calories.length} entries)`}
      </p>

      <Card className="flex flex-col gap-4">
        <h2 className="font-ct-serif text-2xl italic">This week</h2>
        <ProgressBar label="Shoulder" value={360} max={600} valueText="6 / 10 min" />
        <ProgressBar label="Lower body" value={600} max={600} valueText="10 / 10 min" />
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-ct-serif text-2xl italic">Stretch</h2>
        <StretchLogger />
      </Card>

      <Card>
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            const amount = resolveAmount(minutes);
            if (amount === null) setError("Pick how long you studied.");
            else if (Number.isNaN(amount) || amount <= 0) setError("Enter minutes, like 45.");
            else if (amount > 600) setError("That's over 10 hours. Check the number.");
            else {
              setError(undefined);
              toast(`Logged ${amount} min`);
            }
          }}
        >
          <Field label="Topic">
            {(a11y) => (
              <Select {...a11y} defaultValue="">
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
            presets={[
              { value: 15, label: "15" },
              { value: 30, label: "30" },
              { value: 60, label: "60" },
            ]}
            customLabel="Custom minutes"
            customHint="Whole or decimal minutes, like 45 or 7.5."
            value={minutes}
            onChange={setMinutes}
            error={error}
          />
          <div className="flex gap-3">
            <Button type="submit">Log it</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
