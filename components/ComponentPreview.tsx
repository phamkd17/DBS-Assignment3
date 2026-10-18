"use client";

// Temporary: a preview of the shared components for the Step 4–5 review.
// Replaced by the real Today page in Step 6.

import { Card } from "./ui/Card";
import { CardHeading } from "./CardHeading";
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
        <CardHeading title="This week" href="/progress" />
        <WeekProgress />
      </Card>

      <Card className="flex flex-col gap-4">
        <CardHeading title="Stretch" href="/stretch" action={<SubtractSwitch pref="stretchSubtract" />} />
        <StretchLogger />
      </Card>

      <Card className="flex flex-col gap-4">
        <CardHeading title="FE study" href="/study" aside={<StudyMinutesToday />} action={<SubtractSwitch pref="studySubtract" />} />
        <StudyLogger />
      </Card>

      <Card className="flex flex-col gap-5">
        <CardHeading title="Calories" href="/calories" />
        <NetCalories />
        <CalorieLogger />
      </Card>
    </>
  );
}
