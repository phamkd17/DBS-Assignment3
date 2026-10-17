"use client";

// Temporary: a preview of the shared components for the Step 4–5 review.
// Replaced by the real Today page in Step 6.

import { useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Chip } from "./ui/Chip";
import { ChoiceGroup } from "./ui/ChoiceGroup";
import { Field } from "./ui/Field";
import { Input, Select } from "./ui/Input";
import { ProgressBar } from "./ui/ProgressBar";
import { useToast } from "./ui/Toast";
import { FE_TOPICS } from "@/lib/fe-topics";
import { useRoutineData } from "@/lib/storage";

export function ComponentPreview() {
  const toast = useToast();
  const data = useRoutineData();
  const [region, setRegion] = useState<"shoulder" | "lower" | null>(null);
  const [minutes, setMinutes] = useState("");
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
        <h2 className="font-ct-serif text-2xl italic">Quick log</h2>
        <div className="flex flex-wrap gap-2">
          <Chip onClick={() => toast("Logged 30 s shoulder", () => toast("Undone"))}>+30 s Shoulder</Chip>
          <Chip onClick={() => toast("Logged 60 s lower body", () => toast("Undone"))}>+60 s Lower body</Chip>
          <Chip aria-pressed>15 min</Chip>
        </div>
      </Card>

      <Card>
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setError(minutes.trim() === "" || Number.isNaN(Number(minutes)) ? "Enter minutes, like 15." : undefined);
          }}
        >
          <ChoiceGroup
            legend="Region"
            name="region"
            value={region}
            onChange={setRegion}
            options={[
              { value: "shoulder", label: "Shoulder" },
              { value: "lower", label: "Lower body" },
            ]}
          />
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
          <Field label="Minutes" hint="Submit empty to see the error." error={error}>
            {(a11y) => <Input {...a11y} inputMode="decimal" value={minutes} onChange={(e) => setMinutes(e.target.value)} />}
          </Field>
          <div className="flex gap-3">
            <Button type="submit">Log it</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
