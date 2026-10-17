"use client";

// Temporary: a preview of the shared components for the Step 4–5 review.
// Replaced by the real Today page in Step 6.

import { Card } from "./ui/Card";
import { StretchLogger } from "./StretchLogger";
import { StudyLogger } from "./StudyLogger";
import { WeekProgress } from "./WeekProgress";
import { useRoutineData } from "@/lib/storage";

export function ComponentPreview() {
  const data = useRoutineData();

  return (
    <>
      <p className="font-ct-sans text-sm text-ct-muted">
        Component preview · storage {data === null ? "loading…" : `ready (${data.stretches.length + data.study.length + data.calories.length} entries)`}
      </p>

      <Card className="flex flex-col gap-4">
        <h2 className="font-ct-serif text-2xl italic">This week</h2>
        <WeekProgress />
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-ct-serif text-2xl italic">Stretch</h2>
        <StretchLogger />
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-ct-serif text-2xl italic">FE study</h2>
        <StudyLogger />
      </Card>
    </>
  );
}
