"use client";

// Temporary: a preview of the shared components for the Step 4–5 review.
// Replaced by the real Today page in Step 6.

import { Card } from "./ui/Card";
import { CalorieLogger } from "./CalorieLogger";
import { NetCalories } from "./NetCalories";
import { StretchLogger } from "./StretchLogger";
import { SubtractSwitch } from "./SubtractSwitch";
import { StudyLogger } from "./StudyLogger";
import { StudyMinutesToday } from "./StudyMinutesToday";
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
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-ct-serif text-2xl italic">Stretch</h2>
          <SubtractSwitch pref="stretchSubtract" />
        </div>
        <StretchLogger />
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-ct-serif text-2xl italic">
            FE study
            <StudyMinutesToday />
          </h2>
          <SubtractSwitch pref="studySubtract" />
        </div>
        <StudyLogger />
      </Card>

      <Card className="flex flex-col gap-5">
        <h2 className="font-ct-serif text-2xl italic">Calories</h2>
        <NetCalories />
        <CalorieLogger />
      </Card>
    </>
  );
}
